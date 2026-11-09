# Stylesheets

- `app.css` contains the application layout, shared controls, canvas, and responsive rules.
- `equipment/` contains focused visual refinements for device families and materials.

`equipment/tactile-finishes.css` adds shared physical finishes beneath the equipment controls. `Hardware.materials` mounts these non-interactive layers for real equipment and placement previews; it does not change geometry or audio state. The small, transparent material tiles in `assets/textures/` can be rebuilt with `python3 tools/build-material-textures.py` (standard library only). Keep this stylesheet after the device-family styles and `visual-refinements.css`.

`equipment/fasteners.css` styles the reusable seated screws from `Hardware.screw({finish:'gold'|'silver', rotation, size, drive:'slot'|'cross'})`. The head, bevel, and recessed drive use shared SVG definitions. Rotation changes the drive orientation while preserving the head's light direction. `Hardware.fasteners(element)` replaces the existing cabinet, driver, and control fasteners, and is safe to call again after controls mount. Keep this stylesheet after all equipment finishes.

`equipment/depth.css` supplies material-specific housing edges, control contact shadows, recessed glass/vents, driver relief, and silhouette shadows for equipment and placement previews. It complements the cached, directional scene shadows from `Hardware` without changing control geometry, dial rotation, or connector guidance. Load it after `tactile-finishes.css` and before `fasteners.css`.

Stylesheets refer to files in `assets/` using paths relative to their own directory. Keep the production stylesheet links in `index.html` synchronized with this structure.

- `interface-palettes.css` defines the dynamic UI palettes and interface color overrides. See `../docs/UI-DESIGN-SYSTEM.md` for the component and token reference.
