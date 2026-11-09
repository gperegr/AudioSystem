# Browser support modules

These standalone classic scripts provide focused features used by the application entry point. `index.html` loads them before the generated `script.js`, preserving their existing globals and initialization order.

- `adapter-design.js`: adapter rendering and rotation behavior.
- `audio-interfaces.js`: audio-interface device behavior.
- `equipment-brands.js`: ten fictional manufacturers, original SVG logos, model assignments for all audio devices, accessible/catalog identities, and one-time placement of maker printing on clear physical surfaces. Type IDs, electrical ratings, audio behavior, and saved-project data remain independent of branding. Rebuild its SVG assets, visual brand book, and full model reference with `node tools/build-brand-assets.cjs`; use `--check` to verify them.
- `application-state.js`: project, canvas, audio, preferences, and interface state domains, with named actions and a compatibility facade for tests and gradual migration.
- `guided-access.js`: guided tutorial and example setups.
- `spotify-coverflow.js`: Spotify authorization, albums, and playback.

Paths in HTML are relative to the repository root. Keep asset URLs root-relative or resolve them from the page URL so moving a module does not change where assets are loaded from.

Application modules consume `appState.project`, `appState.canvas`, `appState.audio`, `appState.preferences`, and `appState.interface`. State changes with external effects should go through `appStateStore.actions`; project persistence remains in `18-project-storage.js`. Spotify authorization and playback already live in the isolated `SpotifyCoverflow` module and are not duplicated in the application store.

## Signal history

`signal-history.js` contains the shared RMS/peak, dBFS, classification and bounded-history calculations. The application adapter in `../app/06-signal-history-ui.js` owns read-only Web Audio taps and the inspector view. It measures the selected connected component only while the history panel is visible, releases taps on panel closure, hidden documents and device removal, and keeps samples out of project persistence. Stereo channels are measured separately before taking the maximum to avoid phase cancellation. Input taps observe arriving cables before source selectors; output taps observe actual output nodes. Peak values at or above 0 dBFS are reported separately from modeled electrical clipping. Spotify bypasses the app's DSP and is explicitly identified as unavailable for measurement.

`equipment-acoustics.js` synthesizes quiet operational hum, fan and transport ambience. It groups devices into at most three sustained voices and shares a loop buffer. The application adapter handles activation, page visibility, power, deletion and the existing interaction volume. This bus bypasses the simulated signal graph, meters and recording taps.


## Right-angle cables

`orthogonal-cables.js` computes rectilinear routes without reading the DOM or changing the audio graph. It searches a visibility grid around connector exits and equipment edges, preferring short paths with few bends. Parallel-run spacing is a soft preference: it can add at most 72 world pixels relative to the unobstructed-lane solution, rather than pushing every subsequent cable farther outside the assembly.

The canvas adapter in `../app/14-cable-rendering-and-drag.js` measures equipment rectangles once per cable update, excludes the two endpoint chassis, and applies 8 px clearance to other equipment. Cable strokes are in front of furniture, so tables/racks and their empty spaces do not block routing. Connector exits are normally 32 px downward; a nearby intervening chassis can shorten that exit. The sagging cable mode and electrical connections are unchanged. Temporarily overlapping endpoints are exempted from obstruction checks while equipment is being dragged.
