# Browser support modules

These standalone classic scripts provide focused features used by the application entry point. `index.html` loads them before the generated `script.js`, preserving their existing globals and initialization order.

- `adapter-design.js`: adapter rendering and rotation behavior.
- `audio-interfaces.js`: audio-interface device behavior.
- `guided-access.js`: guided tutorial and example setups.
- `spotify-coverflow.js`: Spotify authorization, albums, and playback.

Paths in HTML are relative to the repository root. Keep asset URLs root-relative or resolve them from the page URL so moving a module does not change where assets are loaded from.
