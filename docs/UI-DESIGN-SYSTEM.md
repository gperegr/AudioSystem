# Interface design system

This guide covers the Audio Lab menus, catalog, settings, panels, dialogs, and controls. Equipment and room artwork on the canvas have their own styling. Reuse existing components and tokens from `styles/interface-palettes.css`; do not copy fixed colors from one palette into another.

The brand combines an A with a sound wave. The original vectors are in `assets/brand/`. The top bar uses the symbol in `--ui-accent` beside the Audio Lab name in Inter Bold. On small screens, only the symbol appears while its accessible name remains available.

## Palettes and tokens

`document.documentElement.dataset.uiPalette` stays in sync with the background, room, and time in `src/app/02-room-and-canvas-theme.js`. The definitions and actual values are in `styles/interface-palettes.css`; treat that file as the source of truth. Available palettes are `light`, `sepia`, `graphite`, `midnight`, and `scene-{studioIllustrated|listeningIllustrated|loftIllustrated}-{dawn|dusk|night}`. The `:root` selector supplies fallback values. Do not set this attribute manually from a component.

| Token | Use |
| --- | --- |
| `--ui-top` | Top bar |
| `--ui-side` | Sidebars and settings backgrounds |
| `--ui-panel` | Cards, sections, and dialogs |
| `--ui-control` | Control and field backgrounds |
| `--ui-hover` | Surface beneath the pointer |
| `--ui-active` | Selected or engaged control |
| `--ui-border` | Dividers and panel edges where used |
| `--ui-text` | Primary text |
| `--ui-secondary` | Labels and secondary text |
| `--ui-muted` | Subtle text and helper indicators |
| `--ui-accent` | Highlights, focus, and selection |
| `--ui-shadow` | Interface shadows |
| `--ui-scheme` | Native control `color-scheme` |

Signal, warning, and danger colors have distinct meanings. Preserve them and ensure contrast on light and dark backgrounds. For charts drawn on interface canvases, read tokens with `getComputedStyle(document.documentElement)` at draw time, as the spectrum analyzer does. Do not apply these tokens to equipment artwork.

## Room palettes

The nine palettes follow the materials and lighting in `assets/rooms`, as mapped in `assets/rooms/scenes.js`:

| Room | Dawn | Late afternoon | Night |
| --- | --- | --- | --- |
| Studio | Charcoal with soft wood | Walnut and amber | Blue graphite and cool light |
| Listening room | Limestone, wood, and subtle olive | Golden sand and honey | Soft slate and moonlit blue |
| Industrial loft | Light concrete and terracotta | Burnt brick and copper | Blue steel and warm city reflections |

Rooms use 2304 × 720 panoramas (3.2:1), with the floor at source y=530 in every room. All three time settings reuse the same image with color grading and depth blur. Rain glass masks, particle origins, and equipment light emitters use the same source-image geometry from `assets/rooms/scenes.js`; avoid separate viewport offsets for these effects. Glass rectangles exclude the painted frames and mullions. Wet glass uses a shared photographic optical material (`assets/rooms/rain-glass-material.webp`), with neutral glass removed and independent offsets per pane and a reduced droplet scale, composed into a cached static PNG per room with baked glass masks and up to 2× Retina resolution, while only 4–6 drops per window animate without a full-scene blur pass; dust samples are allocated by glass area and projected from individual panes toward the floor, without a separate screen-wide particle layer. Particle and floor-shadow buffers are capped at 1600 and 2560 pixels wide respectively.

Interface brightness follows the image interior: the studio stays dark even at dawn, while the listening room retains the wall's brightness in late afternoon. Active states and favorites use each palette's accent while maintaining contrast against the background.

## Typography and layout

