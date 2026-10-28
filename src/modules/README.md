# Browser support modules

These standalone classic scripts provide focused features used by the application entry point. `index.html` loads them before the generated `script.js`, preserving their existing globals and initialization order.

- `adapter-design.js`: adapter rendering and rotation behavior.
- `audio-interfaces.js`: audio-interface device behavior.
- `application-state.js`: project, canvas, audio, preferences, and interface state domains, with named actions and a compatibility facade for tests and gradual migration.
- `guided-access.js`: guided tutorial and example setups.
- `spotify-coverflow.js`: Spotify authorization, albums, and playback.

Paths in HTML are relative to the repository root. Keep asset URLs root-relative or resolve them from the page URL so moving a module does not change where assets are loaded from.

Application modules consume `appState.project`, `appState.canvas`, `appState.audio`, `appState.preferences`, and `appState.interface`. State changes with external effects should go through `appStateStore.actions`; project persistence remains in `18-project-storage.js`. Spotify authorization and playback already live in the isolated `SpotifyCoverflow` module and are not duplicated in the application store.

## Signal history

`signal-history.js` contains the shared RMS/peak, dBFS, classification and bounded-history calculations. The application adapter in `../app/06-signal-history-ui.js` owns read-only Web Audio taps and the inspector view. It measures the selected connected component only while the history panel is visible, releases taps on panel closure, hidden documents and device removal, and keeps samples out of project persistence. Stereo channels are measured separately before taking the maximum to avoid phase cancellation. Input taps observe arriving cables before source selectors; output taps observe actual output nodes. Peak values at or above 0 dBFS are reported separately from modeled electrical clipping. Spotify bypasses the app's DSP and is explicitly identified as unavailable for measurement.
