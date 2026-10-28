# Audio signals and electrical model

Updated **October 27, 2026**, against the implementation in [script.js](../../script.js).

This document describes current behavior and its approximations. Code constants and functions are the source of parameters; this file is neither a test history nor a certification of physical equipment. The visual control library is described in [COMPONENTES.md](COMPONENTES.md).

## 1. Signal types

| Signal | Example sources | Appropriate use |
| --- | --- | --- |
| `line` | CD player, streamer, tape deck, generator, preamp, EQ, crossover, Bluetooth receiver, and LINE OUT | Line inputs on processors, amplifiers, and active speakers |
| `phono` | Turntable set to PHONO | PHONO MM input or phono-to-line converter with gain and RIAA correction |
| `headphone` | PHONES outputs | Headphones; a LINE input can also accept this signal with adaptation and volume adjustment |
| `amplified` | SPEAKER outputs | Passive speakers/subwoofers, speaker selectors, or a speaker-to-line converter |
| `interconnect` | Passive adapter, RCA selector, or matrix input | Accepts line, phono, and headphone signals while preserving the source level |
| `unknown` / `mixed` | Chain with no source yet / stereo port with different channel levels | Identifies an undefined source or a combination that should be reviewed |

SUB/LFE is a mono line-level audio function, not a separate electrical level. The low-pass filter follows the device model.

The connector does not determine the signal. RCA, 3.5 mm, 6.35 mm, and binding posts have their own physical rules; stereo 3.5 mm/6.35 mm connections preserve channels. The 6.35 mm input on the precision active speaker is explicitly mono.

## 2. Compatibility and warnings

`getPortCompatibility` checks direction, distinct devices, feedback loops, connectors, signal types, and the effect of a connection on the existing chain.

| Connection | Behavior |
| --- | --- |
| Appropriate level and compatible connector | Connects |
| PHONO → LINE/headphones | Allowed with a warning about low level and missing RIAA correction |
| LINE/headphones → PHONO MM | Allowed with an overload and incorrect tonal response warning; the phono stage clips locally |
| LINE → headphones | Allowed with a warning; the load reduces the level, and the adapter does not provide amplification |
| Headphones → LINE | Allowed with a warning to start at low volume |
| RCA with crossed L/R channels | Allowed with a warning; the connection swaps the destination channel |
| SPEAKER → sensitive input | Blocked, with the explicit damage simulation described below offered as an option |
| Connectors that do not fit, input → input, output → output, or a loop | Blocked |
| Speaker load below the amplifier minimum | Warns before connection; if confirmed, simulated protection mutes the channel |

Warnings appear before a potentially unsuitable connection is installed. Compatibility is reevaluated when the source or selection changes. A distortion warning does not mean that the equipment will be destroyed.

### Adapters and converters

- Passive adapters change connectors and channel distribution; they do not add gain, attenuation, or electrical conversion.
- Selectors and matrices route the selected paths while preserving the incoming level.
- The PHONO → LINE converter adds gain and approximate equalization.
- The Speaker → Line converter has a **20 kΩ** input and attenuates the physical voltage by **10:1**, in addition to converting the internal power scale to the line scale.
- Prospective analysis follows the signal through adapters to its destinations. An adapter does not hide the risk to equipment connected downstream.

## 3. Voltage, power, and load

`ELECTRICAL_MODEL` defines how digital samples are interpreted:

| Quantity | Simulation reference |
| --- | --- |
| Line/headphone sample | 1 instantaneous unit = `2 × √2` volts |
| SPEAKER sample | 1 instantaneous unit = 100 volts |
| PHONO MM playback gain | 100 times the voltage, or 40 dB |
| Standard line input | 47 kΩ |

These references belong to the simulator. They do not calibrate the sound-card voltage or the acoustic level heard by the user.

Power uses **RMS** voltage, while the waveshaper ceiling uses **peak** voltage:

```text
V_rms = RMS(SPEAKER samples) × 100
P = V_rms² / R
normalized_peak_limit = √(2 × P_rated × R) / 100
R_parallel = 1 / sum(1 / R_each_load)
```

`wattsAtLoad`, `peakLimitForWatts`, and `parallelOhms` centralize these relationships. `ampPowerAtLoad` estimates available power from the model’s fixed points; intermediate values and extrapolations are not additional measurements.

The 100 V-per-unit scale allows a digital output near its ceiling to represent hundreds of watts into 8 Ω. The **CURRENT** value in a speaker panel is the estimated RMS power of the playing audio and varies with signal level; the amplifier’s rated power indicates its maximum capability, not power delivered continuously.

