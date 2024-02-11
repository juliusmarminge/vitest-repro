# vitest-repro

"Minimal" repro of vitest issues with jsdom and streaming multipart formdata.

> [!NOTE] Original issue: https://github.com/trpc/trpc/pull/5165#discussion_r1482661949

## Steps to reproduce

```bash
pnpm i
pnpm vitest
```

You'll get a `fetch failed` error that originates from an invalid `Uint8Array` comparison in `@web3-storage/multipart-parser`, that an `a instanceof Uint8Array` returns `false` when it should be `true`.

```bash
[@web3-storage/multipart-parser]: a =  Uint8Array(34) [
   45,  45,  45, 45,  45, 45, 102, 111,
  114, 109, 100, 97, 116, 97,  45, 117,
  110, 100, 105, 99, 105, 45,  48,  51,
   51,  51,  55, 49,  56, 53,  49,  56,
   49,  52
] a instanceof Uint8Array =  true
[@web3-storage/multipart-parser]: a =  Uint8Array(167) [
   45,  45,  45,  45,  45,  45, 102, 111, 114, 109, 100,  97,
  116,  97,  45, 117, 110, 100, 105,  99, 105,  45,  48,  51,
   51,  51,  55,  49,  56,  53,  49,  56,  49,  52,  13,  10,
   67, 111, 110, 116, 101, 110, 116,  45,  68, 105, 115, 112,
  111, 115, 105, 116, 105, 111, 110,  58,  32, 102, 111, 114,
  109,  45, 100,  97, 116,  97,  59,  32, 110,  97, 109, 101,
   61,  34, 102, 105, 108, 101,  34,  59,  32, 102, 105, 108,
  101, 110,  97, 109, 101,  61,  34,  98, 111,  98,  46, 116,
  120, 116,  34,  13,
  ... 67 more items
] a instanceof Uint8Array =  false
```

This seems to be caused when using the `jsdom` environment in Vitest. Disabling that environment in `vite.config.js` makes the test pass.

```diff
-  environment: "jsdom",
+  // environment: "jsdom",
```

## Expected behavior

All `a instanceof Uint8Array` should return `true` when using the `jsdom` environment, which would make the test pass.

## Additional notes

Maybe this issue should be filed somewhere else, idk. Starting here since the runner is Vitest...