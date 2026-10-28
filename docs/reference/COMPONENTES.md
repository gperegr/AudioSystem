# Shared components

The `Hardware` library in `src/app/00-hardware-library.js` centralizes control definitions. Equipment supplies the audio parameters and setters. `Hardware.mount(dev)` applies the shared models after each device is constructed.

## Knobs

| Model | Diameter | Construction and main use |
| --- | --- | --- |
| rubber | 22 px | Molded rubber with recessed grip; volume for compact speakers, precision monitor, and subwoofers |
| faceted | 28 px | Faceted metal face in a square frame; headphone amp channels, traditional power amp, modern preamp input, and modern EQ level |
| recessed | 36 px | Cylinder inside a circular recess; modern headphone amp, preamp controls, and modern generator level |
| touchDisc | 52 px | Thin, smooth, nearly flush disc; minimalist integrated amp volume, central-display preamp, and modern receiver |
| machined | 36 px | Machined aluminum with a radial face and black index; classic tone, circular-display power amp gain, and vintage generator level with an engraved scale |
| skirted | 52 px | Wide chrome skirt with raised black center; volume for integrated amps and metal/classic-front preamps |
| bakelite | 36 px | Brown bakelite with deep cuts and an ivory mark; vintage tape deck, power amp, and equalizer |
| ivory | 36 px | Molded ivory, central brass screw, and red triangle; vintage active speaker and headphone amplifier |
| pointer | 44 px | Protruding instrument pointer with a wide grip; available in the library |
| flywheel | 52 px | Flywheel with a knurled edge, metal rings, and a recessed center; FM tuning |

A model shares its face and movement behavior, with default dimensions that can be overridden per device or instance. The face rotates inside the rim; position and label belong to the device layout. Indicators use the angle variables updated by existing setters.

```js
Hardware.bindKnob(element, {
    model: 'recessed',
    get: () => dev.state.volume,
    set: dev.setSpeakerVolume,
    min: 0,
    max: 1
});
```

A model can be declared explicitly or selected by the central `knobModel` function. Shared physics supports mouse/touch dragging, zoom compensation, pointer capture, keyboard input, Home/End, PageUp/PageDown, and cleanup on cancellation, focus loss, or device removal. There are ten magnetic intervals by default; input selection and FM tuning define their own steps. Opening a panel does not change parameters.

## Other components

- `Hardware.buttons`: keys, transport controls, toggles, vertical/horizontal switches, compact versions, and menu buttons. Actions remain device-specific; size and visual response belong to the model.
- `Hardware.sliders`: horizontal, vertical, and search tracks and thumbs. Faders use ten intervals; music search remains continuous. Mechanical pitch uses `Hardware.bindLinear`, sharing interaction and cancellation behavior with knobs.
- `Hardware.leds` and `Hardware.setLed`: dimensions, colors, on/off state, and clipping indication. Instruments continue to determine when a signal is present.
- `Hardware.plugs` and `Hardware.plugMarkup`: plug artwork and thicknesses for 3.5 mm, 6.35 mm, RCA, and speaker wire in one registry.
- `Hardware.inspector`: menu surface, buttons, sliders, and control dimensions, while retaining each device’s specific parameters.

Shared styles live in `styles/app.css`. `Hardware.physics` defines movement duration. The reduced-motion preference disables control transitions.

## Chassis

`Hardware.sizes` defines three heights: low **120 px**, medium **180 px**, and high **240 px**. The widths are compact **380 px** and full **760 px**.

`Hardware.layout` selects the chassis before measuring canvas placement. Processors, selectors, and compact amplifiers use the low format; integrated amplifiers, full-size preamps, receivers, instruments, and larger power amplifiers use the medium format; the exposed-tube power amplifier and Integrated Streamer use the high format. On the streamer, the 240 px include the top button, cabinet, connectors, and feet; its custom 520 px width is preserved. Interfaces and compact headphone amplifiers use the compact width.