Use `var(--font-ui, "Inter", sans-serif)`. Existing styles use section headings around 16 px at weight 700, labels at 12–13 px and weight 600, and helper text at 11–12 px with about 1.4 line height. Keep hierarchy legible without relying on uppercase or color alone. Use consistent alignment, 8–14 px spacing between elements, and cards with a 1 px edge and 7–10 px radius where surrounding components use them. Shared spacing tokens in `interface-palettes.css` are `--ui-space-xs/sm/md/lg/xl` (4/8/12/16/24 px). Use 12–16 px inside groups, 24 px inside desktop dialogs, and 8–12 px between controls. Text controls are at least 40 px high on desktop on all devices (`--ui-control-height`); icon controls use `--ui-icon-size`. These tokens apply to interface chrome, not hardware geometry or schematic category hit regions. Below 500 px viewport height, the dock uses a compact layout with 70 px tiles to preserve canvas space. Text buttons may grow vertically when translations wrap.

## Components

| Component | Existing reference | Guidance |
| --- | --- | --- |
| Button | `.tt-insp-btn`, `.app-settings-content button` | Use `--ui-control` for the surface and `--ui-text` for text. App buttons have no decorative outline; use `--ui-hover` on hover and `--ui-active` when selected. Use a semantic `button` and `aria-pressed` for toggles. |
| Icon button | `.canvas-tools button` | Use `currentColor` for the icon, provide an accessible name through `aria-label`, and keep keyboard focus visible. |
| Slider | `input[type=range]`, `--menu-slider-track`, `--menu-slider-thumb` | Use a native range with a label, value, and unit; support keyboard input. Use existing track and thumb tokens, and preserve the meaning of meter colors. |
| Dropdown | `.app-select-trigger`, `.app-select-popup`, `.app-select-option` | Reuse the shared selector and its backing `select`; retain selected state, keyboard navigation, and focus. Do not create a second local implementation. |
| Checkbox | `input[type=checkbox]` with `label` | Associate a native control with its label and use `color-scheme: var(--ui-scheme)`. Make checked, disabled, and focus states perceptible. There is no consolidated global class. |
| Text field | Catalog search | Use `--ui-control`, `--ui-text`, `--ui-border`, and `--ui-muted` for the placeholder; include an accessible label. |
| Expandable group | `.settings-group`, `.signal-history-panel` | Use `details`/`summary`, a clear title, an open-state indicator, and keyboard focus. |
| Card | `.model-specs`, `.sonic-signature-panel`, `.settings-group` | Use `--ui-panel` for the surface, `--ui-text` for headings, and `--ui-secondary` for supporting text. |
| Dialog | `.app-confirm-dialog`, `.tutorial-dialog` | Reuse the existing dialog flow with a title, clear primary action, cancellation, and focus management. |
| Chart and legend | `.spectrum-panel`, `#audio-spectrum` | Distinguish series by legend and color; use tokens for surfaces and axes and retain contrast across all palettes. |

Favorites use an unoutlined star. The off state has a lighter fill; the selected state uses a darker fill in the palette accent. Selected equipment and hover use distinct highlight colors. Multi-selection opens no floating properties panel.

Avoid visually similar components with separate behavior or classes. Where no shared component exists yet, follow these contracts and document the implementation here once it is consolidated.

## States, accessibility, and language

Include normal, hover, visible focus, selected, disabled, and error states where applicable. Keyboard focus must remain visible; touch access must not depend on hover. As a reference, selection options use 44 px touch targets for touch pointers. Preserve labels, `title`, `aria-label`, and localized options using the mechanisms in `src/i18n/`. Body text should reach at least 4.5:1 contrast; also check icons, edges, states, and messages against their actual backgrounds.

## Implementation checklist

1. Check shared components and styles in `styles/app.css` and `styles/interface-palettes.css` before adding another implementation.
2. Use semantic tokens, retain state and translations, and preserve mouse, keyboard, and touch behavior.
3. Check light and dark themes, room and time palettes, active and disabled controls, and the scaled desktop viewport on phones/tablets.
4. Run relevant checks. `node tests/interface-palettes.browser.cjs` covers all 13 combinations, contrast for key components, and preservation of equipment appearance; it accepts `TAILWIND_SCRIPT_FILE` for offline use. `node --test tests/*.test.cjs` runs the Node test suite.
5. If shared tokens or contracts change, update this guide and affected usage. Equipment CSS in `styles/equipment/` and its canvas controls follow separate rules.

