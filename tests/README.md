# Equipment contracts

`equipment-brands.test.cjs` verifies the five electronics and five listening manufacturers, coverage of all audio type IDs, unique model names, each naming convention and independent local SVG logos. `node tests/equipment-brands.browser.cjs` checks real equipment, catalog cards, properties, accessible names, live model-preserving translation, branding clearance (including pitch wells, displays and heat sinks), suppression on headphones/adapters, and placement previews for every branded model. It also checks manufacturer/model search and identity containment in the short dock. It accepts `TAILWIND_SCRIPT_FILE` and writes `/tmp/audio-brand-validation.json` (or `BRAND_REPORT`) with the placements and any issues.

`node tests/tape-deck.browser.cjs` checks the tape deck's layout, real transport, ten-second seek, keyboard level control, reel inertia, reduced motion, directional lighting, shadow cache, and saved-project reload. It serves local assets through Playwright and accepts `TAILWIND_SCRIPT_FILE` for offline styling.

`node tests/equipment-materials.browser.cjs` checks all registered models with the material, depth and analog-finish stylesheets enabled and disabled: device/control geometry, connector guidance colors and halos, inert artwork layers, matching placement previews, and local texture decoding. It also verifies gold and silver screws, varied drive angles, resolved SVG references, one shared definition set, and clearance from controls, meters, tuner scales, and text. Speaker grilles intentionally cover the driver fasteners. It uses Playwright routing and accepts `TAILWIND_SCRIPT_FILE` for offline styling.

The same browser suite checks construction choices: domestic fronts and smooth driver trims conceal their fasteners, removable service panels and exposed baskets retain them, and placement previews match the finished equipment.

## Signal history

`signal-history.test.cjs` covers RMS/peak measurements, level states, the bounded 12-second window, gaps and retained overload events. `node tests/signal-history.browser.cjs` exercises actual Web Audio readings, a connected chain, power changes, English labels, narrow layout, panel closure and device deletion. It also mounts and disposes the shared meter adapter across all catalog types. This browser test serves local assets through Playwright, without requiring an HTTP server. It needs the app's Tailwind CDN; optionally set `TAILWIND_SCRIPT_FILE` to a local copy of that script. Set `SIGNAL_HISTORY_SCREENSHOT` to save a preview.

## Catalog

`node tests/glass-turntable.browser.cjs` checks the glass-platter turntable's motor/power behavior, local audio playback, LINE/PHONO switching, pitch, dust cover, Spotify record placement, ports and cleanup. Like the signal-history browser test, it accepts `TAILWIND_SCRIPT_FILE` for offline styling. Its preview is written to `/tmp/glass-deck.png`.

`equipment-contracts.test.cjs` runs with the normal Node suite. Its explicit inventory at `fixtures/equipment-contract-types.json` is the reviewed list of catalog equipment. Adding or removing a type requires updating this inventory and satisfying the numeric, translation, and model-table checks.

Run the full browser contract suite against the real app after starting a local server:

```sh
python3 -m http.server 8765 --bind 127.0.0.1
node tests/equipment-contracts.browser.cjs
```

The browser suite creates every inventory type using `createDevice`, checks its rendered dimensions and ports, requires routable ports on audio equipment (with explicit decorative/no-cable exceptions), confirms supported connector formats and node/direction metadata, toggles available power controls off and on, checks electrical specifications where the model publishes them, tests the connector-compatibility result contract, and verifies English labels. It also scans rendered text, `aria-label`, `title`, placeholders, alt text, tooltips, and all select options for Portuguese strings still visible in English mode, both in settings and while each device inspector is open. It deletes each created instance to exercise normal runtime cleanup.

`node tests/direct-turntable.browser.cjs` checks the direct-drive turntable: motor, local audio, 33⅓/45 rpm, ±8/16% pitch, reset, stylus light, LINE/PHONO outputs, cover, Spotify record placement and cleanup. Both turntable browser tests also check saved settings restore with playback paused. Set `TAILWIND_SCRIPT_FILE` for offline styling; direct-drive preview: `/tmp/direct-deck.png`.

The two turntable browser tests share `turntable-geometry.helpers.cjs`: they compare lid articulation with the existing turntable, check all five cover faces, a fixed hinge, mouse/keyboard operation, normal and reduced motion, and control containment/overlap. Open-lid previews are saved to `/tmp/glass-lid-open.png` and `/tmp/direct-lid-open.png`.

`node tests/classic-preamp.browser.cjs` verifies the wood-console preamp with real Web Audio: five channel modes, output balance and mute, independent L/R tone, low/high filters, tape monitor routing, power gating, keyboard/pointer controls, settings restoration, English labels and control geometry. The preview is saved to `/tmp/classic-preamp.png`; `TAILWIND_SCRIPT_FILE` supports offline styling.

`node tests/electrostatic-speaker.browser.cjs` checks the classic electrostatic panel dimensions, passive input, electrical references, sensitivity trim and actual Web Audio filter response. It also checks the inspector and disposal. Preview: `/tmp/electrostatic-speaker.png`.

