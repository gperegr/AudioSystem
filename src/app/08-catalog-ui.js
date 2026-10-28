/* Catalog visuals, search, category layout, hover signatures, and port normalization. */
        function catalogIcon(type) {
            const rack = '<rect x="4" y="10" width="48" height="24" rx="3"/>';
            const pair = '<circle cx="13" cy="27" r="2"/><circle cx="20" cy="27" r="2"/>';
            let drawing;
            if(type==='pendantLamp'){
                drawing='<path d="M28 3v19M13 27q15-12 30 0H13m-15 0h60M24 29v9q4 8 8 0v-9m-6 5h4"/>';
            } else if(WALL_LAMP_TYPES[type]){
                drawing={
                    wallLampCage:'<ellipse cx="28" cy="6" rx="9" ry="3"/><path d="M28 9v4m-6 0h12l2 6H20zM17 19h22v17q-3 8-11 8t-11-8zM17 26h22M18 35h20M22 20v20m12-20v20"/><path d="M24 22q-2 11 4 15 6-4 4-15m-6 6 2-3 2 3-2 3"/>',
                    wallLampDome:'<ellipse cx="28" cy="6" rx="9" ry="3"/><path d="M28 9v9m-5 0h10l2 4H21zM5 31q10-10 23-10t23 10q-23 8-46 0zM23 33v6q0 5 5 5t5-5v-6m-7 3 2-2 2 2-2 3"/>'
                }[type];
            } else if (FURNITURE_TYPES[type]) {
                drawing = type === 'furnitureTable' ? '<path d="M5 15h46v5H5zM10 20v20m36-20v20M12 26h32"/>' : type === 'furnitureNiche' ? '<path d="M6 10h44v28H6zM11 15h34v18H11z"/>' : '<path d="M9 5h38v34H9zM9 16h38M9 27h38M13 39v4m30-4v4"/>';
            } else if (INTERFACE_DEVICES[type]) {
                drawing = AudioAdapterDesign.models[type]?AudioAdapterDesign.icon(type):'<rect x="6" y="11" width="44" height="24" rx="3"/><circle cx="14" cy="23" r="3"/><circle cx="42" cy="23" r="3"/><path d="M21 23h14m-4-4 4 4-4 4"/><path d="m26 13-3 6h6l-3 6"/>';
            } else if(type==='streamIntegrated'){
                drawing='<path d="M5 12h46v27H5ZM19 12V8h18v4M5 34h46M8 15v17m40-17v17"/><rect x="17" y="17" width="23" height="14" rx="1"/><path d="m20 27 5-5 5 3 6-5m9-3v2m0 4v2M10 38h4m28 0h4"/><circle cx="11" cy="28" r="2"/>';
            } else if(type==='turntableBelt'){
                drawing='<path d="M3 34h50v5H3zM6 32V9h44v23M10 29h29v3H10zm26-8h10v10m-3-10H23l-7 6M7 37h3"/>';
            } else if(type==='turntableDirect'){
                drawing='<path d="M3 9h50v29H3zM3 29h50M8 24h29v4H8zM10 26h2m2 0h2m2 0h2m2 0h2m2 0h2m2 0h2m2 0h2M43 15v9M43 15H28l-9 5M7 34h5m4 0h3m3 0h3m22-3v6"/>';
            } else if(type==='turntableLinear'){
                drawing='<path d="M3 8h50v29H3zM3 24h50M7 15h35M8 21h26m-23-2h20m8-7v9m4-9v9M7 29h8m-8 4h8m6-4h2m4 0h2m6 0h12m-12 4h12"/>';
            } else if (TURNTABLE_TYPES.has(type)) {
                drawing = '<rect x="5" y="6" width="46" height="33" rx="3"/><circle cx="23" cy="22" r="12"/><circle cx="23" cy="22" r="3"/><path d="M43 12v13l-6 5M11 35h7"/>';
            } else if(type==='preClassic'){drawing='<rect x="3" y="8" width="50" height="30" rx="1"/><path d="M6 10h44v26H6z"/>'+[13,24,38,46].flatMap(x=>[17,28].map(y=>`<circle cx="${x}" cy="${y}" r="3"/>`)).join('')+'<path d="M29 24v7m4-7v7"/>';
            } else if(type==='preGlass'){drawing=rack+'<path d="M8 13v18m40-18v18M11 28h34"/><circle cx="16" cy="20" r="4"/><circle cx="28" cy="20" r="2"/><circle cx="40" cy="20" r="4"/><path d="M16 30v3m6-3v3m6-3v3m6-3v3m6-3v3"/>';
            } else if(type==='prePrecision'){drawing=rack+'<rect x="9" y="15" width="15" height="13" rx="2"/><path d="m16 25-4-6m5 6 4-7M29 17v9m4-7v7"/><circle cx="42" cy="22" r="6"/><path d="m42 22 3-3"/>';
            } else if(type==='integratedUtility'){drawing=rack+'<circle cx="16" cy="23" r="3"/><circle cx="25" cy="23" r="3"/><circle cx="44" cy="23" r="6"/><path d="M31 17h3m-3 4h3m-3 4h3M10 31h36"/>';
            } else if(type==='tapeDeck'){drawing='<rect x="7" y="3" width="42" height="40" rx="2"/><circle cx="18" cy="17" r="8"/><circle cx="38" cy="17" r="8"/><circle cx="18" cy="17" r="2"/><circle cx="38" cy="17" r="2"/><path d="M13 33h14m5 0h10M13 37h7"/>';
            } else if(CUSTOM_PREAMPS[type]){drawing=rack+(type==='preReference'?'<path d="M7 13v18m42-18v18"/><rect x="20" y="15" width="16" height="12" rx="1"/><circle cx="13" cy="21" r="4"/><circle cx="43" cy="21" r="4"/>':type==='preControl'?'<rect x="20" y="15" width="14" height="7" rx="1"/><circle cx="12" cy="23" r="4"/><circle cx="43" cy="22" r="6"/><path d="M22 28h2m4 0h2m4 0h2"/>':'<circle cx="12" cy="22" r="5"/><circle cx="44" cy="22" r="5"/><rect x="22" y="14" width="12" height="16" rx="1"/><path d="M25 19h6m-6 5h4"/>');
            } else if(type==='preamp'){drawing=rack+'<circle cx="31" cy="22" r="5"/><circle cx="43" cy="22" r="3"/><path d="M10 17h12m-12 6h3m3 0h3m3 0h3"/>';
            } else if(BENCH_METER_TYPES.has(type)){drawing=rack+(type==='benchMeterVintage'?'<path d="M9 16h15v11H9zM12 24l4-5M29 27l4-7 4 4 5-9 5 12"/>':'<rect x="9" y="15" width="38" height="15" rx="1"/><path d="M13 19h19M13 25h27M37 19h6"/>');
            } else if (type === 'cdPlayer') {
                drawing = rack + '<rect x="11" y="16" width="25" height="5" rx="1"/><path d="M13 28h20"/><circle cx="44" cy="22" r="3"/>';
            } else if(SIGNAL_GENERATOR_TYPES.has(type)){
                drawing=rack+'<path d="M10 22c5-13 9 13 14 0s9 13 14 0"/><circle cx="45" cy="22" r="2"/>';
            } else if (type === 'streamer') {
                drawing = rack + '<path d="M13 17h14v10H13zM35 18a9 9 0 0 1 10 0M37 22a5 5 0 0 1 6 0"/><circle cx="40" cy="26" r="1"/>';
            } else if (type.startsWith('bt')) {
                drawing = '<rect x="12" y="5" width="32" height="35" rx="6"/><path d="M27 11v23l9-7.5L21 15.5M21 29.5 36 18.5 27 11"/>' + (type === 'btReceiverA' ? '<path d="M3 22h6m-3-3 3 3-3 3"/>' : '<path d="M47 22h6m-3-3 3 3-3 3"/>');
            } else if (type.startsWith('eq')) {
                drawing = rack + '<path d="M14 15v14m9-14v14m10-14v14m9-14v14M11 20h6m3 5h6m4-8h6m3 5h6"/>';
            } else if(INTEGRATED_AMPS[type]){
                drawing=rack+(type==='integratedMinimal'?'<circle cx="15" cy="22" r="6"/><path d="M26 22h3m4 0h3m4 0h3"/><circle cx="47" cy="22" r="2"/>':'<rect x="17" y="15" width="10" height="10" rx="1"/><rect x="29" y="15" width="10" height="10" rx="1"/><path d="m20 22 3-4m9 4 3-4"/><circle cx="10" cy="24" r="3"/><circle cx="46" cy="24" r="4"/>');
            } else if (['receiver','powerAmp'].includes(type)) {
                drawing = rack + '<rect x="10" y="15" width="25" height="9" rx="1"/><path d="M14 19h17M11 29h20"/><circle cx="43" cy="22" r="6"/><path d="m43 22 2-3"/>';
            } else if(CUSTOM_POWER_AMPS[type]){
                drawing=type==='powerValve'?'<path d="M4 31h48v10H4zM8 31V15h12v16m5 0V10h10v21m5 0V15h9v16"/><rect x="10" y="20" width="6" height="12" rx="3"/><rect x="25" y="17" width="6" height="15" rx="3"/><rect x="39" y="20" width="6" height="12" rx="3"/>':rack+(type==='powerDual'?'<path d="M9 13v17m38-17v17M20 29h16"/><circle cx="24" cy="20" r="1"/><circle cx="32" cy="20" r="1"/>':'<circle cx="28" cy="21" r="8"/><path d="m28 21-4-3M8 13v18m4-18v18m32-18v18m4-18v18"/>');
            } else if (['powerStereo','powerVintage'].includes(type)) {
                drawing = rack + '<path d="M10 16v12m4-12v12m28-12v12m4-12v12M27 16v12m3-12v12"/><circle cx="21" cy="22" r="4"/><circle cx="36" cy="22" r="4"/>';
            } else if (type.startsWith('headphoneAmp')) {
                drawing = rack + '<path d="M10 21a5 5 0 0 1 10 0v6m-10-6v6"/><circle cx="31" cy="22" r="6"/><path d="m31 22 2-3"/>' + (type === 'headphoneAmp4' ? '<circle cx="43" cy="17" r="1"/><circle cx="47" cy="17" r="1"/><circle cx="43" cy="26" r="1"/><circle cx="47" cy="26" r="1"/>' : '<circle cx="45" cy="22" r="2"/>');
            } else if (type.startsWith('mixer')) {
                drawing = rack + '<path d="M15 15v14m12-14v14m12-14v14M12 19h6m6 6h6m6-8h6"/><circle cx="46" cy="27" r="1"/>';
            } else if (type.startsWith('crossover')) {
                drawing = rack + '<path d="M10 22h11m0 0 9-7h14m-23 7h23m-23 0 9 7h14"/>';
            } else if (/Switch|Matrix/.test(type)) {
                drawing = rack + (type.startsWith('speaker') ? '<path d="M11 17h6v10h-6zM39 17h6v10h-6zM20 22h8m0 0 7-5m-7 5 7 5"/>' : type.startsWith('rcaMatrix') ? '<path d="M13 16h7m-7 6h7m-7 6h7m3-6h10m0-6h10m-10 4h10m-10 4h10m-10 4h10m-16-6 6-6"/>' : '<path d="M11 22h12m0 0 10-6h11m-11 12h11"/><circle cx="11" cy="22" r="2"/><circle cx="44" cy="16" r="2"/><circle cx="44" cy="28" r="2"/>');
            } else if (type.startsWith('subwoofer')) {
                drawing = '<rect x="11" y="5" width="34" height="34" rx="2"/><circle cx="28" cy="21" r="11"/><circle cx="28" cy="21" r="5"/><path d="M20 35h16"/>' + (type.includes('Passive') ? '' : '<path d="M41 8v4"/>');
            } else if(BOOKSHELF_SPEAKERS[type]){
                drawing=type==='shelfCoax'?'<rect x="15" y="4" width="26" height="36" rx="6"/><circle cx="28" cy="21" r="10"/><circle cx="28" cy="21" r="3"/><path d="m28 11 0 7m0 6v7m-10-10h7m6 0h7"/>':type==='shelfWood'?'<rect x="16" y="3" width="24" height="38" rx="1"/><circle cx="28" cy="12" r="4"/><circle cx="28" cy="28" r="9"/><circle cx="28" cy="28" r="4"/><path d="M19 5v34m18-34v34"/>':'<rect x="17" y="11" width="22" height="30" rx="3"/><circle cx="28" cy="5" r="4"/><path d="M28 9v2"/><circle cx="28" cy="25" r="9"/><circle cx="28" cy="25" r="4"/>';
            } else if(type==='spkElectrostatic'){drawing='<path d="M5 5h46v30H5zM9 8h38v23H9zM11 35 8 43h8l2-8m20 0 2 8h8l-3-8M13 12h30m-30 4h30m-30 4h30m-30 4h30m-30 4h30"/>';
            } else if(FLOOR_SPEAKERS[type]){
                drawing=type==='floorDiamond'?'<path d="M19 9h18v30H19zM17 40h22M22 43v-3m12 0v3"/><circle cx="28" cy="5" r="3"/><circle cx="28" cy="16" r="4"/><circle cx="28" cy="26" r="5"/><circle cx="28" cy="35" r="3"/>':type==='floorCoax'?'<path d="M21 3h14v36H21zM17 40h22m-18 3v-3m14 0v3"/><circle cx="28" cy="9" r="4"/><circle cx="28" cy="17" r="3.5"/><circle cx="28" cy="23" r="2.5"/><circle cx="28" cy="29" r="3.5"/><circle cx="28" cy="36" r="3"/>':'<path d="M18 3h20v36H18zM16 40h24m-20 3v-3m16 0v3"/><circle cx="28" cy="9" r="4"/><circle cx="28" cy="16" r="1.6"/><circle cx="28" cy="22" r="4"/><circle cx="28" cy="30" r="4"/><path d="M24 36h8"/>';
            } else if (type.startsWith('spk') || type === 'speaker') {
                drawing = '<rect x="15" y="3" width="26" height="36" rx="2"/>' + (type.includes('Grid') ? '<path d="M21 8v25m7-25v25m7-25v25M19 14h18M19 22h18M19 30h18M19 40v3h18v-3"/>' : '<circle cx="28" cy="12" r="4"/><circle cx="28" cy="27" r="8"/>' + (type.includes('Active') ? '<path d="M37 6v3"/>' : ''));
            } else if(type==='hpKubaDisco2'){
                drawing='<path d="M9 31V21C9-3 47-3 47 21v10M12 29v-8C12 1 44 1 44 21v8"/><rect x="7" y="24" width="11" height="17" rx="4"/><rect x="38" y="24" width="11" height="17" rx="4"/><path d="M14 27v11m28-11v11M12 41q2 5 16 7 14-2 16-7m-16 7v3"/>';
            } else if(REFERENCE_HEADPHONES[type]){
                const band='<path d="M13 24v-6a15 15 0 0 1 30 0v6M17 18a11 11 0 0 1 22 0"/>';
                drawing=band+(type==='hpOpenRing'?'<ellipse cx="13" cy="32" rx="9" ry="11"/><ellipse cx="43" cy="32" rx="9" ry="11"/><ellipse cx="13" cy="32" rx="5" ry="7"/><ellipse cx="43" cy="32" rx="5" ry="7"/><path d="m7 30 12 4m18-4 12 4"/>':type==='hpOpenDome'?'<ellipse cx="13" cy="32" rx="9" ry="10"/><ellipse cx="43" cy="32" rx="9" ry="10"/><path d="m13 25 5 4v6l-5 4-5-4v-6Zm30 0 5 4v6l-5 4-5-4v-6Z"/>':'<circle cx="13" cy="33" r="10"/><circle cx="43" cy="33" r="10"/><path d="M6 29h14M6 33h14M6 37h14M36 29h14M36 33h14M36 37h14M17 20q11-10 22 0"/>');
            } else if (type.startsWith('hp') || type === 'headphone') {
                const headband='<path d="M13 23v-3a15 15 0 0 1 30 0v3M17 18a11 11 0 0 1 22 0"/>';
                if(type==='hpClassic'){
                    drawing=headband+'<circle cx="13" cy="31" r="9"/><circle cx="43" cy="31" r="9"/><circle cx="13" cy="31" r="5.5"/><circle cx="43" cy="31" r="5.5"/><path d="M13 40v3"/>';
                }else if(type==='hpMonitor'){
                    drawing=headband+'<rect x="6" y="23" width="14" height="18" rx="5"/><rect x="36" y="23" width="14" height="18" rx="5"/><path d="M10 28v8m4-9v10m28-10v10m4-9v8M13 41v3" stroke-width="1.2"/>';
                }else if(type==='hpMax'){
                    drawing='<path d="M13 23v-3a15 15 0 0 1 30 0v3"/><path d="M17 12a12 12 0 0 1 22 0q-11 5-22 0Z" stroke-width="1.1"/><path d="M21 9v4m3-6v7m4-7v8m4-8v7m3-5v4" stroke-width=".65" opacity=".55"/><rect x="5" y="23" width="16" height="20" rx="6"/><rect x="35" y="23" width="16" height="20" rx="6"/><path d="M9 28v10m30-10v10M46 21h2" stroke-width="1.2"/>';
                }else{
                    drawing=headband+'<rect x="5" y="23" width="16" height="20" rx="8"/><rect x="35" y="23" width="16" height="20" rx="8"/><path d="M10 28v10m3-12v14m3-12v10m24-10v10m3-12v14m3-12v10M13 43v2" stroke-width="1.1"/>';
                }
            } else {
                drawing = rack + pair;
            }
            // One solid color per equipment; geometry describes its construction.
            const details={
                receiver:rack+'<path d="M8 15h9v8H8zM19 15h9v8h-9zM31 15h15v8H31zM33 19h11M8 28h23"/><circle cx="44" cy="28" r="3"/><path d="m10 21 3-3m8 3 3-3"/>',
                powerAmp:rack+'<rect x="9" y="14" width="30" height="12" rx="1"/><path d="M12 17h8m-8 3h8m4-3h11m-11 3h11M14 30h18"/><circle cx="46" cy="20" r="4"/><circle cx="46" cy="29" r="2"/>',
                integratedBlue:rack+'<rect x="10" y="14" width="15" height="10" rx="1"/><rect x="29" y="14" width="15" height="10" rx="1"/><path d="m13 21 5-4m14 4 5-4M21 29h14"/><circle cx="10" cy="29" r="3"/><circle cx="46" cy="29" r="3"/>',
                integratedSilver:rack+'<path d="M7 12v20m42-20v20M19 15h9v10h-9zM30 15h9v10h-9zM22 23l3-5m8 5 3-5"/><circle cx="12" cy="20" r="4"/><circle cx="44" cy="21" r="4"/><path d="M17 29h3m4 0h3m4 0h3m4 0h3"/>',
                powerStereo:rack+'<path d="M9 13v18m38-18v18M15 18h9m-9 4h9m8-4h9m-9 4h9"/><circle cx="20" cy="28" r="3"/><circle cx="36" cy="28" r="3"/>',
                powerVintage:rack+'<rect x="10" y="15" width="13" height="10" rx="1"/><rect x="32" y="15" width="13" height="10" rx="1"/><path d="m13 23 4-5m18 5 4-5M10 30h35"/>',
                headphoneAmp4:rack+'<path d="M8 15h40"/>'+[12,23,34,45].map(x=>`<circle cx="${x}" cy="22" r="3"/><circle cx="${x}" cy="29" r="1.3"/>`).join(''),
                headphoneAmpModern:rack+'<rect x="11" y="15" width="19" height="9" rx="1"/><path d="M14 19h12"/><circle cx="40" cy="22" r="6"/><circle cx="14" cy="29" r="1.5"/><circle cx="22" cy="29" r="1.5"/>',
                headphoneAmp:rack+'<path d="M8 12v20m40-20v20"/><rect x="12" y="15" width="14" height="10" rx="1"/><path d="m15 23 4-5"/><circle cx="37" cy="22" r="5"/><circle cx="19" cy="29" r="1.5"/>',
                signalGenerator:rack+'<rect x="8" y="14" width="20" height="14" rx="1"/><path d="M10 21q3-8 6 0t6 0M32 16h12m-12 5h12M32 28h3m4 0h3"/><circle cx="47" cy="28" r="3"/>',
                signalGeneratorVintage:rack+'<path d="M7 12v20m42-20v20"/><rect x="10" y="15" width="18" height="13" rx="1"/><path d="M13 19h2m2 0h2m2 0h2m-10 5h10M32 17h12m-12 5h12"/><circle cx="35" cy="28" r="2"/><circle cx="44" cy="28" r="3"/>',
                benchMeterVintage:rack+'<path d="M8 15h17v13H8zM30 15h17v13H30zM11 25l6-6m16 6 6-6"/>',
                spkActiveRounded:'<rect x="14" y="3" width="28" height="36" rx="10"/><ellipse cx="28" cy="12" rx="9" ry="5"/><circle cx="28" cy="12" r="2"/><circle cx="28" cy="27" r="9"/><circle cx="28" cy="27" r="4"/><path d="M20 40h16v3H20z"/>',
                spkActiveCompact:'<rect x="17" y="3" width="22" height="39" rx="2"/><circle cx="28" cy="12" r="4"/><circle cx="28" cy="27" r="8"/><circle cx="28" cy="27" r="3"/><path d="M21 38h5m5 0h3"/>',
                spkActiveBookshelf:'<rect x="15" y="3" width="26" height="39" rx="3"/><circle cx="28" cy="12" r="4"/><circle cx="28" cy="27" r="9"/><circle cx="28" cy="27" r="4"/><path d="M20 38h6"/><circle cx="34" cy="38" r="1.5"/>',
                spkActiveMonitor:'<path d="M14 3h28v39H14zM17 5v34m22-34v34"/><circle cx="28" cy="12" r="4"/><circle cx="28" cy="27" r="8"/><path d="M20 38h6"/><circle cx="34" cy="38" r="2"/>',
                spkPassiveCarbon:'<rect x="15" y="3" width="26" height="39" rx="3"/><circle cx="28" cy="12" r="4"/><circle cx="28" cy="28" r="9"/><circle cx="28" cy="28" r="4"/>',
                spkPassiveWood:'<path d="M14 3h28v39H14zM17 5v35m22-35v35"/><circle cx="28" cy="12" r="4"/><circle cx="28" cy="28" r="8"/><circle cx="28" cy="28" r="3"/>',
                subwoofer:'<rect x="10" y="5" width="36" height="34" rx="3"/><circle cx="28" cy="21" r="12"/><circle cx="28" cy="21" r="5"/><circle cx="16" cy="35" r="1.5"/><circle cx="40" cy="35" r="1.5"/><path d="M15 39v3m26-3v3"/>',
                subwooferCube:'<rect x="10" y="4" width="36" height="36" rx="2"/><circle cx="28" cy="22" r="13"/><circle cx="28" cy="22" r="5"/><path d="M14 40v3m28-3v3"/>',
                subwooferPro:'<rect x="12" y="2" width="32" height="39" rx="2"/><circle cx="28" cy="18" r="12"/><circle cx="28" cy="18" r="5"/><rect x="18" y="33" width="20" height="4" rx="2"/><path d="M16 41v2m24-2v2"/>',
                subwooferPassive:'<rect x="10" y="4" width="36" height="36" rx="2"/><circle cx="28" cy="20" r="12"/><circle cx="28" cy="20" r="5"/><path d="M20 35h16M15 40v3m26-3v3"/>',
                subwooferPassiveVintage:'<path d="M10 4h36v36H10zM13 6v32m30-32v32"/><circle cx="28" cy="20" r="11"/><circle cx="28" cy="20" r="5"/><circle cx="20" cy="35" r="2"/><circle cx="36" cy="35" r="2"/>'
            };
            if(details[type])drawing=details[type];
            if(['spkPassiveGridBlack','spkPassiveGridOrange'].includes(type))drawing='<rect x="14" y="2" width="28" height="36" rx="1"/><path d="M18 6v28m7-28v28m6-28v28m7-28v28M17 11h22M17 18h22M17 25h22M17 32h22M18 39v4h20v-4"/>';
            if(FURNITURE_TYPES[type]?.rack){const count=type==='furnitureRackSix'||type==='furnitureRackSixTall'?6:4;drawing='<path d="M8 3h40v38H8zM12 41v3m32-3v3"/>'+Array.from({length:count},(_,i)=>`<path d="M10 ${5+i*34/(count-1)}h36"/>`).join('');}
            if(type==='furnitureCoverflow')drawing='<path d="M3 6h50v34H3zM6 9h44v25H6zM6 36h44M9 40v3m38-3v3"/><path d="M9 13v19m4-19v19m4-19v19m4-19v19"/><rect x="25" y="12" width="13" height="19" rx="1"/><circle cx="40" cy="22" r="8"/><circle cx="40" cy="22" r="2"/><path d="M40 14v2m7 6h-2m-5 8v-2m-6-6h2"/><path d="M49 13v19"/>';
            if(type==='cdCollection')drawing='<path d="M5 7h46v32H5zM8 37h40M10 10v26m4-26v26m4-26v26m4-26v26m4-26v26m4-26v26m4-26v26m4-26v26m4-26v26m4-26v26"/>';
            if(type==='turntableVintage')drawing='<path d="M5 7h46v32H5zM8 10v26m40-26v26"/><circle cx="24" cy="22" r="12"/><circle cx="24" cy="22" r="3"/><path d="M43 12v12l-6 6M12 35h6"/>';
            if(type==='eqVintage')drawing=rack+'<path d="M8 12v20m40-20v20M14 15v14m7-14v14m7-14v14m7-14v14m7-14v14M12 22h4m3-4h4m3 7h4m3-5h4m3 4h4"/>';
            if(type==='mixerVintage')drawing=rack+'<path d="M8 12v20m40-20v20M15 22v8m9-8v8m9-8v8m9-8v8M13 26h4m5-2h4m5 3h4m5-2h4"/>'+[15,24,33,42].map(x=>`<circle cx="${x}" cy="17" r="2"/>`).join('');
            const colors={
                turntable:'#9cbbc0',turntableVintage:'#c4ad83',cdPlayer:'#b2bec7',tapeDeck:'#b8bcb0',streamer:'#85b7bb',
                receiver:'#c8b28b',powerAmp:'#88b3c7',powerStereo:'#9faebc',powerVintage:'#baa889',powerValve:'#c3ad86',powerDual:'#94a7b3',powerBias:'#9cbfcf',
                integratedBlue:'#7eadd2',integratedMinimal:'#91b79a',integratedSilver:'#c9baa0',preamp:'#a7b9bb',preReference:'#acd19a',preControl:'#b2c8d3',preDisplay:'#96abbf',
                benchMeter:'#8cbfc3',benchMeterVintage:'#c9be91',signalGenerator:'#8fbac9',signalGeneratorVintage:'#bec785',
                spkPassiveGridBlack:'#a6acb3',spkPassiveGridOrange:'#df985f',spkPassiveWood:'#bea27e',spkPassiveCarbon:'#9aafbd',speaker:'#b7a083',
                spkActiveRounded:'#9caeb0',spkActiveCompact:'#d0c7ab',spkActiveBookshelf:'#a8b9c6',spkActiveMonitor:'#c4aa87',
                shelfCoax:'#c8a07c',shelfWood:'#c09a7c',shelfTop:'#afbac3',floorDiamond:'#b4ada0',floorCoax:'#c4ccc6',floorFlax:'#c4b48d',
                subwoofer:'#9cabb5',subwooferCube:'#a8b9bc',subwooferPro:'#c18f94',subwooferPassive:'#a2b1bd',subwooferPassiveVintage:'#bba282',
                headphone:'#a6b6c2',hpStudio:'#9db9c7',hpClassic:'#c3aa86',hpMonitor:'#bfa77c',hpMax:'#c0cbce',hpOpenRing:'#aebfc8',hpOpenDome:'#acb4c0',hpPlanar:'#b49c81',
                headphoneAmp:'#c6ab87',headphoneAmpModern:'#91b7c7',headphoneAmp4:'#a1b7c0',eqStudio:'#9eb7c5',eqVintage:'#c5ad86',mixer:'#a4b6c6',mixerVintage:'#bfa385',
                crossover:'#93b8bf',crossoverVintage:'#c3ae8b',btReceiverA:'#8abac8',btTransmitterPro:'#99b7cc',
                rcaSwitch:'#a4b5c1',rcaSwitchVintage:'#bda98a',speakerSwitch:'#9eb8bc',speakerSwitchVintage:'#c1a785',rcaMatrix:'#9bacc3',rcaMatrixVintage:'#b9a88b',
                furnitureRack:'#a5b3ad',furnitureCoverflow:'#c19a71',furnitureRackTall:'#a0b1ab',furnitureRackSix:'#9baaa6',furnitureRackSixTall:'#92a5a0',furnitureTable:'#baa48a',furnitureNiche:'#b7a58d',cdCollection:'#b88a62',pendantLamp:'#e6b674',wallLampCage:'#d8b879',wallLampDome:'#d9ae75'
            };
            const color=colors[type]||(INTERFACE_DEVICES[type]?.passive?'#b6b5aa':DEVICE_FAMILIES[type]==='vintage'?'#c0ab8a':'#a0b8c4');
            drawing=drawing.replace(/ opacity="[^"]*"/g,'');
            return `<svg class="catalog-equipment-icon" style="color:${color}" viewBox="0 0 56 46" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${drawing}</svg>`;
        }
        const headphoneCatalogGrid=equipmentCatalog.querySelector('[data-template="hpStudio"]').closest('.grid');
        [['hpMonitor','Fone Monitor'],['hpMax','Fone Max'],...Object.keys(REFERENCE_HEADPHONES).map(type=>[type,DEVICE_NAMES[type]])].forEach(([type,label])=>{
            const item=document.createElement('div');item.className='catalog-item rounded-lg p-3 flex flex-col items-center justify-center gap-2';item.dataset.template=type;
            item.innerHTML=`<div></div><span class="text-xs text-center text-gray-300">${label}</span>`;headphoneCatalogGrid.appendChild(item);if(REFERENCE_HEADPHONES[type])catalogDescriptions[type]=REFERENCE_HEADPHONES[type].description;
        });
        const switchCatalogSection=document.createElement('div');switchCatalogSection.className='mb-6';
        switchCatalogSection.innerHTML='<h3 class="text-[10px] font-bold text-gray-500 mb-3 tracking-wider uppercase">Seletores</h3><div class="grid grid-cols-2 gap-3"></div>';
        const switchCatalogItems=[...equipmentCatalog.querySelectorAll('.catalog-item')].filter(item=>SELECTOR_TYPES.has(item.dataset.template)||MATRIX_TYPES.has(item.dataset.template));
        if(switchCatalogItems.length){
            const originalSections=new Set(switchCatalogItems.map(item=>item.closest('.mb-6')));
            switchCatalogItems[0].closest('.mb-6').after(switchCatalogSection);
            switchCatalogItems.forEach(item=>switchCatalogSection.querySelector('.grid').appendChild(item));
            originalSections.forEach(section=>{if(!section.querySelector('.catalog-item'))section.remove();});
        }
        const processingGrid=equipmentCatalog.querySelector('[data-template="preamp"]').closest('.mb-6').querySelector('.grid');
        Object.keys(INTEGRATED_AMPS).forEach(type=>{
            const item=document.createElement('div');item.className='catalog-item rounded-lg p-3 flex flex-col items-center justify-center gap-2';item.dataset.template=type;
            item.innerHTML=`<div></div><span class="text-xs text-center text-gray-300">${DEVICE_NAMES[type]}</span>`;processingGrid.appendChild(item);
            catalogDescriptions[type]=INTEGRATED_AMPS[type].description;
        });
        Object.keys(CUSTOM_PREAMPS).forEach(type=>{
            const item=document.createElement('div');item.className='catalog-item rounded-lg p-3 flex flex-col items-center justify-center gap-2';item.dataset.template=type;item.innerHTML=`<div></div><span class="text-xs text-center text-gray-300">${DEVICE_NAMES[type]}</span>`;processingGrid.appendChild(item);catalogDescriptions[type]=CUSTOM_PREAMPS[type].description;
        });
        Object.keys(CUSTOM_POWER_AMPS).forEach(type=>{
            const item=document.createElement('div');item.className='catalog-item rounded-lg p-3 flex flex-col items-center justify-center gap-2';item.dataset.template=type;item.innerHTML=`<div></div><span class="text-xs text-center text-gray-300">${DEVICE_NAMES[type]}</span>`;processingGrid.appendChild(item);catalogDescriptions[type]=CUSTOM_POWER_AMPS[type].description;
        });
        const speakerCatalogSection=equipmentCatalog.querySelector('[data-template="spkPassiveWood"]').closest('.mb-6');
        Object.keys({...FLOOR_SPEAKERS,...BOOKSHELF_SPEAKERS,spkActiveRounded:{}}).forEach(type=>{
            const item=document.createElement('div');item.className='catalog-item rounded-lg p-3 flex flex-col items-center justify-center gap-2';item.dataset.template=type;item.innerHTML=`<div></div><span class="text-xs text-center text-gray-300">${DEVICE_NAMES[type]}</span>`;speakerCatalogSection.querySelector('.grid').appendChild(item);if(type!=='spkActiveRounded')catalogDescriptions[type]=(FLOOR_SPEAKERS[type]||BOOKSHELF_SPEAKERS[type]).description;
        });
        for(const [title,types] of [['Caixas Ativas',ACTIVE_SPK],['Caixas Passivas',PASSIVE_SPK],['Subwoofers',new Set([...SUB_TYPES,...PASSIVE_SUB_TYPES])]]){
            const section=document.createElement('div');section.className='mb-6';
            section.innerHTML=`<h3 class="text-[10px] font-bold text-gray-500 mb-3 tracking-wider uppercase">${title}</h3><div class="grid grid-cols-2 gap-3"></div>`;
            const grid=section.querySelector('.grid');
            [...speakerCatalogSection.querySelectorAll('.catalog-item')].filter(item=>types.has(item.dataset.template)).forEach(item=>grid.appendChild(item));
            speakerCatalogSection.before(section);
        }
        speakerCatalogSection.remove();
        const interfaceSection = document.createElement('div');
        interfaceSection.className = 'mb-6';
        interfaceSection.innerHTML = '<h3 class="text-[10px] font-bold text-gray-500 mb-3 tracking-wider uppercase">Adaptadores & Conversores</h3><div class="grid grid-cols-2 gap-3">' + Object.entries(INTERFACE_DEVICES).map(([type,config])=>`<div class="catalog-item rounded-lg p-3 flex flex-col items-center justify-center gap-2" data-template="${type}"><div></div><span class="text-xs text-center text-gray-300">${DEVICE_NAMES[type]}</span></div>`).join('') + '</div>';
        equipmentCatalog.querySelector('.flex-1.overflow-y-auto').appendChild(interfaceSection);
        const furnitureSection=document.createElement('div');furnitureSection.className='mb-6';
        furnitureSection.innerHTML='<h3 class="text-[10px] font-bold text-gray-500 mb-3 tracking-wider uppercase">Móveis</h3><div class="grid grid-cols-2 gap-3">'+[...Object.keys(FURNITURE_TYPES),'pendantLamp',...Object.keys(WALL_LAMP_TYPES)].map(type=>`<div class="catalog-item rounded-lg p-3 flex flex-col items-center justify-center gap-2" data-template="${type}"><div></div><span class="text-xs text-center text-gray-300">${DEVICE_NAMES[type]}</span></div>`).join('')+'</div>';
        equipmentCatalog.querySelector('.flex-1.overflow-y-auto').appendChild(furnitureSection);
        // Build the final catalogue by function after all generated models are present.
        const catalogContainer=equipmentCatalog.querySelector('.flex-1.overflow-y-auto');
        const catalogItems=[...catalogContainer.querySelectorAll('.catalog-item[data-template]')];
        const previousCatalogSections=[...catalogContainer.querySelectorAll('.mb-6')].filter(section=>section.querySelector('.catalog-item'));
        const catalogGroups=[
            ['Fontes de áudio',type=>TURNTABLE_TYPES.has(type)||['tapeDeck','streamer','cdPlayer',...CAPTURE_INTERFACE_TYPES].includes(type)],
            ['Bluetooth',type=>BT_RX_TYPES.has(type)||BT_TX_TYPES.has(type)],
            ['Pré-amplificadores',type=>type==='preamp'||!!CUSTOM_PREAMPS[type]],
            ['Amplificadores integrados',type=>!!INTEGRATED_AMPS[type]||type==='streamIntegrated'],
            ['Receivers',type=>['receiver','powerAmp'].includes(type)],
            ['Amplificadores de potência',type=>['powerStereo','powerVintage'].includes(type)||!!CUSTOM_POWER_AMPS[type]],
            ['Amplificadores de fones',type=>type.startsWith('headphoneAmp')],
            ['Equalizadores',type=>EQ_TYPES.has(type)],
            ['Crossovers',type=>CROSSOVER_TYPES.has(type)],
            ['Mixers',type=>type==='mixer'||type==='mixerVintage'],
            ['Seletores',type=>SELECTOR_TYPES.has(type)||MATRIX_TYPES.has(type)],
            ['Medição & Análise',type=>SIGNAL_GENERATOR_TYPES.has(type)||['benchMeter','benchMeterVintage'].includes(type)],
            ['Adaptadores & Conversores',type=>!!INTERFACE_DEVICES[type]],
            ['Caixas Ativas',type=>ACTIVE_SPK.has(type)],
            ['Caixas Passivas · Bookshelf',type=>!!BOOKSHELF_SPEAKERS[type]||['spkPassiveCarbon','spkPassiveWood'].includes(type)],
            ['Caixas Passivas · Três vias',type=>['spkPassiveGridBlack','spkPassiveGridOrange'].includes(type)],
            ['Caixas Passivas · Piso',type=>!!FLOOR_SPEAKERS[type]],
            ['Caixas Passivas',type=>PASSIVE_SPK.has(type)],
            ['Subwoofers',type=>SUB_TYPES.has(type)||PASSIVE_SUB_TYPES.has(type)],
            ['Fones de ouvido',type=>HP_TYPES.has(type)],
            ['Móveis',type=>!!FURNITURE_TYPES[type]],
            ['Iluminação',type=>type==='pendantLamp'||!!WALL_LAMP_TYPES[type]],
            ['DEBUG',type=>type==='hardwareDemo']
        ];
        const catalogAssigned=new Set();
        const catalogItemName=item=>item.querySelector(':scope > span')?.textContent.trim()||DEVICE_NAMES[item.dataset.template]||item.dataset.template;
        const appendCatalogGroup=(title,items)=>{
            if(!items.length)return;
            const section=document.createElement('section');section.className='mb-6 catalog-category';
            const heading=document.createElement('h3');heading.className='text-[10px] font-bold text-gray-400 mb-3 tracking-wider uppercase';heading.textContent=title;
            const grid=document.createElement('div');grid.className='grid grid-cols-2 gap-3';
            items.sort((a,b)=>catalogItemName(a).localeCompare(catalogItemName(b),'pt-BR',{sensitivity:'base',numeric:true}))
                .forEach(item=>{catalogAssigned.add(item);item.dataset.catalogCategory=title;grid.appendChild(item);});
            section.append(heading,grid);catalogContainer.appendChild(section);
        };
        catalogGroups.forEach(([title,matches])=>appendCatalogGroup(title,catalogItems.filter(item=>!catalogAssigned.has(item)&&matches(item.dataset.template))));
        const catalogUnassigned=catalogItems.filter(item=>!catalogAssigned.has(item));
        if(catalogUnassigned.length)throw new Error(`Equipment contract missing catalog category: ${catalogUnassigned.map(item=>item.dataset.template).join(', ')}`);
        previousCatalogSections.forEach(section=>section.remove());
        const debugCatalogSection=[...catalogContainer.querySelectorAll('.catalog-category')].find(section=>section.querySelector('[data-template="hardwareDemo"]'));
        debugCatalogSection.hidden=!appState.preferences.developerModeEnabled;
        document.querySelectorAll('.catalog-item[data-template]').forEach(item => {
            const oldIcon = item.firstElementChild;
            if (oldIcon) oldIcon.outerHTML = catalogIcon(item.dataset.template);
        });
        const catalogAmpTip=document.createElement('aside');catalogAmpTip.id='catalog-amp-tooltip';catalogAmpTip.setAttribute('role','tooltip');document.body.appendChild(catalogAmpTip);
        const isCatalogListeningType=type=>PASSIVE_SPK.has(type)||ACTIVE_SPK.has(type)||HP_TYPES.has(type)||SUB_TYPES.has(type)||PASSIVE_SUB_TYPES.has(type);
        let catalogAmpTimer=0,catalogAmpTarget=null;
        const hideCatalogAmpTip=()=>{clearTimeout(catalogAmpTimer);catalogAmpTarget=null;catalogAmpTip.classList.remove('is-visible');};
        const showCatalogAmpTip=(item,delay)=>{
            if(!item)return;
            if(item===catalogAmpTarget)return;
            hideCatalogAmpTip();catalogAmpTarget=item;
            catalogAmpTimer=setTimeout(()=>{
                if(!item.isConnected||item.getClientRects().length===0)return;
                const type=item.dataset.template;
                const title=DEVICE_NAMES[type]||item.textContent.trim();
                const signatureOnly=isCatalogListeningType(type);
                const amplifier=!!AMPLIFICATION_VOICINGS[type];
                if(signatureOnly||amplifier){
                    catalogAmpTip.classList.add('catalog-signature-only');
                    catalogAmpTip.innerHTML=signatureOnly
                        ?`<div class="catalog-listening-preview" aria-label="Assinatura sonora de ${title}">${listeningProfilePreviewHtml(type)}${catalogRatingVisualHtml(type)}</div>`
                        :`<div class="catalog-listening-preview" aria-label="Características do amplificador ${title}">${amplificationInspectorHtml({amplificationProfile:AMPLIFICATION_VOICINGS[type]})}${catalogRatingVisualHtml(type)}</div>`;
                }else{
                    catalogAmpTip.classList.remove('catalog-signature-only');
                    catalogAmpTip.innerHTML='';
                }
                const rect=item.getBoundingClientRect(),w=catalogAmpTip.offsetWidth,h=catalogAmpTip.offsetHeight;
                catalogAmpTip.style.left=Math.min(innerWidth-w-10,rect.right+14)+'px';
                catalogAmpTip.style.top=Math.max(8,Math.min(innerHeight-h-8,rect.top+(rect.height-h)/2))+'px';
                catalogAmpTip.classList.remove('is-visible');void catalogAmpTip.offsetWidth;catalogAmpTip.classList.add('is-visible');
            },delay);
        };
        catalogItems.filter(item=>AMPLIFICATION_VOICINGS[item.dataset.template]||isCatalogListeningType(item.dataset.template)).forEach(item=>{
            item.addEventListener('pointerenter',event=>{if(event.pointerType!=='touch')showCatalogAmpTip(item,500);});
            item.addEventListener('pointerleave',hideCatalogAmpTip);
            item.addEventListener('focusin',()=>showCatalogAmpTip(item,0));
            item.addEventListener('focusout',hideCatalogAmpTip);
        });
        equipmentCatalog.addEventListener('scroll',()=>{if(catalogAmpTip.classList.contains('is-visible'))hideCatalogAmpTip();},true);
        equipmentCatalog.addEventListener('pointerdown',hideCatalogAmpTip);
        const contextHelp=document.createElement('aside');contextHelp.id='context-help';contextHelp.className='context-help';contextHelp.setAttribute('role','status');contextHelp.setAttribute('aria-live','polite');contextHelp.innerHTML='<strong></strong><span></span>';document.body.appendChild(contextHelp);
        let contextHelpTarget=null,contextHelpTimer=0,contextHelpPreviousDescription=null;
        function hideContextHelp(){clearTimeout(contextHelpTimer);contextHelp.classList.remove('is-visible');if(contextHelpTarget){if(contextHelpPreviousDescription)contextHelpTarget.setAttribute('aria-describedby',contextHelpPreviousDescription);else contextHelpTarget.removeAttribute('aria-describedby');}contextHelpTarget=null;contextHelpPreviousDescription=null;}
        function positionContextHelp(target){
            const rect=target.getBoundingClientRect(),tip=contextHelp.getBoundingClientRect(),gap=10,w=tip.width,h=tip.height,vw=innerWidth,vh=innerHeight;
            const candidates=[{x:rect.right+gap,y:rect.top+(rect.height-h)/2},{x:rect.left-w-gap,y:rect.top+(rect.height-h)/2},{x:rect.left+(rect.width-w)/2,y:rect.bottom+gap},{x:rect.left+(rect.width-w)/2,y:rect.top-h-gap}];
            const overlaps=(x,y)=>x<rect.right&&x+w>rect.left&&y<rect.bottom&&y+h>rect.top;
            const valid=candidates.find(({x,y})=>x>=8&&x+w<=vw-8&&y>=8&&y+h<=vh-8&&!overlaps(x,y));
            if(!valid)return false;
            contextHelp.style.left=`${valid.x}px`;contextHelp.style.top=`${valid.y}px`;return true;
        }
        function showContextHelp(target,delay=1000){
            if(!appState.preferences.connectionGuidanceEnabled||!target)return;
            const port=target.closest('.port'),control=port?null:target.closest('button,input,select,[role="switch"],[role="slider"]');
            let heading='',message='';
            if(port){heading=port.dataset.baseTitle||port.getAttribute('aria-label')||'Conector';message=port.getAttribute('title')||`${port.dataset.io==='out'?'Saída':'Entrada'} ${port.dataset.format||port.dataset.type||'de áudio'} · sinal ${signalName(getPortSignal(port))}.`;}
            else if(control){heading=control.getAttribute('aria-label')||control.labels?.[0]?.textContent?.trim()||control.title||control.textContent.trim()||'Controle';message=control.title||control.getAttribute('aria-description')||control.labels?.[0]?.textContent?.trim()||'Ajuste este controle para configurar o equipamento.';}
            else return;
            target=port||control;
            if(!message||contextHelpTarget===target)return;
            hideContextHelp();contextHelpTarget=target;contextHelpPreviousDescription=target.getAttribute('aria-describedby');target.setAttribute('aria-describedby',[contextHelpPreviousDescription,'context-help'].filter(Boolean).join(' '));
            contextHelp.querySelector('strong').textContent=heading;contextHelp.querySelector('span').textContent=message;
            contextHelpTimer=setTimeout(()=>{if(!appState.preferences.connectionGuidanceEnabled||!target.isConnected)return;if(positionContextHelp(target))contextHelp.classList.add('is-visible');},delay);
        }
        document.addEventListener('pointerover',event=>{if(event.pointerType==='touch'||!appState.preferences.connectionGuidanceEnabled)return;const target=event.target instanceof Element?event.target:null;if(target?.closest('.device-node'))showContextHelp(target);});
        document.addEventListener('pointerout',event=>{const target=event.target instanceof Element?event.target:null,device=target?.closest('.device-node');if(!device||event.relatedTarget instanceof Node&&device.contains(event.relatedTarget))return;if(!contextHelpTarget||!device.contains(contextHelpTarget))return;if(!contextHelpTarget.matches(':focus')&&!contextHelpTarget.contains(document.activeElement))hideContextHelp();});
        document.addEventListener('focusin',event=>{const target=event.target instanceof Element?event.target:null;if(target?.closest('.device-node'))showContextHelp(target,0);});
        document.addEventListener('focusout',event=>{if(contextHelpTarget===event.target||contextHelpTarget?.contains(event.target))setTimeout(()=>{if(!contextHelpTarget?.matches(':hover')&&!contextHelpTarget?.contains(document.activeElement))hideContextHelp();},0);});
        let contextTouchTarget=null,contextTouchStart=null;
        document.addEventListener('pointerdown',event=>{
            if(event.pointerType!=='touch'||!appState.preferences.connectionGuidanceEnabled)return;
            const candidate=event.target instanceof Element?event.target.closest('.device-node .port,.device-node button,.device-node input,.device-node select,.device-node [role="switch"],.device-node [role="slider"]'):null;
            if(!candidate)return;
            clearTimeout(contextHelpTimer);contextTouchTarget=candidate;contextTouchStart={x:event.clientX,y:event.clientY};
            contextHelpTimer=setTimeout(()=>{if(contextTouchTarget===candidate)showContextHelp(candidate,0);},620);
        },true);
        document.addEventListener('pointermove',event=>{if(event.pointerType!=='touch'||!contextTouchTarget||!contextTouchStart)return;if(Math.hypot(event.clientX-contextTouchStart.x,event.clientY-contextTouchStart.y)>9){clearTimeout(contextHelpTimer);contextTouchTarget=null;contextTouchStart=null;}},true);
        document.addEventListener('pointerup',event=>{if(event.pointerType!=='touch')return;clearTimeout(contextHelpTimer);contextTouchTarget=null;contextTouchStart=null;},true);
        document.addEventListener('pointercancel',()=>{clearTimeout(contextHelpTimer);contextTouchTarget=null;contextTouchStart=null;},true);
        document.addEventListener('pointerdown',event=>{if(event.pointerType==='touch'&&contextHelpTarget&&!contextHelpTarget.contains(event.target))hideContextHelp();},false);
        const equipmentSearch = document.getElementById('equipment-search');
        const catalogSearchShell=equipmentSearch.closest('.catalog-search');
        const catalogSearchToggle=document.getElementById('catalog-search-toggle');
        function setCatalogSearchExpanded(expanded,focus=false){
            catalogSearchShell.dataset.expanded=String(expanded);
            catalogSearchToggle.setAttribute('aria-expanded',String(expanded));
            catalogSearchToggle.setAttribute('aria-label',AudioSystemLanguage.translate(expanded?'Fechar busca do catálogo':'Abrir busca do catálogo'));
            if(focus&&expanded)requestAnimationFrame(()=>{
                if(catalogSearchShell.dataset.expanded==='true')equipmentSearch.focus();
            });
        }
        catalogSearchToggle.addEventListener('click',()=>{
            const expanded=catalogSearchShell.dataset.expanded!=='true';
            setCatalogSearchExpanded(expanded,expanded);
            if(!expanded)equipmentSearch.blur();
        });
        equipmentSearch.addEventListener('focus',()=>setCatalogSearchExpanded(true));
        catalogSearchShell.addEventListener('focusout',event=>{
            if(!catalogSearchShell.contains(event.relatedTarget))setCatalogSearchExpanded(false);
        });
        document.addEventListener('pointerdown',event=>{
            if(!catalogSearchShell.contains(event.target))setCatalogSearchExpanded(false);
        });
        const catalogSections = [...equipmentCatalog.querySelectorAll('.mb-6')].filter(section => section.querySelector('.catalog-item'));
        const catalogSearchSynonyms={optica:['optical','toslink','digital'],optical:['optica','toslink','digital'],digital:['optica','optical','toslink'],entrada:['input'],input:['entrada'],saida:['output'],output:['saida'],linha:['line'],line:['linha'],phono:['vinil','toca discos','riaa'],rca:['analogo','audio'],p2:['minijack','fone','headphone'],p10:['jack','fone','headphone','6 35 mm'],wire:['fio','borne','caixa passiva'],fio:['wire','borne','caixa passiva'],passiva:['passive','amplificado','speaker'],passivo:['passive','amplificado','speaker'],caixa:['speaker','alto falante'],fone:['headphone','p2','p10'],bluetooth:['sem fio','wireless'],potencia:['amplificado','speaker']};
        function catalogPortTerms(item){
            const type=item.dataset.template,template=document.getElementById(`tpl-${type}`),ports=template?[...template.content.querySelectorAll('.port')]:[];
            return ports.map(port=>{
                const kind=port.dataset.type||'',signal=port.dataset.signal||'',direction=port.dataset.io||'',format=port.dataset.format||'',node=port.dataset.node||'',title=port.getAttribute('title')||'';
                return `${kind} ${signal} ${direction} ${format} ${node} ${title} ${kind==='wire'?'fio borne speaker passiva amplificada':kind.startsWith('rca')?'rca analógico linha phono subwoofer':kind==='p2'?'p2 fone headphones estéreo':kind==='p10'?'p10 jack headphones microfone':''} ${signal==='line'?'linha audio analógico':signal==='phono'?'phono toca discos riaa':signal==='amplified'?'amplificado potência caixa passiva':signal==='headphone'?'fone headphone amplificado':''}`;
            }).join(' ');
        }
        const catalogSearchText=item=>normalizeSearch(`${item.textContent} ${DEVICE_NAMES[item.dataset.template]||''} ${catalogDescriptions[item.dataset.template]||''} ${item.dataset.catalogCategory||''} ${catalogPortTerms(item)}`);
        const searchEmpty = document.createElement('p');
        searchEmpty.className = 'p-4 text-sm text-gray-400 text-center';
        searchEmpty.setAttribute('role', 'status');
        searchEmpty.textContent = 'Nenhum equipamento encontrado.';
        searchEmpty.hidden = true;
        catalogSections[0]?.parentElement.appendChild(searchEmpty);
        const normalizeSearch = text => text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
        equipmentSearch.addEventListener('input', () => {
            const terms = normalizeSearch(equipmentSearch.value).split(/\s+/).filter(Boolean);
            let total = 0;
            catalogSections.forEach(section => {
                if(section===debugCatalogSection&&!appState.preferences.developerModeEnabled){section.hidden=true;return;}
                let visible = 0;
                section.querySelectorAll('.catalog-item').forEach(item => {
                    const text = catalogSearchText(item);
                    item.hidden = !terms.every(term => [term,...(catalogSearchSynonyms[term]||[])].some(candidate=>text.includes(normalizeSearch(candidate))));
                    if (!item.hidden) visible++;
                });
                section.hidden = visible === 0;
                total += visible;
            });
            searchEmpty.hidden = total > 0;
        });
        equipmentSearch.addEventListener('keydown', event => {
            if (event.key === 'Escape') { equipmentSearch.value = ''; equipmentSearch.dispatchEvent(new Event('input')); setCatalogSearchExpanded(false); catalogSearchToggle.focus(); }
        });
        function updateCatalogPlacementPreview(preview,target){
            const el=preview.el,w=el.offsetWidth,h=el.offsetHeight,bottom=target.y+h,wall=!!WALL_LAMP_TYPES[preview.type],pendant=preview.type==='pendantLamp',valid=wall||pendant?target.x>=sceneSideInset()&&target.x+w<=world.offsetWidth-sceneSideInset()&&target.y>=0&&bottom<=(wall?wallPlacementBottom():maxEquipmentBottom()):canPlaceEquipment(preview,target.x,target.y);
            const supported=Math.abs(bottom-maxEquipmentBottom())<=2||Object.values(appState.project.devices).some(other=>placementShapes(other,parseFloat(other.el.style.left)||0,parseFloat(other.el.style.top)||0).some(shape=>Math.abs(bottom-shape.y)<=2&&Math.min(target.x+w,shape.x+shape.width)-Math.max(target.x,shape.x)>0));
            el.style.left=target.x+'px';el.style.top=target.y+'px';el.classList.toggle('is-invalid',!valid);el.classList.toggle('is-supported',valid&&supported);
            const label=!valid?'Espaço indisponível':wall?'Fixado à parede':pendant?'Suspenso':supported?'Apoiado':'Espaço livre';el.dataset.previewLabel=`${AudioSystemLanguage.translate(label)} · ${w} × ${h}`;
        }
        let activeCatalogPreviewCleanup=null;
        function bindCatalogItem(item) {
            item.addEventListener('dragstart', e => e.preventDefault());
            item.addEventListener('pointerdown', e => {
                if (e.button !== 0) return;
                activeCatalogPreviewCleanup?.();
                if(e.pointerType==='touch'&&!item.firstElementChild.contains(e.target)){
                    const start={x:e.clientX,y:e.clientY,id:e.pointerId};
                    const cleanup=()=>{item.removeEventListener('pointerup',tap);item.removeEventListener('pointercancel',cleanup);};
                    const tap=event=>{
                        cleanup();if(event.pointerId!==start.id||Math.hypot(event.clientX-start.x,event.clientY-start.y)>8)return;
                        const rect=canvas.getBoundingClientRect(),point=screenToWorld(rect.left+rect.width/2,rect.top+rect.height/2),type=item.dataset.template;
                        const preview=createDevice(type,0,0,null,true);if(!preview)return;
                        preview.el.hidden=false;
                        const x=Math.max(sceneSideInset(),Math.min(world.offsetWidth-preview.el.offsetWidth-sceneSideInset(),snapCoordinate(point.x-preview.el.offsetWidth/2)));
                        const y=Math.max(0,Math.min(maxEquipmentBottom()-preview.el.offsetHeight,snapCoordinate(point.y-preview.el.offsetHeight/2+preview.el.offsetHeight)-preview.el.offsetHeight));
                        const target=snapOnEquipment(preview,x,y);updateCatalogPlacementPreview(preview,target);
                        closeMobilePanels();
                        const actions=document.createElement('div');actions.className='catalog-preview-actions';actions.innerHTML='<button type="button" data-preview-cancel>Cancelar</button><button type="button" data-preview-confirm>Adicionar</button>';document.body.appendChild(actions);
                        const cleanupPreview=()=>{preview.el.remove();actions.remove();document.removeEventListener('keydown',escapePreview);if(activeCatalogPreviewCleanup===cleanupPreview)activeCatalogPreviewCleanup=null;};activeCatalogPreviewCleanup=cleanupPreview;
                        const escapePreview=event=>{if(event.key==='Escape'){event.preventDefault();cleanupPreview();}};document.addEventListener('keydown',escapePreview);
                        actions.querySelector('[data-preview-cancel]').onclick=cleanupPreview;
                        actions.querySelector('[data-preview-confirm]').onclick=()=>{cleanupPreview();createDevice(type,target.x,target.y);playUiSound('drop');
                            const added=appState.project.devices[appState.interface.selectedDeviceId];
                            if(compactLayout.matches&&added){
                                const width=added.el.offsetWidth,height=added.el.offsetHeight,tools=document.querySelector('.canvas-tools'),usableHeight=Math.max(120,rect.height-tools.offsetHeight-40);
                                const zoom=clampZoom(Math.min(view.zoom,(rect.width-32)/width,(usableHeight-32)/height));
                                animateViewTo({zoom,x:(rect.width-width*zoom)/2-(parseFloat(added.el.style.left)||0)*zoom,y:(usableHeight-height*zoom)/2-(parseFloat(added.el.style.top)||0)*zoom});
                            }
                        };actions.querySelector('[data-preview-confirm]').focus({preventScroll:true});
                    };
                    item.addEventListener('pointerup',tap);item.addEventListener('pointercancel',cleanup);return;
                }
                e.preventDefault();
                window.getSelection()?.removeAllRanges();
                const type = item.dataset.template;
                const placementPreview=createDevice(type,0,0,null,true);
                const rect = item.getBoundingClientRect();
                const cRect = canvas.getBoundingClientRect();
                
                const ghost = item.cloneNode(true);
                ghost.style.position = 'fixed';
                ghost.style.width = `${rect.width}px`;
                ghost.style.height = `${rect.height}px`;
                ghost.style.left = `${rect.left}px`;
                ghost.style.top = `${rect.top}px`;
                ghost.style.opacity = '0.8';
                ghost.style.pointerEvents = 'none';
                ghost.style.zIndex = '9999';
                document.body.appendChild(ghost);
                
                const offsetX = e.clientX - rect.left;
                const offsetY = e.clientY - rect.top;
                
                const move = ev => {
                    ev.preventDefault();
                    if(e.pointerType==='touch'&&Math.hypot(ev.clientX-e.clientX,ev.clientY-e.clientY)>8)closeMobilePanels();
                    ghost.style.left = `${ev.clientX - offsetX}px`;
                    ghost.style.top = `${ev.clientY - offsetY}px`;
                    if(placementPreview){
                        const inside=ev.clientX>cRect.left&&ev.clientX<cRect.right&&ev.clientY>cRect.top&&ev.clientY<cRect.bottom;
                        placementPreview.el.hidden=!inside;
                        if(inside){const pos=screenToWorld(ev.clientX-offsetX+rect.width/2,ev.clientY-offsetY+rect.height/2),x=Math.max(0,snapCoordinate(pos.x-rect.width/2)),y=Math.max(0,snapCoordinate(pos.y-rect.height/2+placementPreview.el.offsetHeight)-placementPreview.el.offsetHeight),target=snapOnEquipment(placementPreview,x,y);updateCatalogPlacementPreview(placementPreview,target);}
                    }
                };
                
                const up = ev => {
                    window.removeEventListener('pointermove', move);
                    window.removeEventListener('pointerup', up);
                    window.removeEventListener('pointercancel', up);
                    ghost.remove();placementPreview?.el.remove();
                    
                    if (ev.type!=='pointercancel' && !ev.cancelled && ev.clientX > cRect.left && ev.clientX < cRect.right && ev.clientY > cRect.top && ev.clientY < cRect.bottom) {
                        const pos = screenToWorld(ev.clientX - offsetX + rect.width / 2, ev.clientY - offsetY + rect.height / 2);
                        createDevice(type, pos.x - rect.width / 2, pos.y - rect.height / 2);

                        playUiSound('drop');
                    }
                };
                
                window.addEventListener('pointermove', move);
                window.addEventListener('pointerup', up);
                window.addEventListener('pointercancel', up);
            });
        }
        document.querySelectorAll('.catalog-item').forEach(bindCatalogItem);
        const quickCatalog=document.createElement('section');quickCatalog.className='catalog-quick-access';
        catalogContainer.prepend(quickCatalog);
        const quickKey='audio-system-catalog-quick-v1';
        let quickData;try{quickData=JSON.parse(localStorage.getItem(quickKey))||{};}catch{quickData={};}
        const validTypes=new Set(catalogItems.map(item=>item.dataset.template));
        const clean=list=>Array.isArray(list)?[...new Set(list.filter(type=>validTypes.has(type)))].slice(0,12):[];
        quickData={favorites:clean(quickData.favorites)};
        function saveQuick(){try{localStorage.setItem(quickKey,JSON.stringify(quickData));}catch{}}
        function updateStars(){catalogItems.forEach(item=>{
            const button=item.querySelector('.catalog-favorite');
            if(!button)return;
            const favorite=quickData.favorites.includes(item.dataset.template);
            button.setAttribute('aria-pressed',String(favorite));
            button.textContent=favorite?'★':'☆';
        });}
        function renderQuick(){
            quickCatalog.replaceChildren();
            for(const [title,types] of [['Favoritos',quickData.favorites]]){
                if(!types.length)continue;const section=document.createElement('div');section.className='mb-6';const heading=document.createElement('h3');heading.className='text-[10px] font-bold text-gray-500 mb-3 tracking-wider uppercase';heading.textContent=title;const grid=document.createElement('div');grid.className='grid grid-cols-2 gap-3';section.append(heading,grid);
                types.forEach(type=>{const original=catalogItems.find(item=>item.dataset.template===type);if(!original)return;const copy=original.cloneNode(true);copy.querySelector('.catalog-favorite')?.remove();bindCatalogItem(copy);grid.appendChild(copy);});quickCatalog.appendChild(section);
            }
            updateStars();AudioSystemLanguage.translateTree?.(quickCatalog);
        }
        catalogItems.forEach(item=>{const button=document.createElement('button');button.type='button';button.className='catalog-favorite';button.title='Favoritar equipamento';button.setAttribute('aria-label','Favoritar equipamento');button.textContent='☆';button.addEventListener('pointerdown',event=>event.stopPropagation());button.addEventListener('click',event=>{event.stopPropagation();const type=item.dataset.template;quickData.favorites=quickData.favorites.includes(type)?quickData.favorites.filter(t=>t!==type):[type,...quickData.favorites].slice(0,12);saveQuick();renderQuick();});item.appendChild(button);});
        equipmentSearch.addEventListener('input',()=>{quickCatalog.hidden=!!equipmentSearch.value.trim();});
        renderQuick();

        function standardizeStereoPorts(root) {
            const channelOf = port => port?.dataset.channel || (/L$/.test(port?.dataset.node || '') ? 'L' : /R$/.test(port?.dataset.node || '') ? 'R' : '');
            [...root.querySelectorAll('*')].forEach(parent => {
                const units = [...parent.children].map(element => {
                    const ports = element.matches('.port') ? [element] : [...element.querySelectorAll('.port')];
                    return ports.length === 1 ? {element,port:ports[0],channel:channelOf(ports[0])} : null;
                }).filter(unit => unit?.channel);
                if (units.length !== 2 || new Set(units.map(unit=>unit.channel)).size !== 2 || units[0].port.dataset.io !== units[1].port.dataset.io) return;
                const groups = units.map(unit => {
                    const label = unit.element.previousElementSibling;
                    const hasLabel = label && !label.querySelector('.port') && !label.matches('.port') && label.textContent.trim() === unit.channel;
                    return {...unit,elements:hasLabel ? [label,unit.element] : [unit.element]};
                });
                const marker = document.createComment('stereo L/R');
                parent.insertBefore(marker,groups[0].elements[0]);
                groups.sort((a,b)=>a.channel==='L'?-1:1).forEach(group=>group.elements.forEach(element=>parent.insertBefore(element,marker)));
                marker.remove();
            });
            const textNodes = document.createTreeWalker(root,NodeFilter.SHOW_TEXT);
            while (textNodes.nextNode()) textNodes.currentNode.nodeValue = textNodes.currentNode.nodeValue.replace(/R\/L/g,'L/R');
        }