Music sources, speakers, subwoofers, headphones, and furniture retain their own proportions. Displays, charts, gauges, and audio processing remain device-specific. The format is reconstructed from the device type when a project opens; no saved-file migration is required.

The grid uses `Hardware.sizes.grid` (20 px). All three heights are multiples of that step: 120, 180, and 240 px. Including the 20 px feet, stacked devices remain aligned as well.

## Optional decorative variations

`Hardware.accents` adds engraved scales or LED arcs to existing knob models. The choice is centralized in `accentModel` by device and control function; it is not applied indiscriminately.

- Illuminated arc: volume controls on the Central Display Preamp, Minimalist Integrated Amp, and modern headphone amplifier. The lights follow the actual volume setting and turn off with the device.
- Engraved scale: selected volume controls on classic and metal fronts. No illumination.
- Metal slide switch: 2.1 Control Preamp and modern headphone amplifier. It uses the same power state and function, with animated movement of the physical part.

The illuminated-arc selection explicitly excludes devices in the vintage family. Details use SVG/CSS, with no external images or changes to audio processing.

Each model construction is identified by `data-knob-model` and has its own layers for the ring, body, center, fastener, and indicator. Lighting and scales do not replace this construction. Material and silhouette distinguish models independently of diameter.

## Buttons and switches: materials, motion, and sound

Identifiers remain the same on the **Model · Controls** device. Each construction combines a fixed frame, moving part, travel path, and sound profile. Button labels remain fixed.

| Model | Construction | Action in demo model |
| --- | --- | --- |
| `vintageSteel` | Raised brushed-steel key with polished edges and engraved mark | Latching |
| `vintageRecessed` | Recessed metal key in a deep frame | Latching |
| `modernSteel` | Satin-metal key with soft corners | Returns on release |
| `modernGraphite` | Dark metal key with a subtle indicator | Latching |
| `key` | Compact molded key with a central lens | Returns on release |
| `transport` | Transport key with a metal surface and central lens | Latching |
| `toggle` | Recessed key with a red/green lens | Latching |
| `power`, `powerLarge`, `powerHorizontal`, `powerSmall` | Rocker switch with I/O marks and a horizontal or vertical axis | Two stable positions |
| `slidePower` | Recessed track, ridged metal slider, and built-in light | Two stable positions |
| `ui` | Modern button with a soft surface | Returns on release |

`Hardware.buttons` defines `action` and `sound`. `action` controls the demonstration; each device’s actual functions continue to determine its state. `Hardware.buttonSounds` collects synthesized contact, spring-return, metal-resonance, and detent sounds, with slight variation per interaction. Switches have distinct ON/OFF sounds. These sounds use the global interaction-volume setting and are separate from the music signal chain.

The visual controller holds the button down until the pointer or key is released. Cancellation, focus loss, or device removal releases the part and removes temporary listeners. Keyboard navigation keeps focus visible; reduced motion disables transitions. There is no continuous animation or sound at rest.

## Device composition rules

`buttonModel(dev, element)` is the single resolver for physical buttons. `Hardware.mount(dev)` sends all controls through `skinButton`; the same factory draws examples on the Model device. A device selects the identifier, text/icon, and function while preserving the library material, animation, and sound. Default dimensions can be explicitly overridden per device or instance. Text keys size to their label; models with a declared width retain that exact measurement.

The demo includes three constructions:

- `roundKey`: 28 × 28 px circular button used for headphone Bluetooth.
- `selectorKey`: 26 × 22 px selector key used for fixed-position generator selectors.
- `slideSelector`: 112 × 28 px selector switch used for LINE/PHONO on turntables.

The Tape Deck buttons and vintage turntable START/STOP retain `vintageSteel`. Both Bluetooth devices use `power`. The CD Player and Streamer share the `transport` play/pause model with the same fixed vector label. Lid and grille-restoration buttons use `key`. The removable grille itself is an interactive surface identified by `data-hardware-surface="grille"`, and retains the speaker cabinet geometry.