`equipment-acoustics.test.cjs` checks equipment eligibility, transport state, a bounded voice count and resource disposal. `node tests/equipment-acoustics.browser.cjs` checks real Web Audio, an offline-rendered RMS/peak loudness budget, power/removal, page visibility and interaction mute. It accepts `TAILWIND_SCRIPT_FILE` for offline styling.

`node tests/quality-of-life.browser.cjs` verifies catalog previews without registering devices, dimensions for all catalog models, drag cleanup, persisted favorites, the canvas controls and the separate operating sound control. It also checks toolbar alignment at desktop and mobile widths, Solo/Mute without recreating or reanimating the properties panel, and panel visibility while dragging and after dropping a device. Set `TAILWIND_SCRIPT_FILE` to test offline.


## Right-angle cable length regressions

`node --test tests/orthogonal-cables.test.cjs` checks local route length, short exits in tight stacks, routing above a tall obstacle, stereo spacing, bounded detours in congested lanes, and multiple obstacles in either direction. It requires no browser or DOM.

`node tests/right-angle-cable-lengths.browser.cjs` constructs a direct-drive turntable → studio EQ → bench meter → RCA matrix → two compact active speakers over a table. It requires ten real compatible connections, local route lengths, and invariance when the table's bounding box extends farther down. It saves `/tmp/right-angle-cable-lengths.png`; `CABLE_SCREENSHOT` changes the output path. The existing `right-angle-cables.browser.cjs` covers the setting, stereo lanes, tight stacks, unrelated equipment below, persistence, and return to sagging cables. Both browser tests accept `CHROMIUM_PATH` and `TAILWIND_SCRIPT_FILE`; Playwright must be available to Node.


`node tests/apple-layout.browser.cjs` simulates iPad, narrow iPad split view, iPhone portrait/landscape and Android tablet. It checks the scaled desktop viewport, two-column home menu, desktop floating inspector, actual touch hit targets, phone rotation, catalog visibility and the Apple Home Screen icon link. It requires Playwright and a local Tailwind copy via `TAILWIND_SCRIPT_FILE`; these emulations do not replace verification in Safari on a physical device.

## Click placement

`TAILWIND_SCRIPT_FILE=/path/to/tailwind.js node tests/click-placement.browser.cjs` checks mouse pickup without a held button, live grid snapping, confirmation and invalid catalog drops, Escape/blur cleanup, undo/redo, hardware controls, connected groups, furniture supports, zoom changes, reduced motion and touch tap/hold gestures. It serves local assets through Playwright routing and also supports loading Tailwind from the CDN when the environment variable is omitted.

## Room coverage behind the dock

`node tests/room-coverage.browser.cjs` checks minimum-zoom image coverage over the transparent dock silhouette at both pan limits, across 14 phone/tablet/desktop/ultrawide/4K/tall viewport and device configurations, including iPhone portrait and landscape and all nine room/time combinations. It also checks the 3.2:1 aspect ratio, a shared floor line across all nine combinations, and that rain retains the image transform. It accepts `TAILWIND_SCRIPT_FILE` for offline styling.

## Keyboard deletion

`node tests/keyboard-delete.browser.cjs` checks Delete and Backspace for single/multiple selection, connected cable cleanup, batch undo/redo with restored settings, editable-field and modal guards, and deletion/cancellation during cursor placement. It accepts `TAILWIND_SCRIPT_FILE` for offline styling.

`node tests/room-atmosphere.browser.cjs` verifies that time changes reuse the same image and rain elements, particle origins stay in the windows, depth blur survives all nine combinations, and reduced-motion/disabled particles stop their animation loop. It bounds particle and shadow buffers at 4K and saves nine previews to `/tmp/room-ultrawide-{studio|listening|loft}-{dawn|dusk|night}.png`. It accepts `TAILWIND_SCRIPT_FILE`.

`node tests/room-fixture-light.browser.cjs` checks background illumination from both wall lamps and the pendant, removal cleanup, solid-theme exclusion and the 1400-pixel buffer limit. It accepts `TAILWIND_SCRIPT_FILE`.

`node tests/static-rain.browser.cjs` verifies the shared photographic rain material in all three rooms at dusk/night, 2× Retina output, transparent frames, stable cached PNGs across lighting changes, one material download, and at most 18 moving drops. It saves `/tmp/rain-quality-{studio|listening|loft}-{dusk|night}.png` and accepts `TAILWIND_SCRIPT_FILE`.

## Home menu

`node tests/home-menu.browser.cjs` verifies initial entry before calibration, resume after local restore, room and language choices, settings, responsive bounds, cancellation of a new setup, and invalid/valid file imports. It saves `/tmp/audio-lab-home-desktop.png` and `/tmp/audio-lab-home-mobile.png`. It accepts `TAILWIND_SCRIPT_FILE`. Existing studio suites enter the menu through `tests/helpers/studio-entry.cjs`.

## Menu music

`node tests/menu-music.browser.cjs` checks gesture-only activation, actual decoded audio output, native looping, cancellation while loading, shared decoding across menu entries, volume/mute persistence and hidden-tab cleanup. It also checks the CC0 dedication and the soundtrack size budget. It accepts `TAILWIND_SCRIPT_FILE`.
