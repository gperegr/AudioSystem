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

Interface brightness follows the image interior: the studio stays dark even at dawn, while the listening room retains the wall's brightness in late afternoon. Active states and favorites use each palette's accent while maintaining contrast against the background.

## Typography and layout

Use `var(--font-ui, "Inter", sans-serif)`. Existing styles use section headings around 16 px at weight 700, labels at 12–13 px and weight 600, and helper text at 11–12 px with about 1.4 line height. Keep hierarchy legible without relying on uppercase or color alone. Use consistent alignment, 8–14 px spacing between elements, and cards with a 1 px edge and 7–10 px radius where surrounding components use them. These measurements describe the existing style; they are not implemented CSS classes or tokens.

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
3. Check light and dark themes, room and time palettes, active and disabled controls, and a mobile viewport.
4. Run relevant checks. `node tests/interface-palettes.browser.cjs` covers all 13 combinations, contrast for key components, and preservation of equipment appearance; it accepts `TAILWIND_SCRIPT_FILE` for offline use. `node --test tests/*.test.cjs` runs the Node test suite.
5. If shared tokens or contracts change, update this guide and affected usage. Equipment CSS in `styles/equipment/` and its canvas controls follow separate rules.

## Permanent catalog and floating panels

The left catalog stays visible; it has no collapse arrow, pin, automatic hiding, or pin preference. The canvas reserves space for it. At widths up to 700 px, the catalog is 136 px wide and uses one equipment column. Search, favorites, and drag-to-discard remain available. The search header floats above the scrolling list, with space reserved at the top so the first items start below it. Only the search control has a surface, and it blurs items scrolling behind it; the search field stays open while it contains text and closes only after the text is cleared.

Floating properties panels are confined to the canvas, below the top bar and to the right of the catalog. Their position, size, animation, and shadow respect those boundaries. When space is limited, panels shrink and scroll internally. Their position updates when the panel, catalog, or top bar changes size.
