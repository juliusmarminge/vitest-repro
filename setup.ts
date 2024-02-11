import type { IncomingMessage, ServerResponse } from "node:http";
import {
	createTRPCClient,
	experimental_formDataLink,
	httpLink,
	loggerLink,
	splitLink,
} from "@trpc/client";
import { initTRPC } from "@trpc/server";
import {
	experimental_createMemoryUploadHandler,
	experimental_parseMultipartFormData,
	nodeHTTPFormDataContentTypeHandler,
} from "@trpc/server/adapters/node-http/content-type/form-data";
import { nodeHTTPJSONContentTypeHandler } from "@trpc/server/adapters/node-http/content-type/json";
import { createHTTPServer } from "@trpc/server/adapters/standalone";
import { zfd } from "zod-form-data";

export function setupServer() {
	const t = initTRPC
		.context<{ req: IncomingMessage; res: ServerResponse<IncomingMessage> }>()
		.create();

	const router = t.router({
		uploadFile: t.procedure
			.use(async (opts) => {
				// console.log("parsing fd", opts.ctx.req);
				const formData = await experimental_parseMultipartFormData(
					opts.ctx.req,
					experimental_createMemoryUploadHandler(),
				);
				return opts.next({
					getRawInput: async () => formData,
				});
			})
			.input(
				zfd.formData({
					file: zfd.file(),
				}),
			)
			.mutation(async ({ input }) => {
				return {
					file: {
						name: input.file.name,
						type: input.file.type,
						file: await input.file.text(),
					},
				};
			}),
	});

	const httpServer = createHTTPServer({
		router,
		createContext: (opts) => {
			return { req: opts.req, res: opts.res };
		},
		experimental_contentTypeHandlers: [
			nodeHTTPFormDataContentTypeHandler(),
			nodeHTTPJSONContentTypeHandler(),
		],
	});
	const server = httpServer.listen(0);
	const port = (server.address() as { port: number })?.port;

	const client = createTRPCClient<typeof router>({
		links: [
			loggerLink(),
			splitLink({
				condition: (op) => op.input instanceof FormData,
				true: experimental_formDataLink({
					url: `http://localhost:${port}`,
				}),
				false: httpLink({
					url: `http://localhost:${port}`,
				}),
			}),
		],
	});

	return {
		server,
		client,
	};
}
