# Application source sections

The application currently runs as one classic browser script. Its global lexical scope and declaration hoisting are shared across many equipment, audio, and UI routines. To preserve that behavior while splitting the code into maintainable files, these sections are concatenated in order into the root `script.js` file.

Edit the numbered source files here, then rebuild the browser entry point:

```sh
node tools/build-script.cjs
```

Check that the committed browser entry point matches the sources:

```sh
node tools/build-script.cjs --check
```

Keep the order in `tools/build-script.cjs` unchanged unless the shared-scope dependencies have been reviewed. The sections are not loaded independently; the generated output deliberately remains one classic script so existing references, event callbacks, and hoisted declarations continue to work as before.
