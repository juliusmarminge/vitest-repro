import { expect, test } from "vitest";
import { setupServer } from "./setup";

import "@testing-library/jest-dom/vitest";

test("should upload a file", async () => {
	const { server, client } = setupServer();

	const form = new FormData();
	form.append(
		"file",
		new File(["hi bob"], "bob.txt", {
			type: "text/plain",
		}),
	);

	const fileContents = await client.uploadFile.mutate(form);

	expect(fileContents).toMatchInlineSnapshot(`
		{
		  "file": {
		    "file": "hi bob",
		    "name": "bob.txt",
		    "type": "text/plain",
		  },
		}
	`);

	server.close();
});