## Permanent catalog and floating panels

The catalog opens with a schematic listening setup (`.catalog-setup`): semantic buttons on a single proportional illustration select groups of equipment below it. For mouse and pen, clicking an equipment card starts a preview that follows the cursor inside the canvas; a second click places it on the grid. Clicking a non-interactive part of an existing device picks it up with its grab offset and selected/furniture group intact. Positions snap horizontally by the left edge and vertically by the bottom edge. Delete (or Backspace on Mac keyboards) removes the selected equipment and its cables as one undoable action, including multiple selection. Editable fields, IME composition, open dialogs and active cable patching retain their own keyboard behavior. During cursor placement, deletion first cancels the move; a catalog preview is cancelled without deleting another selected device. Controls, ports and modifier-click selection retain their own actions. Escape, pointer cancellation or window blur cancel placement; existing devices return to their committed positions, and previews create no live device until confirmed. Touch keeps its tap-to-preview and deliberate drag controls. `node tests/click-placement.browser.cjs` covers placement, cancellation, grid alignment and undo/redo. Category names are accessible labels and native tooltips; no explanatory text or category chips surround the illustration. The mouse wheel scrolls the equipment strip horizontally; horizontal trackpad gestures retain their direction. Momentum, edge elasticity and scroll feedback follow the horizontal axis, while properties and settings keep vertical scrolling. Search spans every category; clearing it restores the selected group. The small grid icon exposes the full inventory. The neutral state shows the complete catalog. Clicking an active illustration category again deselects it and restores all items. The star beside the all-items grid opens Favorites exclusively, including an empty-state message; search still spans the complete catalog and clearing it restores the selected filter. The illustration uses interface tokens and does not reuse or change canvas equipment artwork. The schematic uses 16-unit outer margins and a 16-unit gutter between the speaker and furniture footprint; the stacked devices have equal 6-unit visible clearances and share a centerline above the furniture base, with no rack rails or shelf lines behind them. All-items and Favorites form a centered pair above the stack. Equipment and furniture share `setupFeet`; the headphone stand keeps its smooth elliptical base without feet. The shared feet are: two filled supports, 6 × 4 units with a 1-unit corner radius and 12-unit center inset. Their color follows the same hover/selection state as the equipment. The headphones remain centered on the speaker. All schematic tops use the same shallow perspective (1 px of inward recession per 2 px of depth). Headphones sit above the speaker, measurement/connections occupy the bottom rack bay, and the furniture target opens separate Furniture and Lighting sections; the illustration has no standalone lamp target.

The catalog is a permanent bottom dock with the setup anchored at its lower left, search above the setup, and equipment groups in a horizontally scrolling strip. The canvas and floating inspector layer reserve the dock height. A responsive SVG silhouette follows the measured search bounds and corner radius with up to 16 px of clearance, then curves down into the equipment tray. The search and setup bay has a separately clipped foreground surface, a slight palette-derived tint and a short lateral shadow above the scrolling tray. The illustration and search stay above this surface; equipment cards remain in the lower scroll layer. The tray meets the right viewport edge squarely, including its scroll clipping. Its fill, subtle rim and tight 2 px shadow follow interface palette tokens. The canvas keeps its usable dimensions but paints beneath the dock cutouts using an extended clip path. The room backdrop also extends its clipping by `--catalog-cutout-height` in screen pixels, converted to world units at each zoom. Image coverage adds only the uniform scale and translation needed to cover this visible area, including blur bleed, at any pan limit or viewport size. Rain shares the image transform, and particle beams follow its displayed bounds. World dimensions, grid and equipment placement bounds remain unchanged. `node tests/catalog-dock.browser.cjs` checks search clearance, canvas paint extension and usable bounds on desktop, phone and short windows; it accepts `TAILWIND_SCRIPT_FILE`.

