# Application source sections

The application currently runs as one classic browser script. Its global lexical scope and declaration hoisting are shared across many equipment, audio, and UI routines. To preserve that behavior while splitting the code into maintainable files, these sections are concatenated in order into the root `script.js` file.

Edit the numbered source files here, then rebuild the browser entry point:

```sh
node tools/build-script.cjs
```

Use the state domains initialized by `01-state-and-preferences.js`: `appState.project`, `appState.canvas`, `appState.audio`, `appState.preferences`, and `appState.interface`. Mutations that affect domain state should go through the named `appStateStore.actions` methods. Spotify authorization and playback state are owned by `SpotifyCoverflow` in `src/modules/spotify-coverflow.js`.

Device side effects are ended through `disposeDeviceRuntime` in `12-device-interactions.js` before the device leaves the project. It invalidates pending capture requests, stops microphone tracks and meters, and disposes device audio, animation, and controller resources. Spotify coverflow mount disposal also cancels its pending animation frame and ignores later refreshes.

Check that the committed browser entry point matches the sources:

```sh
node tools/build-script.cjs --check
```

Keep the order in `tools/build-script.cjs` unchanged unless the shared-scope dependencies have been reviewed. The sections are not loaded independently; the generated output deliberately remains one classic script so existing references, event callbacks, and hoisted declarations continue to work as before.

`10-classic-preamp.js` contains the frontal wood-console preamp presentation and per-channel tone/channel-mode controls. It reuses the integrated preamp graph, hardware bindings, output circuits and project storage.
