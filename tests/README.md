# Equipment contracts

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