### Load rules

- `terminalLoads` tracks connections, adapters, and selectors per channel. Left and right channels are not placed in parallel with each other.
- No load is an open circuit (`Infinity`) with zero delivered power, not a fictional 8 Ω speaker.
- A load below `minOhms` activates simulated protection. The tube amplifier reports when a suitable load is missing.
- Mute and solo change what is heard but do not disconnect the physical load.
- The passive subwoofer with L/R inputs represents **electrically isolated voice coils**. Impedance is specified per coil and total estimated power sums both. Summing audio in the simulator is not guidance to combine amplifier outputs.

Power, impedance, and output limits are fixed model properties. Older imported values do not replace these specifications. Volume, gain, and selection remain operating controls.

## 4. Headphones and shared outputs

`HEADPHONE_SPECS` defines headphone impedance; `HEADPHONE_OUTPUT_SPECS` defines maximum RMS voltage, maximum RMS current, and output resistance for headphone stages.

`installOutputCircuits` and `updateOutputCircuitLoads` apply:

- The resistive divider `R_load / (R_load + R_output)`.
- Available voltage limit of `min(V_max, I_max × R_load)`.
- Independent L/R audio paths for stereo outputs.
- Combined loads when 3.5 mm/6.35 mm outputs share the same stage.
- Per-channel loads shared by RCA and stereo outputs on sources that use the same source stage.

The headphone output indicator estimates power delivered to a 32 Ω load using the same output-resistance drop and current limit as the simulated circuit. It is neither the chip’s abstract maximum power nor an acoustic measurement.

Impedance in ohms affects the audio. On its own, it does not determine acoustic volume, quality, or how easy the headphones are to drive without knowing transducer sensitivity.

## 5. Damage and overload

### Speaker-level signal into a sensitive input

When SPEAKER level is routed to a line, phono, or headphone input, the program presents the risk before any damage occurs.

1. **Cancel:** leaves the device intact.
2. **Confirm simulation:** represents a deliberately energized connection and applies `state.damage` to the destination.

The incompatible cable is not installed or connected to Web Audio. Confirming represents hypothetical energization, even if the source device was switched off on the canvas; it is not a physical connection made by the displayed connector.

`applyDeviceDamage` switches off the destination, cuts its output, removes cables and pairings, and prevents it from being switched on or played. Damage persists in the project, is validated on load, and appears in the panel. The available recovery is to replace the device from the catalog.

### Available power does not mean automatic damage

An amplifier rated above a speaker’s recommended power has headroom. The level actually delivered determines the load.

Passive speakers do not receive an automatic DSP limiter. The program shows estimated current power and overload on models with a defined rated capacity. An amplifier recommendation is not treated as a measured thermal limit. Temperature and accumulated thermal damage are not calculated.

## 6. Sound signatures and metering

Speaker, subwoofer, and headphone profiles are in `LISTENING_PROFILES`; amplification stages are in `AMPLIFICATION_VOICINGS`. They define each model’s tonal and saturation differences. Subwoofers show the audio path low-pass cutoff (100 or 120 Hz) in the catalog; speakers and headphones show model-specific approximate curves. Electrical limits apply in addition to these characteristics.

Speaker/headphone curves are approximations using filters, level compensation, and model-specific responses. The tone graph does not represent absolute acoustic sensitivity or room response.

Power is measured from the corresponding SPEAKER stages without mixing auxiliary outputs or the other channel’s impedance. EQ level acts before its RCA and stereo outputs split. Bench meters monitor the line-chain signal.

The tube amplifier has a visual warm-up, gradual audio onset, and its own saturation profile. These are simulation choices with shortened timing.

## 7. Limitations and review status

The model uses nominal resistive impedances and simplified protection. Names and power ratings are educational model values, not certified specifications for physical products. The simulator does not reproduce complete circuits, frequency-dependent complex impedance, cartridge/cable capacitance, physical transformer taps, directivity, room acoustics, acoustic sensitivity, coil temperature, or real time to failure. RIAA is approximated with filters; moving-coil and ceramic cartridges do not have separate models.

The October 27 review checked amplifier specifications against their power-versus-load curves, confirmed profiles for all speaker and headphone types, checked subwoofer curves, and reviewed the electrical quantities shown in the catalog. Unit tests (`node --test tests/*.test.cjs`), bundle generation, and `script.js` syntax checks passed. Browser integration tests and listening comparisons were not performed in this review.