The catalog stays visible; it has no collapse arrow, pin, automatic hiding, or pin preference. The canvas reserves space for it. The desktop setup bay and horizontally scrolling equipment strip are used at every screen size. Search, favorites, and drag-to-discard remain available. The search header floats above the scrolling list, with space reserved at the top so the first items start below it. Only the search control has a surface, and it blurs items scrolling behind it; the search field remains expanded at all times.

Floating properties panels are confined to the canvas, below the top bar and above the catalog dock. Their position, size, animation, and shadow respect those boundaries. When space is limited, panels shrink and scroll internally. Their position updates when the panel, catalog, or top bar changes size.

## Window rain

Rain uses glass-only polygons in source-image coordinates from `RoomScenes.rainGlass`. Each loft light is clipped individually to protect mullions and frames. The studio and listening-room polygons are inset from their window frames. The overlay shares the room image's horizon shift and parallax; do not position it in screen coordinates. Stationary beads and animated drops with trails vary their positions, sizes, pauses and paths between animation cycles and respect reduced motion. Quiet stereo noise is filtered and mixed into the listening output while scene rain is enabled; intensity changes use gain ramps, and disabling rain or leaving the page fades and releases its audio nodes. Browser user-activation rules still apply. Keep clipping tests in `tests/room-scenes.test.cjs` and controls/persistence coverage in `tests/window-rain.browser.cjs` when changing the effect.


## iPhone and iPad

All devices use one desktop interface. `src/modules/desktop-layout.js` sets a minimum 1280 CSS-pixel layout viewport, allowing phone/tablet browsers to reduce the entire interface natively. This keeps pointer coordinates, the grid, menus and floating inspectors in the same coordinate system. `styles/desktop-layout.css` enforces desktop sizing and hides legacy mobile control nodes. Do not add separate phone layouts, coarse-pointer size overrides or mobile navigation. Touch input remains supported; it does not select a different interface. The old phone stylesheet and its generator have been removed. `tests/apple-layout.browser.cjs` verifies native viewport scaling, two-column home navigation, desktop inspectors, actual touch controls and phone rotation across Apple and Android devices. The Safari Home Screen icon and manifest remain supported.

## Home menu

`src/app/20-home-menu.js` and `styles/home-menu.css` provide the full-screen native dialog shown after local restoration and before first-run calibration. Use only the app name and functional menu labels; no slogans or promotional copy. The menu uses a solid sepia background with scoped sepia palette tokens, offers resume/new/import/settings/tutorial, and selects the room and language. The brand button returns to it. New setups require confirmation when content exists; cancelled or invalid imports keep the menu and project intact. Rain audio and particle animation pause behind the home menu; only its music plays. Settings opens a dedicated page inside the home dialog with Back/Escape navigation, temporarily hosting the existing settings controls and restoring them to the toolbar when leaving. The dialog supplies keyboard focus containment, with Escape entering the studio. `tests/home-menu.browser.cjs` covers navigation, restoration, import and desktop layouts. Existing studio suites use `tests/helpers/studio-entry.cjs` to enter through the menu on document navigation.

The home footer contains a music toggle and a labeled volume slider. `src/modules/menu-music.js` uses the existing listening context, lazy decoding and one native loop source. It must not unlock audio on page load or visibility changes. Entering the studio cancels pending playback and fades out an active source; hidden pages stop the track. UI volume and equipment sounds remain independent. Use the shared palette tokens; retain Portuguese/English labels and saved menu music preferences. The original soundtrack and score are CC0, as documented beside the MP3.

Home settings hides controls marked `data-studio-only` (Visual, clear all, guided access and example setups). These remain available in the canvas settings.

Selecting an environment on the home screen previews its palette and background with a 500 ms crossfade. Scene images decode before the fade; stale requests are ignored and old layers are removed. The first opening remains solid sepia. Respect reduced motion and keep rain audio muted.