Labels are set during construction. `Hardware.setButtonLabel` accepts only elements that have not yet been mounted; already-built components keep their fixed text and icons. Menus retain the `ui` model; physical instrument artwork is not copied onto menu buttons.

The `power*` models share a molded frame, dark recess, shaft details, and a curved SVG face with I/O marks, preserving the circle in every orientation. `powerSmall` reduces the recess to keep the face legible; `powerLarge` increases the inner rim without changing the component geometry. State and pressure change the tilt and shadow of the same part.

## Adjustable width and height in code

Measurements are in canvas pixels before zoom. The size applies to both the control’s visible box and its interaction area.

### Model defaults

Edit `width` and `height` in the `knobs` and `buttons` records in `src/app/00-hardware-library.js`. Knobs declare both dimensions instead of a single `diameter`. Text buttons without a `width` continue to size to their label.

### Per device and function

Edit the `controlSizes` table after the button models:

```js
const controlSizes = {
    tapeDeck: {
        '[data-tape-level]': {width:44, height:44},
        '.tape-transport button': {width:40, height:36}
    },
    btReceiverA: {
        '.power-btn': {width:28, height:42}
    }
};
```

Device rules are applied in table order. You can specify only a width or only a height.

### During control construction

```js
Hardware.bindKnob(knob, {
    model:'bakelite',
    width:44, height:44,
    get:()=>dev.state.tapeVolume,
    set:value=>{dev.state.tapeVolume=value;dev.applyTapeSettings();},
    min:0, max:1
});
Hardware.button(button, 'power', {width:28, height:42});
```

You can also set dimensions in HTML:

```html
<button class="power-btn" data-control-width="28" data-control-height="42"></button>
```

Or change an instance that has already been built:

```js
Hardware.setControlSize(element, {width:48, height:48});
Hardware.setControlSize(element, {width:null, height:null}); // Remove API overrides.
```

Priority is: model default → device table → HTML attributes → construction/API options. `null` removes an API override and restores the value from the preceding levels. Invalid values are ignored. Table adjustments are reconstructed when a project loads; no size controls are added to the interface.

## Fixed labels

Pressing a button never changes its printed label. Play/pause keeps its combined symbol; power retains its fixed symbols; Bluetooth pairing retains its symbol or BLUETOOTH label. Property controls also use fixed titles. Mechanical position, lighting, `aria-pressed`/`aria-checked`, and displays communicate state. Tooltips and accessible descriptions may explain the available action without changing the equipment surface.

## Device-specific proportions

The `controlSizes` table covers controls for sources, receivers, integrated amplifiers, preamps, power amplifiers, headphone amplifiers, instruments, selectors, Bluetooth devices, active speakers, subwoofers, and Bluetooth headphones. The same component models are reused with dimensions suited to each function. The demo retains each model’s reference dimensions.

- Main volume and tuning receive greater emphasis; tone, selection, and auxiliary controls are smaller.
- Buttons with long labels use rectangular shapes, and labels fit the available height.
- The CD Player and Streamer have identical transport controls, now 52 × 28 px.
- The Tape Deck controls retain `vintageSteel` and `bakelite`, sized to fit around the VU meters and connections.
- The headphone amplifiers retain their three detailed cabinets and align controls with their respective channels.
- Speakers and headphones retain their cabinet and earcup proportions; controls and labels receive local adjustments.
- Mixers use the 180 px medium chassis to fit faders and labels; the three heights and two widths remain unchanged.

Panel layouts were adjusted alongside the table: sources, tone blocks, controls below displays, outputs, and switches each have their own space. Passive cabinets and furniture retain their proportions.

### Movement sounds

