# Wordmark source fonts

The supplied reference images name Newstar, Verona, Microgramma, Avant Garde,
New Zelek, Made Mirage, Star Avenue, and Harlow Solid. Those names identify the
visual references, not bundled fonts. The ten fictional identities use original
symbols, compositions and outlined lettering built from the following SIL OFL
fonts. Commercial reference fonts are not distributed or loaded.

| Reference | Outlined source | Manufacturer |
| --- | --- | --- |
| Harlow Solid | Pacifico | Aurenne |
| Microgramma | Audiowide | Veltron, Linholt |
| Avant Garde | Righteous | Nexora |
| New Zelek | Bungee | Korden, Axiomer |
| Verona | DM Serif Display | Bravora |
| Star Avenue | Righteous | Soryn |
| Made Mirage | DM Serif Display | Terevon |
| Newstar | Changa One | Dovara |

Sources: https://github.com/google/fonts/tree/main/ofl (directories audiowide,
righteous, bungee, dmserifdisplay, pacifico, changaone). Each original license is
included beside the TTF. The fonts are only build inputs; the application renders
local SVG paths and makes no remote font request for these identities.

Regenerate the outlined lettering with `python3 tools/build-brand-lettering.py`
(requires fonttools and uharfbuzz), then `node tools/build-brand-assets.cjs`.
