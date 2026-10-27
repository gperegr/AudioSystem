# Browser support modules

These standalone classic scripts provide focused features used by the application entry point. `index.html` loads them before the generated `script.js`, preserving their existing globals and initialization order.

- `adapter-design.js`: adapter rendering and rotation behavior.
- `audio-interfaces.js`: audio-interface device behavior.
- `application-state.js`: project, canvas, audio, preferences, and interface state domains, with named actions and a compatibility facade for tests and gradual migration.
- `guided-access.js`: guided tutorial and example setups.
- `spotify-coverflow.js`: Spotify authorization, albums, and playback.

Paths in HTML are relative to the repository root. Keep asset URLs root-relative or resolve them from the page URL so moving a module does not change where assets are loaded from.

Application modules consume `appState.project`, `appState.canvas`, `appState.audio`, `appState.preferences`, and `appState.interface`. State changes with external effects should go through `appStateStore.actions`; project persistence remains in `18-project-storage.js`. Spotify authorization and playback already live in the isolated `SpotifyCoverflow` module and are not duplicated in the application store.