`Hardware.movementSounds` contains ten knob timbres and four slider timbres. Rubber and touch-disc controls use soft friction; machined aluminum and faceted selectors use drier contacts; bakelite uses a low contact sound; the flywheel uses low friction. Horizontal sliders, vertical faders, search, and pitch each have their own profiles.

`Hardware.movementSound(element, type)` resolves a profile from the shared construction. A sound plays only when the value actually changes through mouse, touch, or keyboard input; mounting, restoration, and programmatic updates do not produce movement sounds. Short envelopes and profile-specific minimum intervals avoid excessive overlap. All sounds respect the global interaction-sounds volume, including zero. Buttons retain their own press, release, and switch sounds.

The `catalogGear` profile in `uiSoundProfiles` produces a light catalog gear sound. `enableCatalogScrollSound` follows actual movement from mouse, touch, or keyboard input, including inertia; `playUiSound` receives intensity and pitch proportional to speed. The effect uses the same global volume, plays only after audio is unlocked, and does not queue sounds after scrolling stops.

### New button constructions

All appear automatically on the Model device under the identifiers below, and use the same adjustable-dimension and fixed-label systems.

| Model | Construction | Application |
| --- | --- | --- |
| `ivoryPiano` | Ivory with a beveled lower edge and hinged movement | Vintage generator frequency |
| `brassPill` | Metal capsule with a brass rim | DIRECT on the blue-meter integrated amp |
| `studioCap` | Dark technical cap with lower grooves and detent | Bench selectors and Start/Stop on the modern turntable |
| `flushMetal` | Flush brushed aluminum with short travel | 2.1 Control Preamp and silver integrated amp |
| `illuminatedBar` | Dark cap with integrated linear lens | Central Display Preamp, minimalist integrated amp, modern generator, and Bluetooth RX/TX |
| `membrane` | Rounded elastomer surface with short deformation | Available in the library |

Each construction reuses a suitable library contact sound (metallic, detent, low, or soft). The illuminated bar follows `aria-pressed` and turns off with power; labels do not change. CD/streamer transport controls and the `vintageSteel` buttons on the Tape Deck and vintage turntable retain their selected models.

### Labels and contrast

Printed colors are centralized in `--hw-legend-ink` and `--hw-legend-relief` per button model. Light metal, ivory, and brass use dark ink; graphite, membrane, and dark keys use light ink. Dark vintage controls use a warmed white. Nested text and SVG symbols inherit the same ink. Pressing a control, selecting it, or turning off the device does not change or dim its physical label; lenses and LEDs keep their own state indication.

`slideSelectorModern` is the LINE/PHONO variant on the modern turntable and is available on the Model device. It has an anodized graphite plate, fixed light labels, a dark track, and an aluminum slider with three grooves. It shares adjustable dimensions, two positions, contact sound, and interaction with `slideSelector`; the vintage turntable retains the original variant.

### Damage state

Visual components honor `state.damage`: the device is switched off and marked in its panel. Connection, warning, persistence, and audio-cutoff rules are described in [REVISAO-SINAIS.md](REVISAO-SINAIS.md#5-damage-and-overload).

### Generator readability

The SIGNAL/CHANNEL/SWEEP selectors use `vintageSteel` on vintage generators and `illuminatedBar` on modern ones. Frequency uses `ivoryPiano` on vintage models and `selectorKey` on modern ones; transport uses `vintageSteel`/`selectorKey`. Selector buttons are 34×24 px (duration buttons: 28×24), frequency buttons are 34×26, and transport buttons are 60×28. Selector labels use 7.5 px text; frequency symbols use 13 px. Material-defined color takes precedence over the generic vintage-theme preference, preventing light ink on light metal. Unavailable controls remain legible and keep their fixed labels.

## Audio logic

The current reference for signal levels, compatibility, power, impedance, damage, and simulation limits is [REVISAO-SINAIS.md](REVISAO-SINAIS.md). Constants and functions in `src/app/` define the parameters; this document focuses on the visual library and control interactions.
