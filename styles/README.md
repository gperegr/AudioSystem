# Stylesheets

- `app.css` contains the application layout, shared controls, canvas, and responsive rules.
- `equipment/` contains focused visual refinements for device families and materials.

`equipment/tactile-finishes.css` adds shared physical finishes beneath the equipment controls. `Hardware.materials` mounts these non-interactive layers for real equipment and placement previews; it does not change geometry or audio state. The small, transparent material tiles in `assets/textures/` can be rebuilt with `python3 tools/build-material-textures.py` (standard library only). Keep this stylesheet after the device-family styles and `visual-refinements.css`.

`equipment/fasteners.css` styles the reusable seated screws from `Hardware.screw({finish:'gold'|'silver', rotation, size, drive:'slot'|'cross'})`. The head, bevel, and recessed drive use shared SVG definitions. Rotation changes the drive orientation while preserving the head's light direction. `Hardware.fasteners(element)` replaces the existing cabinet, driver, and control fasteners, and is safe to call again after controls mount. Keep this stylesheet after all equipment finishes.

Front construction is reviewed per model in `Hardware.frontFasteners(type)`. Removable technical panels (EQs, mixers, crossovers, bench instruments, rack power amps, four-channel headphone amp), the classic console, rack preamps, tape deck and electrostatic frame expose their fasteners. Domestic receivers/integrated amps, CD players, streamers, USB interfaces, compact switches/converters and headphone amps use rear/underside fixation or fitted shells, without a decorative screw frame. Classic speaker baffles, working monitors and the pro/vintage subwoofers retain driver fixings; modern domestic drivers use concealed mounting behind trim rings. An ivory knob's central mechanical screw remains independent of the cabinet construction. Placement previews follow the same choices.

`equipment/depth.css` supplies material-specific housing edges, control contact shadows, recessed glass/vents, driver relief, and silhouette shadows for equipment and placement previews. It complements the cached, directional scene shadows from `Hardware` without changing control geometry, dial rotation, or connector guidance. Load it after `tactile-finishes.css` and before `fasteners.css`.

Stylesheets refer to files in `assets/` using paths relative to their own directory. Keep the production stylesheet links in `index.html` synchronized with this structure.

- `interface-palettes.css` defines the dynamic UI palettes and interface color overrides. See `../docs/UI-DESIGN-SYSTEM.md` for the component and token reference.

`equipment/brands.css` separates physical maker printing (manufacturer ink, wordmark, model) from catalog metadata (UI palette tokens). Wordmarks are vector logos; placement is computed once at creation, clears controls and printed scales, and follows the physical headband, grille, adapter body, or chassis. Grille labels leave with the removable cover. `docs/EQUIPMENT-BRANDS.md` documents the ten identities and complete model map; `assets/brands/index.html` is the standalone visual brand book.
