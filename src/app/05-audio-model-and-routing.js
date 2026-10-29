/* Listening signatures, electrical models, amplifier loads, and cable properties. */
        const LISTENING_PROFILES = {
            // Approximation of a classic dipole panel, not an anechoic measurement.
            // -6 dB shared headroom plus a relative -6 dB sensitivity trim (84 vs 90 dB).
            spkElectrostatic:{label:'Eletrostática · médios naturais e graves contidos',highpass:55,headroomDb:-12,curveMinDb:-36,filterSpecs:[{type:'highpass',frequency:55,Q:Math.SQRT1_2},{type:'highpass',frequency:55,Q:Math.SQRT1_2},{type:'peaking',frequency:1200,Q:.65,gain:.6},{type:'highshelf',frequency:7500,gain:-1.5},{type:'lowpass',frequency:18000,Q:Math.SQRT1_2}]},
            hpKubaDisco2:{label:'Disco 2 · escuta sem coloração adicional',bands:[0,0,0]},
            headphone:{label:'Moderno · graves presentes',bands:[3,-.5,.5]},
            hpStudio:{label:'Studio · graves definidos',bands:[2,0,1]},
            // Perceptual tonal approximations, not raw ear-simulator transfer curves or corrective EQ presets.
            hpOpenRing:{label:'Aberto anelar · graves contidos e brilho',headroomDb:-8,curveMinDb:-12,filterSpecs:[{type:'highpass',frequency:12,Q:.70710678},{type:'lowshelf',frequency:65,gain:-3.5},{type:'peaking',frequency:2500,Q:.8,gain:-1.5},{type:'peaking',frequency:6000,Q:2,gain:4},{type:'highshelf',frequency:9000,gain:1.2}]},
            hpOpenDome:{label:'Aberto cúpula · médios presentes',headroomDb:-8,curveMinDb:-12,filterSpecs:[{type:'highpass',frequency:10,Q:.70710678},{type:'lowshelf',frequency:100,gain:-2},{type:'peaking',frequency:1500,Q:1.2,gain:3.5},{type:'peaking',frequency:4000,Q:2,gain:1.2},{type:'peaking',frequency:6000,Q:2.5,gain:2}]},
            hpPlanar:{label:'Planar · extensão e presença suave',headroomDb:-8,curveMinDb:-12,filterSpecs:[{type:'highpass',frequency:5,Q:.70710678},{type:'peaking',frequency:4000,Q:1,gain:-3},{type:'peaking',frequency:7500,Q:1.5,gain:-1},{type:'highshelf',frequency:12000,gain:.5}]},
            hpMonitor:{label:'Monitor · corpo e presença',bands:[2.5,1.2,-.5]},
            hpMax:{label:'Max · graves e suavidade',bands:[3,.2,-.7]},
            hpClassic:{label:'Vintage · vozes e guitarras',bands:[.5,2.5,-1.5]},
            subwoofer:{label:'Subwoofer · corte em 120 Hz',curveMinDb:-36,filterSpecs:[{type:'lowpass',frequency:120,Q:Math.SQRT1_2}]},
            subwooferCube:{label:'Subwoofer compacto · corte em 120 Hz',curveMinDb:-36,filterSpecs:[{type:'lowpass',frequency:120,Q:Math.SQRT1_2}]},
            subwooferPro:{label:'Subwoofer Pro · corte em 100 Hz',curveMinDb:-36,filterSpecs:[{type:'lowpass',frequency:100,Q:Math.SQRT1_2}]},
            subwooferPassive:{label:'Subwoofer passivo · corte em 120 Hz',curveMinDb:-36,filterSpecs:[{type:'lowpass',frequency:120,Q:Math.SQRT1_2}]},
            subwooferPassiveVintage:{label:'Subwoofer passivo vintage · corte em 120 Hz',curveMinDb:-36,filterSpecs:[{type:'lowpass',frequency:120,Q:Math.SQRT1_2}]},
            // Broad tonal approximations, not digitized measurements or complete acoustic models.
            shelfCoax:{label:'Bookshelf · resposta uniforme',highpass:79,headroomDb:-12,bassAlignment:{minus3:79,minus6:47,subsonic:20},filterSpecs:[]},
            shelfWood:{label:'Bookshelf · agudos suaves',highpass:41,headroomDb:-12,bassAlignment:{frequency:41,order:4},filterSpecs:[{type:'peaking',frequency:1100,Q:2.5,gain:1},{type:'peaking',frequency:1450,Q:4,gain:-1.5},{type:'highshelf',frequency:11000,gain:-2}]},
            shelfTop:{label:'Bookshelf · agudos destacados',highpass:50,headroomDb:-12,curveMaxDb:12,bassAlignment:{frequency:50,order:4},filterSpecs:[{type:'peaking',frequency:10000,Q:1.1,gain:9.5}]},
            floorDiamond:{label:'Coluna · agudos presentes',highpass:24,headroomDb:-6,bassAlignment:{frequency:24,order:4},filterSpecs:[{type:'peaking',frequency:90,Q:.65,gain:.6},{type:'peaking',frequency:2000,Q:.75,gain:-1.5},{type:'highshelf',frequency:3000,gain:3.4},{type:'peaking',frequency:3800,Q:3,gain:1.5},{type:'peaking',frequency:6500,Q:2.5,gain:-2.2},{type:'peaking',frequency:11000,Q:1,gain:1}]},
            floorCoax:{label:'Coluna · resposta equilibrada',highpass:46,headroomDb:-6,bassAlignment:{minus3:46,minus6:30,subsonic:16},filterSpecs:[{type:'highshelf',frequency:7000,gain:-.6}]},
            floorFlax:{label:'Coluna · extensão de graves',highpass:39,headroomDb:-6,bassAlignment:{minus3:39,minus6:32,subsonic:12},filterSpecs:[]},
            speaker:{label:'Vintage · médios quentes',bands:[1,2,-1]},
            spkPassiveWood:{label:'Vintage · presença vocal',bands:[1,2.5,-1.5]},
            spkPassiveCarbon:{label:'Moderna · graves e detalhes',bands:[2.5,-.5,1]},
            spkPassiveGridBlack:{label:'Três vias · corpo e equilíbrio',highpass:40,headroomDb:-8,filterSpecs:[{type:'highpass',frequency:40,Q:.70710678},{type:'highpass',frequency:40,Q:.70710678},{type:'peaking',frequency:90,Q:.7,gain:.6}]},
            spkPassiveGridOrange:{label:'Três vias · corpo e equilíbrio',highpass:40,headroomDb:-8,filterSpecs:[{type:'highpass',frequency:40,Q:.70710678},{type:'highpass',frequency:40,Q:.70710678},{type:'peaking',frequency:90,Q:.7,gain:.6}]},
            spkActiveMonitor:{label:'Monitor vintage · médios presentes',bands:[.5,1.5,-.5]},
            spkActiveCompact:{label:'Compacta · graves contidos e clareza',bands:[1.5,.3,.7],highpass:67},
            spkActiveRounded:{label:'Monitor · precisão e equilíbrio',highpass:47,headroomDb:-8,filterSpecs:[{type:'highpass',frequency:47,Q:.70710678},{type:'highpass',frequency:47,Q:.70710678}]},
            spkActiveBookshelf:{label:'Ativa moderna · graves e clareza',bands:[2,0,1]}
        };

        function speakerFilterCoefficients(spec,sampleRate){
            const frequency=Math.max(1,Math.min(sampleRate*.49,spec.frequency));
            const w=2*Math.PI*frequency/sampleRate,c=Math.cos(w),sn=Math.sin(w),q=spec.Q??Math.SQRT1_2;
            let b,a;
            if(spec.type==='highpass'){
                const alpha=sn/(2*q);b=[(1+c)/2,-1-c,(1+c)/2];a=[1+alpha,-2*c,1-alpha];
            }else if(spec.type==='lowpass'){
                const alpha=sn/(2*q);b=[(1-c)/2,1-c,(1-c)/2];a=[1+alpha,-2*c,1-alpha];
            }else if(spec.type==='peaking'){
                const A=10**((spec.gain||0)/40),alpha=sn/(2*q);b=[1+alpha*A,-2*c,1-alpha*A];a=[1+alpha/A,-2*c,1-alpha/A];
            }else if(spec.type==='lowshelf'){
                const A=10**((spec.gain||0)/40),alpha=sn/Math.SQRT2,beta=2*Math.sqrt(A)*alpha;
                b=[A*((A+1)-(A-1)*c+beta),2*A*((A-1)-(A+1)*c),A*((A+1)-(A-1)*c-beta)];
                a=[(A+1)+(A-1)*c+beta,-2*((A-1)+(A+1)*c),(A+1)+(A-1)*c-beta];
            }else if(spec.type==='highshelf'){
                const A=10**((spec.gain||0)/40),alpha=sn/Math.SQRT2,beta=2*Math.sqrt(A)*alpha;
                b=[A*((A+1)+(A-1)*c+beta),-2*A*((A-1)+(A+1)*c),A*((A+1)+(A-1)*c-beta)];
                a=[(A+1)-(A-1)*c+beta,2*((A-1)-(A+1)*c),(A+1)-(A-1)*c-beta];
            }else throw new Error('Filtro de assinatura não suportado');
            return {feedforward:b.map(value=>value/a[0]),feedback:a.map(value=>value/a[0])};
        }
        function floorListeningFilters(profile,sampleRate){
            const alignment=profile.bassAlignment,filters=[];
            if(alignment.order===4){
                // Fourth-order Butterworth approximation to the specified bass extension.
                [.541196100146197,1.306562964876377].forEach(Q=>filters.push({type:'highpass',frequency:alignment.frequency,Q}));
            }else{
                // Interpret the lower ±3 dB bandwidth edge as an approximate -3 dB anchor.
                // Solve the second section after compensating the subsonic section; bilinear
                // prewarping keeps both anchors consistent at different audio sample rates.
                const gsub=Math.tan(Math.PI*alignment.subsonic/sampleRate);
                const anchors=[[alignment.minus3,3],[alignment.minus6,6]].map(([frequency,attenuation])=>{
                    const t=Math.tan(Math.PI*frequency/sampleRate),x=1/(t*t),subPower=1/(1+(gsub/t)**4);
                    return {x,u:10**(attenuation/10)*subPower-1};
                });
                const [p1,p2]=anchors,B=(p2.u/p2.x-p1.u/p1.x)/(p2.x-p1.x),g=B**.25,A=p1.u/p1.x-B*p1.x;
                const Q=1/Math.sqrt(2+A/(g*g)),frequency=Math.atan(g)*sampleRate/Math.PI;
                filters.push({type:'highpass',frequency:alignment.subsonic,Q:Math.SQRT1_2},{type:'highpass',frequency,Q});
            }
            return [...filters,...profile.filterSpecs];
        }
        function sonicSignatureBandsHtml(response,frequencies){
            return [['Graves',60,200],['Médios',300,2500],['Agudos',5000,12000]].map(([label,low,high])=>{
                const samples=Array.from(response,(db,index)=>({db,frequency:frequencies[index]})).filter(sample=>sample.frequency>=low&&sample.frequency<=high);
                const meanDb=samples.length?samples.reduce((sum,sample)=>sum+sample.db,0)/samples.length:0;
                const state=meanDb<=-4?'recuo-forte':meanDb< -1?'recuo-leve':meanDb<=1?'neutro':meanDb<4?'realce-leve':'realce-forte';
                const position={'recuo-forte':0,'recuo-leve':1,neutro:2,'realce-leve':3,'realce-forte':4}[state];
                const stateLabel={'recuo-forte':'Recuo forte','recuo-leve':'Recuo leve',neutro:'Neutro','realce-leve':'Realce leve','realce-forte':'Realce forte'}[state];
                const dots=Array.from({length:5},(_,index)=>`<i class="${index===2?'is-neutral ':''}${index===position?'is-active':''}"></i>`).join('');
                return `<div class="sonic-band" data-tone="${state}" role="img" aria-label="${label}: ${stateLabel.toLowerCase()}. Média da curva entre ${low} e ${high} Hz."><span class="sonic-band-name">${label}</span><span class="sonic-band-dots" title="Média entre ${low} e ${high} Hz · escala de recuo a realce, centro neutro" aria-hidden="true">${dots}</span><span class="sonic-band-state">${stateLabel}</span></div>`;
            }).join('');
        }
        function sonicCurveFigureHtml(profile,frequencies,response){
            const width=360,height=190,left=35,right=345,top=16,bottom=152;
            const minDb=profile.curveMinDb??(profile.highpass||profile.bassAlignment?-24:-6),maxDb=profile.curveMaxDb||6;
            const x=f=>left+Math.log10(f/20)/3*(right-left);
            const y=db=>top+(maxDb-db)/(maxDb-minDb)*(bottom-top);
            const path=Array.from(response,(db,i)=>`${i?'L':'M'}${x(frequencies[i]).toFixed(2)},${y(db).toFixed(2)}`).join(' ');
            const horizontal=(minDb<=-12?Array.from({length:(maxDb-minDb)/6+1},(_,i)=>minDb+i*6):[-6,-3,0,3,6]).map(db=>`<line x1="${left}" x2="${right}" y1="${y(db)}" y2="${y(db)}" stroke="${db===0?'#718096':'#303c49'}" ${db===0?'':'stroke-dasharray="3 4"'}/><text x="${left-7}" y="${y(db)+3}" text-anchor="end" fill="#aab6c5" font-size="10">${db>0?'+':''}${db}</text>`).join('');
            const vertical=[[20,'20'],[100,'100'],[1000,'1k'],[10000,'10k'],[20000,'20k']].map(([hz,label])=>`<line x1="${x(hz)}" x2="${x(hz)}" y1="${top}" y2="${bottom}" stroke="#303c49"/><text x="${x(hz)}" y="${bottom+18}" text-anchor="middle" fill="#aab6c5" font-size="10">${label}</text>`).join('');
            return `<figure class="sonic-curve-figure"><svg viewBox="0 0 ${width} ${height}" class="sonic-curve-graph" role="img" aria-label="Curva da assinatura sonora: ${profile.label}. Frequência de 20 Hz a 20 kHz; ganho relativo entre ${minDb} e mais ${maxDb} decibéis." style="font-family:Inter,sans-serif"><text x="${left}" y="10" fill="#aab6c5" font-size="9">dB</text>${horizontal}${vertical}<path d="${path}" fill="none" stroke="#60a5fa" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"/><text x="${right}" y="${height-2}" text-anchor="end" fill="#aab6c5" font-size="9">Hz</text></svg></figure>`;
        }
        function listeningCurveHtml(dev) {
            const frequencies=Float32Array.from({length:181},(_,i)=>20*1000**(i/180)),response=new Float64Array(frequencies.length);
            const magnitude=new Float32Array(frequencies.length),phase=new Float32Array(frequencies.length);
            dev.voicingNodes.filter(node=>typeof node.getFrequencyResponse==='function').forEach(filter=>{
                filter.getFrequencyResponse(frequencies,magnitude,phase);
                magnitude.forEach((gain,i)=>{response[i]+=20*Math.log10(Math.max(1e-8,gain));});
            });
            const bands=sonicSignatureBandsHtml(response,frequencies);
            // The response contains the filter curve; global trim is excluded from indicators.
            return `<div class="sonic-signature-visuals">${bands}</div>${sonicCurveFigureHtml(dev.listeningProfile,frequencies,response)}`;
        }
        function listeningProfilePreviewHtml(type){
            const profile=LISTENING_PROFILES[type]||{label:'Resposta neutra',bands:[0,0,0]};
            const sampleRate=appState.audio.context?.sampleRate||48000,frequencies=Float32Array.from({length:181},(_,i)=>20*1000**(i/180)),response=new Float64Array(frequencies.length);
            let specs=profile.bassAlignment?floorListeningFilters(profile,sampleRate):profile.filterSpecs;
            if(!profile.bassAlignment&&!profile.filterSpecs){
                specs=[...(profile.highpass?[{type:'highpass',frequency:profile.highpass,Q:Math.SQRT1_2}]:[]),{type:'lowshelf',frequency:120,Q:.7,gain:profile.bands?.[0]||0},{type:'peaking',frequency:1600,Q:.7,gain:profile.bands?.[1]||0},{type:'highshelf',frequency:5500,Q:.7,gain:profile.bands?.[2]||0}];
            }
            for(const spec of specs||[]){
                const {feedforward:b,feedback:a}=speakerFilterCoefficients(spec,sampleRate);
                frequencies.forEach((frequency,index)=>{
                    const angle=2*Math.PI*frequency/sampleRate,c=Math.cos(angle),s=Math.sin(angle),c2=Math.cos(2*angle),s2=Math.sin(2*angle);
                    const numerator=Math.hypot(b[0]+b[1]*c+b[2]*c2,b[1]*s+b[2]*s2),denominator=Math.hypot(1+a[1]*c+a[2]*c2,a[1]*s+a[2]*s2);
                    response[index]+=20*Math.log10(Math.max(1e-8,numerator/denominator));
                });
            }
            return `<div class="sonic-signature-visuals">${sonicSignatureBandsHtml(response,frequencies)}</div>${sonicCurveFigureHtml(profile,frequencies,response)}`;
        }
        function catalogRatingVisualHtml(type){
            const headphone=HEADPHONE_SPECS[type],speaker=FLOOR_SPEAKERS[type]||BOOKSHELF_SPEAKERS[type]||FIXED_PASSIVE_SPECS[type],active=ACTIVE_SPEAKER_RATINGS[type]||ACTIVE_SUB_RATINGS[type];
            const amplifier=FIXED_AMP_SPECS[type],headphoneOutput=HEADPHONE_OUTPUT_SPECS[type];
            const headphoneLoad=32,headphoneLoadVrms=headphoneOutput?Math.min(headphoneOutput.voltsRms*headphoneLoad/(headphoneLoad+headphoneOutput.outputOhms),headphoneOutput.currentRms*headphoneLoad):0;
            const headphonePowerMw=headphoneOutput?Math.round(headphoneLoadVrms**2/headphoneLoad*1000):undefined;
            const power=amplifier?(amplifier.powerByOhms[8]??amplifier.watts):headphonePowerMw??headphone?.powerMw??speaker?.watts??active?.watts??0;
            const powerUnit=amplifier?'W':headphoneOutput||headphone?'mW':'W';
            const ohms=amplifier?8:headphoneOutput?.outputOhms??headphone?.ohms??speaker?.ohms??active?.inputOhms??0;
            if(!power||!ohms)return '';
            const powerMax=powerUnit==='mW'?1000:500,impedanceMax=10000;
            const fill=(value,min,max)=>Math.max(8,Math.min(100,Math.round((Math.log(Math.max(min,value)/min)/Math.log(max/min))*100)));
            const ohmsValue=ohms>=1000?`${(ohms/1000).toFixed(0)}k`:`${ohms}`;
            const approximate=!amplifier;
            const recommendedSpeakerPower=isRecommendedSpeakerPower(type);
            const passiveSub=PASSIVE_SUB_TYPES.has(type);
            const powerDescription=amplifier?'Potência nominal de saída':headphoneOutput?'Potência estimada entregue em 32 Ω':headphone?'Potência máxima de entrada do fone':passiveSub?'Potência nominal total do subwoofer':speaker?(recommendedSpeakerPower?'Amplificação recomendada':'Potência de entrada suportada'):'Potência nominal do amplificador interno';
            const impedanceDescription=amplifier?'Carga nominal':headphoneOutput?'Resistência de saída':headphone?'Impedância nominal do fone':passiveSub?'Impedância por bobina':speaker?'Impedância nominal':'Impedância de entrada';
            const powerTitle=`${powerDescription}: ${power} ${powerUnit}`;
            const impedanceTitle=`${impedanceDescription}: ${ohms} Ω`;
            return `<div class="catalog-rating-visuals" aria-label="Parâmetros elétricos"><div class="catalog-rating" role="img" aria-label="${powerTitle}"><svg viewBox="0 0 16 20" aria-hidden="true"><path d="M9.6 1 3 11h4l-.7 8L13 8.5H9.1Z"/></svg><span>${approximate?'≈':''}${power}</span><small>${powerUnit}</small><i class="catalog-rating-track"><i style="width:${fill(power,powerUnit==='mW'?20:5,powerMax)}%"></i></i></div><div class="catalog-rating" role="img" aria-label="${impedanceTitle}"><b class="catalog-rating-ohm" aria-hidden="true">Ω</b><span>${ohmsValue}</span><small>Ω</small><i class="catalog-rating-track"><i style="width:${fill(ohms,8,impedanceMax)}%"></i></i></div></div>`;
        }

        const INTEGRATED_AMPS={
            integratedUtility:{watts:20,tone:true,meters:false,finish:'utility',description:'Integrado cinza-oliva com controles de plástico, phono, loudness, mono e tone defeat. Amplificação estéreo nominal de 20 W por canal.'},
            integratedBlue:{watts:100,tone:true,meters:true,finish:'blue',description:'Integrado de frente preta com visores azuis e laterais metálicas. Três entradas de linha, phono, saídas para caixas e fones. '},
            integratedMinimal:{watts:70,tone:false,meters:false,finish:'minimal',description:'Integrado preto minimalista com seleção de fontes e volume. Três entradas de linha, phono, saídas para caixas e fones. '},
            integratedSilver:{watts:90,tone:true,meters:true,finish:'silver',description:'Integrado prateado com laterais em madeira, medidores âmbar e controles de tonalidade e balanço. Três entradas de linha, phono, saídas para caixas e fones. '}
        };
        const CUSTOM_PREAMPS={
            preClassic:{finish:'classic',tone:true,balance:true,phono:true,phones:false,sub:false,sources:['Auxiliar','Sintonizador','Tape','Phono'],description:'Pré em madeira com painel metálico, tonalidade independente L/R, modos de canais, monitor de fita e filtros de graves e agudos.'},
            preGlass:{finish:'glass',tone:true,balance:true,phono:true,phones:false,sub:false,sources:['Auxiliar','Sintonizador','Tape','Phono'],description:'Pré de vidro preto com laterais de alumínio, knobs prateados e alavancas metálicas. Três entradas de linha, phono, tonalidade, filtros de graves/agudos, loudness, mono, mute e inversão de polaridade.'},
            prePrecision:{finish:'precision',tone:false,balance:true,phono:false,phones:false,sub:false,description:'Pré compacto de alumínio escovado com modulômetro estéreo, seleção rotativa de quatro entradas, ganho 0/6/12 dB, mute, mono e inversão de polaridade.'},
            preReference:{finish:'reference',tone:false,balance:true,phono:false,phones:false,sub:false,description:'Pré de linha com frente prateada, alças e visor verde. Quatro entradas LINE, saída RCA estéreo, volume, balanço, mute, mono e inversão de polaridade. '},
            preControl:{finish:'control',tone:true,balance:true,phono:true,phones:true,sub:true,crossover:true,description:'Pré 2.1 prateado com visor azul, tonalidade e saída de subwoofer ajustável. Três entradas LINE e PHONO, saídas RCA de linha e fones P2. '},
            preDisplay:{finish:'display',tone:true,balance:true,phono:true,phones:true,sub:true,description:'Pré preto com dois knobs grandes e tela central mostrando fonte, volume e níveis L/R. Três entradas LINE e PHONO, saídas RCA de linha, sub mono e fones P10. '}
        };
        const controlAmpConfig=type=>INTEGRATED_AMPS[type]||CUSTOM_PREAMPS[type];
        const controlAmpSources=type=>controlAmpConfig(type).sources||['Linha 1','Linha 2','Linha 3',controlAmpConfig(type).phono===false?'Linha 4':'Phono'];
        const CUSTOM_POWER_AMPS={
            powerValve:{watts:75,finish:'valve',constantPower:true,description:'Potência estéreo com válvulas expostas, transformadores pretos e chassi cromado. Entrada RCA de linha e saídas amplificadas para caixas; 75 W nominais por canal, em simulação simplificada.'},
            powerDual:{watts:300,finish:'dual',description:'Potência estéreo de frente preta robusta, alças e LEDs independentes L/R. Conexões RCA e fio de caixa simplificadas para o simulador.'},
            powerBias:{watts:250,finish:'bias',description:'Potência estéreo prateada, dissipadores laterais e visor circular azul. O ponteiro mostra a potência de saída simulada do canal com maior nível; ganhos A/B ajustáveis no menu lateral.'}
        };
        const DEFAULT_POWER_GAIN=.5;
        // Individual simulation voicings.
        const AMPLIFICATION_VOICINGS={
            preClassic:{bass:.3,treble:-.4,drive:.4,asymmetry:.035},
            preGlass:{bass:.2,treble:-.35,drive:.38,asymmetry:.035},
            integratedUtility:{bass:.15,treble:-.2,drive:.2,asymmetry:0},
            prePrecision:{bass:0,treble:0,drive:.06,asymmetry:0},
            streamIntegrated:{bass:0,treble:0,drive:.08,asymmetry:0},
            powerValve:{bass:.8,treble:-1.5,drive:1.05,asymmetry:.11,knee:-9,ratio:1.55},
            powerDual:{bass:0,treble:0,drive:.12,asymmetry:0},
            powerBias:{bass:.25,treble:-.35,drive:.32,asymmetry:.025},
            powerStereo:{bass:.1,treble:-.1,drive:.22,asymmetry:0},
            powerVintage:{bass:.5,treble:-.8,drive:.52,asymmetry:.055},
            integratedBlue:{bass:.2,treble:-.2,drive:.26,asymmetry:.012},
            integratedMinimal:{bass:0,treble:0,drive:.16,asymmetry:0},
            integratedSilver:{bass:.3,treble:-.4,drive:.36,asymmetry:.018},
            receiver:{bass:.4,treble:-.65,drive:.42,asymmetry:.04},
            powerAmp:{bass:0,treble:0,drive:.1,asymmetry:0},
            preamp:{bass:0,treble:0,drive:.09,asymmetry:0},
            preReference:{bass:.15,treble:-.25,drive:.3,asymmetry:.045},
            preControl:{bass:0,treble:0,drive:.07,asymmetry:0},
            preDisplay:{bass:.05,treble:-.1,drive:.14,asymmetry:.008},
            headphoneAmp:{bass:.35,treble:-.55,drive:.4,asymmetry:.035},
            headphoneAmpModern:{bass:0,treble:0,drive:.08,asymmetry:0},
            headphoneAmp4:{bass:.05,treble:-.05,drive:.15,asymmetry:0}
        };
        function modelSaturationCurve(profile,size=4097){
            const curve=new Float32Array(size),drive=profile.drive,bias=profile.asymmetry||0,offset=Math.tanh(drive*bias),slope=drive*(1-offset*offset);
            for(let i=0;i<size;i++){
                const x=(i/(size-1)*2-1)*4;
                curve[i]=(Math.tanh(drive*(x+bias))-offset)/(slope*4);
            }
            return curve;
        }
        function installAmplificationVoicing(dev){
            const profile=AMPLIFICATION_VOICINGS[dev.type];if(!profile)return;
            const ctx=appState.audio.context,byNode=new Map(),curve=modelSaturationCurve(profile);dev.amplificationProfile=profile;dev.modelAudioNodes||=[];dev.valveWarmGains=[];
            const outputPorts=[...dev.el.querySelectorAll('.port[data-io="out"]')];
            for(const port of outputPorts){
                const key=port.dataset.node,input=dev.nodes[key];if(!input)continue;
                const outputKind=port.dataset.type==='wire'?'speaker':getPortSignal(port)==='headphone'?'phones':'line',cached=byNode.get(input);
                if(cached?.[outputKind]){dev.nodes[key]=cached[outputKind];continue;}
                let previous=input;
                const append=node=>{previous.connect(node);previous=node;dev.modelAudioNodes.push(node);};
                if(profile.bass){const filter=ctx.createBiquadFilter();filter.type='lowshelf';filter.frequency.value=140;filter.gain.value=profile.bass;append(filter);}
                if(profile.treble){const filter=ctx.createBiquadFilter();filter.type='highshelf';filter.frequency.value=4500;filter.gain.value=profile.treble;append(filter);}
                const headroom=ctx.createGain();headroom.gain.value=.25;append(headroom);
                const shaper=ctx.createWaveShaper();shaper.curve=curve;shaper.oversample=profile.drive>=.5?'2x':'none';append(shaper);
                const restore=ctx.createGain();restore.gain.value=4;append(restore);
                // Remove rectification DC while preserving silence at zero input.
                const dc=ctx.createBiquadFilter();dc.type='highpass';dc.frequency.value=5;dc.Q.value=.707;append(dc);
                if(profile.knee!=null){const compressor=ctx.createDynamicsCompressor();compressor.threshold.value=profile.knee;compressor.knee.value=18;compressor.ratio.value=profile.ratio;compressor.attack.value=.015;compressor.release.value=.18;append(compressor);}
                const trim=ctx.createGain();trim.gain.value=.9;append(trim);
                if(dev.type==='powerValve'){const warm=ctx.createGain();warm.gain.value=0;append(warm);dev.valveWarmGains.push(warm);}
                if(POWER_OUTPUT_TYPES.has(dev.type)&&port.dataset.type==='wire'){
                    const before=ctx.createGain();before.gain.value=.25;append(before);
                    const shaper=ctx.createWaveShaper();shaper.curve=electricalLimitCurve(1.35);shaper.oversample='2x';append(shaper);
                    const after=ctx.createGain();after.gain.value=4;append(after);const gate=ctx.createGain();append(gate);
                    const analyzer=ctx.createAnalyser();analyzer.fftSize=1024;gate.connect(analyzer);dev.modelAudioNodes.push(analyzer);
                    (dev.electricalStages||=[]).push({channel:port.dataset.channel||(/R$/.test(key)?'R':'L'),shaper,gate,analyzer,samples:new Float32Array(analyzer.fftSize),rms:0,peakLimit:Infinity,load:null});
                }
                const output=ctx.createGain();append(output);const variants=byNode.get(input)||{};variants[outputKind]=output;byNode.set(input,variants);dev.nodes[key]=output;
            }
            if(dev.type==='powerValve'){
                dev.syncValvePower=()=>{const t=ctx.currentTime;dev.valveWarmGains.forEach(gain=>{gain.gain.cancelAndHoldAtTime(t);gain.gain.linearRampToValueAtTime(dev.powered?1:0,t+(dev.powered?3:.03));});};dev.syncValvePower();
            }
        }
        function amplificationInspectorHtml(dev){
            const profile=dev.amplificationProfile;if(!profile)return '';
            // Fixed, shared ranges describe the base model rather than quality or live signal level.
            const traits=[
                {label:'Graves',value:profile.bass,min:-.8,max:.8,low:'Enxutos',high:'Encorpados',neutral:true},
                {label:'Agudos',value:profile.treble,min:-1.5,max:1.5,low:'Suaves',high:'Brilhantes',neutral:true},
                {label:'Saturação',value:profile.drive,min:0,max:1.05,low:'Sutil',high:'Marcante'},
                {label:'Harmônicos pares',value:profile.asymmetry??0,min:0,max:.11,low:'Discretos',high:'Presentes'}
            ];
            const rows=traits.map(trait=>{
                const position=Math.round(Math.max(0,Math.min(1,(trait.value-trait.min)/(trait.max-trait.min)))*6);
                const dots=Array.from({length:7},(_,index)=>`<i class="sonic-trait-dot${index===position?' is-active':''}${trait.neutral&&index===3?' is-neutral':''}"></i>`).join('');
                const accessible=`${trait.label}: posição ${position+1} de 7, de ${trait.low} a ${trait.high}.${trait.neutral?' Centro neutro.':''}`;
                return `<div class="sonic-trait" role="img" aria-label="${accessible}"><span class="sonic-trait-label">${trait.label}</span><div class="sonic-trait-dots" aria-hidden="true">${dots}</div><div class="sonic-trait-extremes" aria-hidden="true"><span>${trait.low}</span><span>${trait.neutral?'Neutros':''}</span><span>${trait.high}</span></div></div>`;
            }).join('');
            return `<section class="sonic-profile" aria-label="Comportamento sonoro"><h3 class="sonic-profile-title">Comportamento sonoro</h3>${rows}<span class="sonic-profile-note">Perfil base · escala relativa da simulação</span></section>`;
        }

        // Digital samples represent instantaneous voltage; RMS is computed from samples.
        const ELECTRICAL_MODEL=Object.freeze({lineVoltsPerUnit:Math.SQRT2*2,speakerVoltsPerUnit:100,phonoGain:100,converterRatio:.1,lineInputOhms:47000,converterInputOhms:20000});
        const HEADPHONE_SPECS=Object.freeze({headphone:{ohms:32,powerMw:300},hpStudio:{ohms:64,powerMw:500},hpClassic:{ohms:80,powerMw:300},hpMonitor:{ohms:32,powerMw:200},hpMax:{ohms:32,powerMw:150},...REFERENCE_HEADPHONES});
        const HEADPHONE_OUTPUT_SPECS=Object.freeze({
            streamIntegrated:{voltsRms:2,currentRms:.07,outputOhms:2},
            headphoneAmp:{voltsRms:3,currentRms:.065,outputOhms:12},headphoneAmpModern:{voltsRms:4,currentRms:.18,outputOhms:1},headphoneAmp4:{voltsRms:2.5,currentRms:.08,outputOhms:4},
            receiver:{voltsRms:3,currentRms:.04,outputOhms:47},powerAmp:{voltsRms:2.5,currentRms:.07,outputOhms:10},preControl:{voltsRms:2,currentRms:.07,outputOhms:3},preDisplay:{voltsRms:2.5,currentRms:.08,outputOhms:2}
        });
        const headphoneOutputSpec=dev=>HEADPHONE_OUTPUT_SPECS[dev.type]||{voltsRms:2,currentRms:.06,outputOhms:5};
        const wattsAtLoad=(rms,ohms)=>Number.isFinite(ohms)&&ohms>0?((rms||0)*ELECTRICAL_MODEL.speakerVoltsPerUnit)**2/ohms:0;
        const peakLimitForWatts=(watts,ohms)=>Math.sqrt(2*watts*ohms)/ELECTRICAL_MODEL.speakerVoltsPerUnit;
        const parallelOhms=values=>{const conductance=values.reduce((sum,value)=>sum+(Number.isFinite(value)&&value>0?1/value:0),0);return conductance>0?1/conductance:Infinity;};
        function amplifierChannelRms(dev,channel){return dev.electricalStages?.find(stage=>stage.channel===channel)?.rms||0;}
        function readElectricalStages(){
            const read=(dev,stage)=>{
                stage.analyzer.getFloatTimeDomainData(stage.samples);let sum=0,peak=0;
                for(const value of stage.samples){sum+=value*value;peak=Math.max(peak,Math.abs(value));}
                stage.rms=dev.powered&&!dev.state.damage&&appState.audio.context.state==='running'?Math.sqrt(sum/stage.samples.length):0;
                stage.clipping=stage.rms>0&&peak>stage.peakLimit*.94;
            };
            for(const dev of Object.values(appState.project.devices)){
                for(const stage of dev.electricalStages||[])read(dev,stage);
                for(const circuit of dev.outputCircuits||[])for(const path of circuit.paths)if(path.analyzer)read(dev,path);
            }
        }
        const POWER_OUTPUT_TYPES=new Set(['receiver','powerAmp','powerStereo','powerVintage','streamIntegrated',...Object.keys(INTEGRATED_AMPS),...Object.keys(CUSTOM_POWER_AMPS)]);
        const isListeningDevice=dev=>PASSIVE_SPK.has(dev.type)||ACTIVE_SPK.has(dev.type)||HP_TYPES.has(dev.type)||SUB_TYPES.has(dev.type)||PASSIVE_SUB_TYPES.has(dev.type);
        const FIXED_AMP_SPECS=Object.freeze({
            integratedUtility:{watts:20,minOhms:4,powerByOhms:{4:28,8:20}},
            streamIntegrated:{watts:40,minOhms:4,powerByOhms:{4:65,8:40}},
            receiver:{watts:60,minOhms:4,powerByOhms:{4:85,8:60}},
            powerAmp:{watts:100,minOhms:4,powerByOhms:{4:150,8:100}},
            powerStereo:{watts:80,minOhms:8,powerByOhms:{8:80}},
            powerVintage:{watts:40,minOhms:4,powerByOhms:{4:60,8:40}},
            integratedBlue:{watts:100,minOhms:4,powerByOhms:{4:160,8:100}},
            integratedMinimal:{watts:70,minOhms:4,powerByOhms:{4:100,8:70}},
            integratedSilver:{watts:90,minOhms:4,powerByOhms:{4:150,8:90}},
            powerValve:{watts:75,minOhms:4,powerByOhms:{4:75,8:75,16:75}},
            powerDual:{watts:300,minOhms:4,powerByOhms:{4:500,8:300}},
            powerBias:{watts:250,minOhms:4,powerByOhms:{4:400,8:250}}
        });
        const FIXED_PASSIVE_SPECS=Object.freeze({
            speaker:{ohms:8,watts:80},spkPassiveWood:{ohms:8,watts:60},spkPassiveCarbon:{ohms:6,watts:100},spkPassiveGridBlack:{ohms:4,watts:200,recommended:true},spkPassiveGridOrange:{ohms:4,watts:200,recommended:true},
            subwooferPassive:{ohms:4,watts:250},subwooferPassiveVintage:{ohms:8,watts:120}
        });
        const isRecommendedSpeakerPower=type=>!!(FLOOR_SPEAKERS[type]?.recommended||BOOKSHELF_SPEAKERS[type]?.recommended||FIXED_PASSIVE_SPECS[type]?.recommended);
        function connectPhonoPlayback(dev,gain,destination){
            const ctx=appState.audio.context,before=ctx.createGain(),clip=ctx.createWaveShaper(),after=ctx.createGain();
            before.gain.value=.25;after.gain.value=4;clip.curve=electricalLimitCurve(1.4);clip.oversample='2x';
            gain.connect(before);before.connect(clip);clip.connect(after);after.connect(destination);
            (dev.modelAudioNodes||=[]).push(before,clip,after);
        }
        function fixDeviceElectricalSpecs(dev){
            const amp=FIXED_AMP_SPECS[dev.type],reference=FLOOR_SPEAKERS[dev.type]||BOOKSHELF_SPEAKERS[dev.type],passive=reference||FIXED_PASSIVE_SPECS[dev.type];
            const fixed=amp?{ratedWatts:amp.watts,ratedOhms:8,minOhms:amp.minOhms}:passive?{speakerWatts:passive.watts,speakerOhms:passive.ohms}:HEADPHONE_SPECS[dev.type]?{headphoneOhms:HEADPHONE_SPECS[dev.type].ohms}:{};
            const phones=HEADPHONE_OUTPUT_SPECS[dev.type];if(phones)Object.assign(fixed,{headphoneMaxVrms:phones.voltsRms,headphoneMaxIrms:phones.currentRms,headphoneOutputOhms:phones.outputOhms});
            dev.electricalSpec=Object.freeze({...fixed});
            for(const [key,value]of Object.entries(fixed))if(!Object.getOwnPropertyDescriptor(dev.state,key)?.get)Object.defineProperty(dev.state,key,{enumerable:true,configurable:false,get:()=>value,set:()=>{}});
        }
        function ampPowerAtLoad(type,load){
            const spec=FIXED_AMP_SPECS[type];if(!spec||!Number.isFinite(load)||load<=0)return 0;
            const points=Object.entries(spec.powerByOhms).map(([ohms,watts])=>[Number(ohms),watts]).sort((a,b)=>a[0]-b[0]);
            if(load<points[0][0])return points[0][1]*points[0][0]/load;
            for(let i=1;i<points.length;i++)if(load<=points[i][0]){const [r0,p0]=points[i-1],[r1,p1]=points[i],t=Math.log(load/r0)/Math.log(r1/r0);return p0*(p1/p0)**t;}
            const [r,p]=points.at(-1);return p*r/load;
        }
        function electricalLimitCurve(limit,size=4097){
            const curve=new Float32Array(size),knee=limit*.85,width=Math.max(.0001,limit-knee);
            for(let i=0;i<size;i++){const x=(i/(size-1)*2-1)*4,a=Math.abs(x);curve[i]=Math.sign(x)*(a<=knee?a:knee+width*Math.tanh((a-knee)/width))/4;}
            return curve;
        }
        function setAmplifierLoad(dev,channel,ohms){
            const spec=FIXED_AMP_SPECS[dev.type];if(!spec)return;
            dev.channelLoads||={};dev.channelLoads[channel]=ohms;
            dev.electricalStages?.filter(stage=>stage.channel===channel).forEach(stage=>{
                if(stage.load===ohms)return;stage.load=ohms;
                const protectedLoad=ohms<spec.minOhms-.01;
                const referenceLoad=Number.isFinite(ohms)?ohms:8,available=ampPowerAtLoad(dev.type,referenceLoad),limit=peakLimitForWatts(available,referenceLoad);
                stage.peakLimit=limit;stage.shaper.curve=electricalLimitCurve(limit);stage.gate.gain.setTargetAtTime(protectedLoad?0:1,appState.audio.context.currentTime,.025);
            });
        }
        function electricalStatusMarkup(dev){
            const data=dev.powerStatusVisual||{},channels=data.channels||[],notes=data.notes||[];
            const state=dev.speakerOverloaded||notes.some(note=>note.state==='protection')?'protection':notes.some(note=>note.state==='attention')?'attention':notes.some(note=>note.state==='compatible')?'compatible':'waiting';
            const labels={protection:'Proteção',attention:'Atenção',compatible:'Compatível',waiting:'Sem conexão'};
            const channelMarkup=channels.map(channel=>`<span class="electrical-channel" data-state="${channel.state}" title="Canal ${channel.channel}: ${channel.detail}"><b>${channel.channel}</b><span>${channel.label}</span>${Number.isFinite(channel.watts)?`<small>${channel.watts} W</small>`:''}</span>`).join('');
            const noteText=notes.map(note=>note.detail).filter(Boolean);
            if(dev.speakerOverloaded)noteText.push('Sobrecarga: reduza o nível. Esta caixa passiva não possui limitador automático.');
            if(state==='waiting'&&!noteText.length)noteText.push('Conecte caixas passivas para calcular a carga por canal.');
            const current=Number(dev.simulatedInputWatts)||0;
            const currentMarkup=current>0?`<span class="electrical-current" title="Potência RMS estimada do áudio neste instante; a potência nominal do amplificador é sua capacidade máxima">${current.toFixed(2)} W <small>ATUAL</small></span>`:'';
            return `<div class="electrical-status" data-state="${state}" role="status" aria-label="${[...channels.map(channel=>`${channel.channel}: ${channel.label}`),labels[state],...noteText].join('. ')}">${channelMarkup}<span class="electrical-status-badge" data-state="${state}" title="${noteText.join(' ')}"><i aria-hidden="true"></i>${labels[state]}</span>${currentMarkup}</div>`;
        }
        function applySpeakerLoadDynamics(dev){
            if(!dev.listeningGain)return;
            let gain=dev.electricalBaseGain??1,power=0;
            for(const route of dev.electricalRoutes||[]){
                const rms=route.amp.powered?amplifierChannelRms(route.amp,route.channel):0;
                const delivered=wattsAtLoad(rms,dev.state.speakerOhms);power=PASSIVE_SUB_TYPES.has(dev.type)?power+delivered:Math.max(power,delivered);
            }
            // A maximum recommended amplifier rating is not a measured thermal limit.
            const recommended=isRecommendedSpeakerPower(dev.type);
            dev.speakerOverloaded=!recommended&&power>dev.state.speakerWatts;
            if(dev.state.damage)gain=0;
            dev.simulatedInputWatts=power;
            dev.powerStatusVisual={...(dev.powerStatusVisual||{}),currentWatts:power,overloaded:dev.speakerOverloaded};
            if(appState.interface.selectedDeviceId===dev.id){const status=document.getElementById('power-load-status');if(status)status.innerHTML=electricalStatusMarkup(dev);}
            dev.listeningGain.gain.setTargetAtTime(gain,appState.audio.context.currentTime,.06);
        }
        const isPassiveLoad=dev=>PASSIVE_SPK.has(dev.type)||PASSIVE_SUB_TYPES.has(dev.type);
        function installListeningControls(dev){
            if(!isListeningDevice(dev))return;
            dev.state.muted=false;dev.state.solo=false;
            const output=dev.outputPan||dev.analyzer;
            if(!output)return;
            dev.listeningGain=appState.audio.context.createGain();
            output.disconnect(appState.audio.masterGain);output.connect(dev.listeningGain);dev.listeningGain.connect(appState.audio.masterGain);
        }
        const portChannel=port=>port?.dataset.channel||(/[LR]$/.exec(port?.dataset.node||'')?.[0])||'';
        const isSignalPassthrough=dev=>!!INTERFACE_DEVICES[dev.type]?.passive||RCA_SWITCH_TYPES.has(dev.type)||MATRIX_TYPES.has(dev.type)||SPEAKER_SWITCH_TYPES.has(dev.type);
        function prospectiveConnections(prospective){
            if(!prospective)return appState.project.connections;
            return [...appState.project.connections.filter(c=>!c.miswired&&c.inId!==prospective.input.id&&c.outId!==prospective.output.id),{outId:prospective.output.id,inId:prospective.input.id}];
        }
        function routedInputPorts(dev,output,channelHint=''){
            const channel=portChannel(output)||channelHint;
            return [...dev.el.querySelectorAll('.port[data-io="in"]')].filter(input=>{
                if(channel&&portChannel(input)&&channel!==portChannel(input))return false;
                return !MATRIX_TYPES.has(dev.type)||input.dataset.node.startsWith('in'+dev.state.matrixInput);
            });
        }
        function inputOhms(dev,input){
            if(isPassiveLoad(dev))return dev.state.speakerOhms;
            if(HP_TYPES.has(dev.type))return dev.state.headphoneOhms||32;
            if(dev.type==='speakerConverter')return ELECTRICAL_MODEL.converterInputOhms;
            return getPortSignal(input)==='phono'?47000:ELECTRICAL_MODEL.lineInputOhms;
        }
        function terminalLoads(output,prospective=null,seen=new Set(),sourceChannel='',routingChannel=''){
            if(!output||seen.has(output.id))return [];
            const next=new Set(seen);next.add(output.id);const channel=sourceChannel||portChannel(output),localChannel=portChannel(output)||routingChannel;
            return prospectiveConnections(prospective).filter(c=>c.outId===output.id).flatMap(c=>{
                const input=document.getElementById(c.inId),dev=appState.project.devices[input?.closest('.device-node')?.id];
                if(!dev)return [];
                const nextChannel=portChannel(input)||localChannel;
                if(!isSignalPassthrough(dev))return [{dev,input,channel:channel||portChannel(input),ohms:inputOhms(dev,input)}];
                return [...dev.el.querySelectorAll('.port[data-io="out"]')].filter(port=>{
                    if(nextChannel&&portChannel(port)&&portChannel(port)!==nextChannel)return false;
                    if(!isSelectedSwitchOutput(dev,port))return false;
                    return routedInputPorts(dev,port).includes(input);
                }).flatMap(port=>terminalLoads(port,prospective,next,channel,nextChannel));
            });
        }
        function uniqueTerminalLoads(ports,prospective=null){
            return [...new Map(ports.flatMap(port=>terminalLoads(port,prospective)).map(load=>[load.input.id+':'+load.channel,load])).values()];
        }
        function installOutputCircuits(dev){
            const ctx=appState.audio.context,byNode=new Map();dev.outputCircuits=[];
            for(const port of dev.el.querySelectorAll('.port[data-io="out"]')){
                const node=dev.nodes[port.dataset.node];if(!node)continue;
                if(byNode.has(node)){const circuit=byNode.get(node);circuit.ports.push(port);dev.nodes[port.dataset.node]=circuit.output;continue;}
                const signal=getPortSignal(port),stereo=['p2','p10'].includes(port.dataset.type)&&!portChannel(port);
                const gate=ctx.createGain(),output=ctx.createGain(),paths=[];
                const split=stereo?ctx.createChannelSplitter(2):null,merge=stereo?ctx.createChannelMerger(2):null;
                const managed=[gate,output,...(stereo?[split,merge]:[])];
                if(split)node.connect(split);
                for(const [index,channel]of (stereo?['L','R']:[portChannel(port)]).entries()){
                    const loadGain=ctx.createGain();if(split)split.connect(loadGain,index);else node.connect(loadGain);
                    let previous=loadGain,shaper=null,analyzer=null;
                    managed.push(loadGain);
                    if(signal==='headphone'){
                        const before=ctx.createGain(),after=ctx.createGain();before.gain.value=.25;after.gain.value=4;
                        shaper=ctx.createWaveShaper();shaper.curve=electricalLimitCurve(2);shaper.oversample='2x';
                        previous.connect(before);before.connect(shaper);shaper.connect(after);previous=after;
                        analyzer=ctx.createAnalyser();analyzer.fftSize=1024;after.connect(analyzer);managed.push(before,shaper,after,analyzer);
                    }
                    if(merge)previous.connect(merge,0,index);else previous.connect(gate);
                    paths.push({channel,loadGain,shaper,analyzer,samples:analyzer?new Float32Array(analyzer.fftSize):null,load:null,rms:0,peakLimit:Infinity});
                }
                if(merge)merge.connect(gate);gate.connect(output);
                const circuit={ports:[port],signal,gate,output,paths};
                dev.outputCircuits.push(circuit);byNode.set(node,circuit);byNode.set(output,circuit);dev.nodes[port.dataset.node]=output;
                (dev.modelAudioNodes||=[]).push(...managed);
            }
        }
        function updateOutputCircuitLoads(){
            Object.values(appState.project.devices).forEach(dev=>dev.refreshStreamRouting?.());
            for(const dev of Object.values(appState.project.devices))for(const circuit of dev.outputCircuits||[]){
                circuit.signal=getPortSignal(circuit.ports[0]);if(circuit.signal==='amplified')continue;
                // RCA and stereo jacks of a source share their channel's output buffer.
                const shared=SOURCE_TYPES.has(dev.type)?dev.outputCircuits.filter(other=>getPortSignal(other.ports[0])===circuit.signal):[circuit];
                const loads=uniqueTerminalLoads(shared.flatMap(other=>other.ports));
                for(const path of circuit.paths){
                    const channelLoads=loads.filter(load=>!path.channel||!load.channel||load.channel===path.channel);
                    const ohms=parallelOhms(channelLoads.map(load=>load.ohms)),signature=circuit.signal+'|'+ohms;
                    if(path.loadSignature===signature)continue;path.loadSignature=signature;path.load=ohms;
                    const phones=!!path.shaper,spec=phones?headphoneOutputSpec(dev):{outputOhms:isSignalPassthrough(dev)?0:TURNTABLE_TYPES.has(dev.type)&&dev.state.tt?.output==='phono'?600:100};
                    const divider=Number.isFinite(ohms)?ohms/(ohms+spec.outputOhms):1;
                    path.loadGain.gain.setTargetAtTime(divider,appState.audio.context.currentTime,.025);
                    if(phones){
                        const availableVrms=Math.min(spec.voltsRms,Number.isFinite(ohms)?spec.currentRms*ohms:spec.voltsRms);
                        path.peakLimit=Math.SQRT2*availableVrms/ELECTRICAL_MODEL.lineVoltsPerUnit;
                        path.shaper.curve=electricalLimitCurve(path.peakLimit);
                    }
                }
            }
        }
        function amplifierOrigins(output,seen=new Set(),channelHint=''){
            if(!output||seen.has(output.id))return [];
            const dev=appState.project.devices[output.closest('.device-node')?.id];if(!dev||!isSelectedSwitchOutput(dev,output))return [];
            const channel=portChannel(output)||channelHint;
            if(POWER_OUTPUT_TYPES.has(dev.type)&&getPortSignal(output)==='amplified')return [{amp:dev,channel,key:dev.id+':'+channel}];
            if(!isSignalPassthrough(dev))return [];
            const next=new Set(seen);next.add(output.id);const inputs=routedInputPorts(dev,output,channel);
            return appState.project.connections.filter(c=>!c.miswired&&inputs.some(port=>port.id===c.inId)).flatMap(c=>amplifierOrigins(document.getElementById(c.outId),next,portChannel(document.getElementById(c.inId))||channel));
        }
        function amplifierRoutes(dev){
            const routes=appState.project.connections.filter(c=>!c.miswired&&document.getElementById(c.inId)?.closest('.device-node')?.id===dev.id).flatMap(c=>amplifierOrigins(document.getElementById(c.outId)));
            return [...new Map(routes.map(route=>[route.key,route])).values()];
        }
        function updateListeningControls(){
            if(!appState.audio.context)return;
            const devices=Object.values(appState.project.devices),sinks=devices.filter(isListeningDevice);
            const solo=sinks.some(dev=>dev.state.solo),loads=new Map(),routes=new Map();
            sinks.filter(isPassiveLoad).forEach(dev=>{
                const list=amplifierRoutes(dev);routes.set(dev.id,list);
                new Map(list.map(route=>[route.key,route])).forEach(route=>{
                    if(!loads.has(route.key))loads.set(route.key,{amp:route.amp,speakers:new Set()});
                    loads.get(route.key).speakers.add(dev);
                });
            });
            devices.forEach(dev=>{dev.powerStatus='';});
            devices.filter(dev=>FIXED_AMP_SPECS[dev.type]).forEach(amp=>['L','R'].forEach(ch=>{const ports=[...amp.el.querySelectorAll('.port[data-io="out"]')].filter(port=>getPortSignal(port)==='amplified'&&portChannel(port)===ch);setAmplifierLoad(amp,ch,parallelOhms(uniqueTerminalLoads(ports).map(load=>load.ohms)));}));
            updateOutputCircuitLoads();
            const ampWarnings=new Map();
            sinks.forEach(dev=>{
                let gain=1,notes=[],statusNotes=[],statusChannels=[];
                if(isPassiveLoad(dev)){
                    const list=routes.get(dev.id)||[];
                    if(!list.length){notes.push('Conecte a uma saída amplificada para calcular a carga.');statusNotes.push({state:'waiting',detail:'Conecte a uma saída amplificada para calcular a carga.'});}
                    list.forEach(route=>{
                        const group=loads.get(route.key);
                        const load=route.amp.channelLoads[route.channel];
                        const amp=route.amp,available=ampPowerAtLoad(amp.type,load);
                        const delivered=available*(load/dev.state.speakerOhms);
                        let message=`Carga ${load.toFixed(1)} Ω · até ${Math.round(delivered)} W nominais nesta caixa.`;
                        let statusState='compatible';
                        if(load<amp.state.minOhms-.01){gain=0;statusState='protection';message+=' Proteção: carga abaixo do mínimo do amplificador.';}
                        else if(delivered>dev.state.speakerWatts){statusState='attention';message+=' Atenção ao nível: reserva do amplificador acima da referência desta caixa.';}
                        else message+=' Conjunto compatível.';
                        notes.push(message);
                        const detail=`Canal ${route.channel}: ${message}`;
                        statusNotes.push({state:statusState,detail});
                        statusChannels.push({channel:route.channel,label:`${load.toFixed(1)} Ω`,watts:Math.round(delivered),state:statusState,detail});
                        if(!ampWarnings.has(amp.id))ampWarnings.set(amp.id,[]);
                        ampWarnings.get(amp.id).push({state:statusState,detail});
                    });
                }
                dev.electricalRoutes=routes.get(dev.id)||[];
                dev.powerStatus=notes.join(' ');
                if(isPassiveLoad(dev))dev.powerStatusVisual={channels:statusChannels,notes:statusNotes};
                const audible=!dev.state.damage&&!dev.state.muted&&(!solo||dev.state.solo);
                dev.electricalBaseGain=audible?gain:0;
                if(isPassiveLoad(dev))applySpeakerLoadDynamics(dev);else dev.listeningGain?.gain.setTargetAtTime(audible?gain:0,appState.audio.context.currentTime,.025);
                dev.el.classList.toggle('listening-muted',!audible||gain===0);
                dev.el.classList.toggle('listening-solo',!!dev.state.solo);
            });
            ampWarnings.forEach((notes,id)=>appState.project.devices[id].powerStatus=notes.map(note=>note.detail).join(' '));
            devices.filter(dev=>FIXED_AMP_SPECS[dev.type]).forEach(dev=>{
                const channels=['L','R'].map(ch=>{const ohms=dev.channelLoads?.[ch]??Infinity,min=dev.state.minOhms||0,state=!Number.isFinite(ohms)?'empty':ohms<min-.01?'protection':'compatible',label=Number.isFinite(ohms)?(ohms>=1000?(ohms/1000).toFixed(1)+' kΩ':ohms.toFixed(1)+' Ω'):'Sem carga',watts=Number.isFinite(ohms)?Math.round(ampPowerAtLoad(dev.type,ohms)):null;return {channel:ch,label,watts,state,detail:`Canal ${ch}: ${label}${watts!==null?`, até ${watts} W`:''}${state==='protection'?`; abaixo da carga mínima de ${min} Ω`:''}.`};});
                const valveWarning=dev.type==='powerValve'&&Object.values(dev.channelLoads||{}).some(load=>!Number.isFinite(load)||load>16)?{state:'attention',detail:'Valvulado: use uma carga de caixa adequada; circuito aberto não equivale a 8 Ω.'}:null;
                const notes=[...(ampWarnings.get(dev.id)||[]),...(valveWarning?[valveWarning]:[])];
                dev.powerStatus=[...channels.map(channel=>`${channel.channel}: ${channel.label}`),...notes.map(note=>note.detail)].join(' ');
                dev.powerStatusVisual={channels,notes};
            });

            const selected=appState.project.devices[appState.interface.selectedDeviceId];
            const status=document.getElementById('power-load-status');if(status&&selected)status.innerHTML=electricalStatusMarkup(selected);
        }
        function listeningInspectorHtml(dev){
            let html='';
            if(isListeningDevice(dev))html+=`<section class="listening-output-controls flex flex-col gap-2 border-t border-gray-700 pt-4"><span class="text-sm text-gray-300">Escuta desta saída</span><div class="flex gap-2"><button id="listening-solo" class="tt-insp-btn flex-1 ${dev.state.solo?'is-on':''}" aria-label="Solo" aria-pressed="${!!dev.state.solo}"><svg aria-hidden="true" viewBox="0 0 24 24"><path d="M12 3v18m-5-4V7m10 10V7M3 10v4m18-4v4"/></svg><span>SOLO</span></button><button id="listening-mute" class="tt-insp-btn flex-1 ${dev.state.muted?'is-on':''}" aria-label="Mute" aria-pressed="${!!dev.state.muted}"><svg aria-hidden="true" viewBox="0 0 24 24"><path d="M11 5 6 9H3v6h3l5 4zM16 9l5 6m0-6-5 6"/></svg><span>MUTE</span></button></div></section>`;
            if(HEADPHONE_OUTPUT_SPECS[dev.type]){const spec=HEADPHONE_OUTPUT_SPECS[dev.type];html+=`<section class="headphone-output-specs" aria-label="Saída de fones"><div class="headphone-output-heading"><span>Saída de fones</span><span aria-hidden="true">♫</span></div><dl><div><dt>Tensão máx.</dt><dd>${spec.voltsRms} V RMS</dd></div><div><dt>Corrente · canal</dt><dd>${Math.round(spec.currentRms*1000)} mA RMS</dd></div><div><dt>Resistência saída</dt><dd>${spec.outputOhms} Ω</dd></div></dl></section>`;}
            if(HP_TYPES.has(dev.type)&&dev.type!=='hpMax')html+=`<p class="text-sm text-gray-300">Impedância fixa: ${dev.state.headphoneOhms} Ω. A impedância, a resistência de saída e os limites de tensão/corrente do amplificador afetam o sinal.</p>`;
            const amp=POWER_OUTPUT_TYPES.has(dev.type),passive=isPassiveLoad(dev);
            if(amp||passive){
                const spec=FIXED_AMP_SPECS[dev.type],recommended=isRecommendedSpeakerPower(dev.type);
                const fields=amp?[["power",'Potência por canal',`${dev.state.ratedWatts} W / 8 Ω`],["impedance",'Carga mínima simulada',`${dev.state.minOhms} Ω`],["load",'Potência por carga',Object.entries(spec.powerByOhms).map(([r,p])=>`${p} W / ${r} Ω`).join(' · ')]]:[["impedance",PASSIVE_SUB_TYPES.has(dev.type)?'Impedância por bobina isolada':'Impedância nominal',`${dev.state.speakerOhms} Ω`],["power",recommended?'Amplificação recomendada':'Potência nominal suportada',`${dev.state.speakerWatts} W`]];
                if(dev.type==='spkElectrostatic')fields.push(['sensitivity','Sensibilidade de referência','84 dB / 2,83 V / 1 m']);
                const icons={power:'W',impedance:'Ω',load:'W',sensitivity:'dB'};
                html+=`<section class="model-specs"><div class="model-specs-heading"><span>Características do modelo</span></div><dl class="model-specs-grid">${fields.map(([kind,label,value])=>`<div class="model-spec" data-kind="${kind}"><dt><span class="model-spec-icon" aria-hidden="true">${icons[kind]}</span>${label}</dt><dd>${value}</dd></div>`).join('')}</dl><div id="power-load-status" class="model-specs-status"></div></section>`;
            }
            if(PASSIVE_SUB_TYPES.has(dev.type))html+='<p class="text-xs text-gray-400">Entradas L/R representam bobinas eletricamente isoladas. A potência total soma as duas bobinas; não una saídas de amplificadores entre si.</p>';
            return html;
        }
        function bindListeningInspector(dev){
            ['solo','muted'].forEach(key=>{
                document.getElementById(key==='solo'?'listening-solo':'listening-mute')?.addEventListener('click',event=>{
                    dev.state[key]=!dev.state[key];updateListeningControls();
                    event.currentTarget.setAttribute('aria-pressed',String(dev.state[key]));
                    event.currentTarget.classList.toggle('is-on',dev.state[key]);
                });
            });
            updateListeningControls();
        }
        function applyCableAppearance(connection){
            const hidden=!!appState.canvas.hideCables||!!connection.hidden;
            connection.el.style.display=hidden?'none':'';
            connection.el.querySelectorAll('.cable-path,.wire-braid-red').forEach(path=>{
                if(connection.color)path.style.setProperty('stroke',connection.color,'important');else path.style.removeProperty('stroke');
            });
            let label=connection.el.querySelector('.cable-user-label');
            if(connection.label){
                if(!label){label=document.createElementNS('http://www.w3.org/2000/svg','text');label.classList.add('cable-user-label');connection.el.appendChild(label);}
                label.textContent=connection.label;
                const path=connection.el.querySelector('.cable-path,.wire-braid-red');
                if(path){const point=path.getPointAtLength(path.getTotalLength()/2);label.setAttribute('x',point.x);label.setAttribute('y',point.y-9);}
            }else label?.remove();
        }
        function renderCableProperties(){
            let panel=document.getElementById('cable-properties');
            if(!panel){panel=document.createElement('section');panel.id='cable-properties';panel.className='p-5 border-t border-gray-700 flex flex-col gap-3';document.getElementById('inspector').appendChild(panel);}
            const connection=appState.interface.selectedConnection;panel.hidden=!connection;
            if(!connection)return;
            panel.innerHTML='<label for="cable-label" class="text-sm text-gray-300">Etiqueta</label><div class="cable-label-row"><input id="cable-label" type="text" maxlength="60" class="p-2 rounded bg-gray-800 border border-gray-600 text-gray-100" placeholder="Nome do cabo"><button id="cable-visibility" type="button" aria-description="Ocultar altera apenas o visual; o áudio continua passando." data-tooltip="Ocultar altera apenas o visual; o áudio continua passando."><svg viewBox="0 0 24 24" aria-hidden="true"><path class="cable-eye-open" d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6-10-6-10-6Z"/><circle class="cable-eye-open" cx="12" cy="12" r="2.8"/><path class="cable-eye-closed" d="M2 13c3-3 6-4 10-4s7 1 10 4M6 16l-2 2m8-1v3m6-4 2 2"/></svg></button></div><div class="flex flex-col gap-3"><div class="flex items-center justify-between"><span class="text-sm text-gray-300">Cor</span><button id="cable-color-reset" type="button" class="text-xs text-blue-300">Padrão</button></div><div id="cable-color-palette" class="cable-color-palette" role="group" aria-label="Cor do cabo"></div></div>';
            const out=document.getElementById(connection.outId),input=document.getElementById(connection.inId);
            if(out&&input){const info=document.createElement('p');info.className='cable-signal-summary';info.textContent=connection.miswired?'Ligação entre portas da mesma direção. O cabo está encaixado, mas não transporta áudio; há risco de dano em equipamentos reais.':`Transporta ${portSignalLabel(out)} → entrada espera ${portSignalLabel(input)}. ${getPortCompatibility(out,input).reason}`;panel.appendChild(info);}
            const slackControl=document.createElement('div');slackControl.className='flex flex-col gap-3';
            slackControl.innerHTML='<span class="text-sm text-gray-300">Folga</span><div class="grid grid-cols-3 gap-2" role="group" aria-label="Folga do cabo"></div>';
            const slackGroup=slackControl.querySelector('[role="group"]');
            const currentSlack=(connection.slack??5)<=2?0:(connection.slack??5)>=8?10:5;
            [[0,'Esticado','M3 11c5 0 13 0 18 0'],[5,'Normal','M3 8c4 0 4 8 9 8s5-8 9-8'],[10,'Solto','M3 5c4 0 3 15 9 15s5-15 9-15']].forEach(([value,name,path])=>{
                const button=document.createElement('button');button.type='button';button.className='tt-insp-btn cable-slack-choice'+(currentSlack===value?' is-on':'');button.innerHTML=`<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="3" cy="${value===0?11:value===5?8:5}" r="1.7"/><path d="${path}"/><circle cx="21" cy="${value===0?11:value===5?8:5}" r="1.7"/></svg>`;button.setAttribute('aria-label',name);button.title=name;button.setAttribute('aria-pressed',String(currentSlack===value));
                button.addEventListener('click',()=>{connection.slack=value;[...slackGroup.children].forEach(item=>{const active=item===button;item.classList.toggle('is-on',active);item.setAttribute('aria-pressed',String(active));});updateCables();scheduleProjectSave();});slackGroup.appendChild(button);
            });panel.appendChild(slackControl);
            const label=panel.querySelector('#cable-label');label.value=connection.label||'';
            label.addEventListener('input',()=>{connection.label=label.value;document.getElementById('inspector-title').textContent=connection.label||'Cabo';applyCableAppearance(connection);scheduleProjectSave();});
            const colors=[['Vermelho','#ef4444'],['Laranja','#f97316'],['Amarelo','#facc15'],['Verde','#22c55e'],['Azul','#60a5fa'],['Violeta','#a78bfa'],['Branco','#e5e7eb'],['Cinza','#64748b']];
            const palette=panel.querySelector('#cable-color-palette');
            colors.forEach(([name,color])=>{
                const button=document.createElement('button');button.type='button';button.className='cable-color-swatch';
                button.style.setProperty('--swatch-color',color);button.title=name;button.setAttribute('aria-label',name);
                button.setAttribute('aria-pressed',String(connection.color===color));
                button.onclick=()=>{
                    connection.color=color;applyCableAppearance(connection);
                    [...palette.children].forEach(item=>item.setAttribute('aria-pressed',String(item===button)));
                };
                palette.appendChild(button);
            });
            panel.querySelector('#cable-color-reset').onclick=()=>{delete connection.color;applyCableAppearance(connection);renderCableProperties();};
            const visibility=panel.querySelector('#cable-visibility');const syncVisibility=()=>{visibility.setAttribute('aria-pressed',String(!connection.hidden));visibility.setAttribute('aria-label',connection.hidden?'Mostrar cabo':'Ocultar cabo');};syncVisibility();
            visibility.onclick=()=>{connection.hidden=!connection.hidden;applyCableAppearance(connection);syncVisibility();scheduleProjectSave();};
        }

        function wireSpeakerIn(dev, stereo = false) {
            dev.analyzer = appState.audio.context.createAnalyser();
            dev.dataArray = new Uint8Array(dev.analyzer.frequencyBinCount);
            if (stereo) {
                dev.nodes.inR = appState.audio.context.createGain();
                dev.nodes.inL = appState.audio.context.createGain();
                const compact=dev.type==='spkActiveCompact';
                const summer = compact?appState.audio.context.createChannelMerger(2):appState.audio.context.createGain();
                // A porta RCA mono das caixas ativas usa este mesmo ponto de entrada.
                dev.nodes.in = summer;
                if(compact){
                    dev.nodes.inR.connect(summer,0,1);dev.nodes.inL.connect(summer,0,0);
                    dev.nodes.inStereo=appState.audio.context.createGain();
                    dev.auxSplitter=appState.audio.context.createChannelSplitter(2);
                    dev.nodes.inStereo.connect(dev.auxSplitter);
                    dev.auxSplitter.connect(dev.nodes.inL,0);dev.auxSplitter.connect(dev.nodes.inR,1);
                }else{dev.nodes.inR.connect(summer);dev.nodes.inL.connect(summer);}
                dev.volumeNode = appState.audio.context.createGain();
                summer.connect(dev.volumeNode);
                dev.volumeNode.connect(dev.powerGain);
            } else {
                dev.nodes.in = appState.audio.context.createGain();
                dev.nodes.in.connect(dev.powerGain);
            }
            dev.listeningProfile=LISTENING_PROFILES[dev.type];
            let output=dev.powerGain;
            dev.voicingNodes=[];
            if(dev.listeningProfile){
                // Identical filters process both channels without mixing L and R.
                const trim=appState.audio.context.createGain();
                trim.gain.value=10**((dev.listeningProfile.headroomDb??-4)/20);
                output.connect(trim);output=trim;dev.voicingNodes.push(trim);
                if(dev.listeningProfile.bassAlignment||dev.listeningProfile.filterSpecs){
                    const specs=dev.listeningProfile.bassAlignment?floorListeningFilters(dev.listeningProfile,appState.audio.context.sampleRate):dev.listeningProfile.filterSpecs;
                    specs.forEach(spec=>{
                        const coefficients=speakerFilterCoefficients(spec,appState.audio.context.sampleRate);
                        const filter=appState.audio.context.createIIRFilter(coefficients.feedforward,coefficients.feedback);
                        output.connect(filter);output=filter;dev.voicingNodes.push(filter);
                    });
                }else{
                if(dev.listeningProfile.highpass){
                    const filter=appState.audio.context.createBiquadFilter();filter.type='highpass';filter.frequency.value=dev.listeningProfile.highpass;filter.Q.value=Math.SQRT1_2;
                    output.connect(filter);output=filter;dev.voicingNodes.push(filter);
                }
                ['lowshelf','peaking','highshelf'].forEach((type,index)=>{
                    const filter=appState.audio.context.createBiquadFilter();
                    filter.type=type;filter.frequency.value=[120,1600,5500][index];
                    filter.Q.value=.7;filter.gain.value=dev.listeningProfile.bands[index];
                    output.connect(filter);output=filter;dev.voicingNodes.push(filter);
                });
                }
            }
            output.connect(dev.analyzer);
            if (PASSIVE_SPK.has(dev.type) || ACTIVE_SPK.has(dev.type)) {
                dev.outputPan = appState.audio.context.createStereoPanner();
                dev.analyzer.connect(dev.outputPan);
                dev.outputPan.connect(appState.audio.masterGain);
            } else dev.analyzer.connect(appState.audio.masterGain);
        }

        function setMixerVolume(dev, channel, value) {
            const level = Math.max(0, Math.min(1, Number(value)));
            dev.state.channelVolumes ||= [0.8, 0.8, 0.8];
            dev.state.channelVolumes[channel] = level;
            ['R', 'L'].forEach(side => { if (dev.channelGains?.[channel]?.[side]) dev.channelGains[channel][side].gain.setTargetAtTime(level, appState.audio.context.currentTime, 0.015); });
            const output = dev.el.querySelector(`[data-mixer-value="${channel}"]`);
            if (output) output.textContent = `${Math.round(level * 100)}%`;
            const onDevice = dev.el.querySelector(`[data-mixer-channel="${channel}"]`);
            if (onDevice && Number(onDevice.value) !== level) onDevice.value = String(level);
            const label = document.getElementById(`lbl-mixer-${channel}`);
            if (label) label.textContent = `${Math.round(level * 100)}%`;
            updateCableFlows();
        }

        let audioPrimed=false,audioNeedsGestureRecovery=false,legacyPlaybackAudio=null;
