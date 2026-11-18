/* Shared front panel artwork for the Aurenne P-220 and R-220. */
((root) => {
  'use strict';

  const preChassis = `
<div class="chassis pre-chassis">
    <aside class="port-bank">
      <h3>IN · RCA</h3>
      <span class="port-key">L      R</span>
      <div data-pairs="PHONO 1|PHONO 2|AUX|TAPE 1 PLAY|TAPE 2 PLAY"></div>
    </aside>

    <div class="silver-face">
      <i class="screw"></i><i class="screw"></i><i class="screw"></i><i class="screw"></i>
      <div class="radio-glass">
        <div class="instruments">
          <div class="meter"><canvas width="176" height="70" data-meter="left"></canvas><span>PEAK L-CH</span></div>
          <div class="meter"><canvas width="176" height="70" data-meter="right"></canvas><span>PEAK R-CH</span></div>
          <div class="meter"><canvas width="176" height="70" data-meter="signal"></canvas><span>SIGNAL</span></div>
          <div class="meter"><canvas width="176" height="70" data-meter="tuning"></canvas><span>TUNING</span></div>
          <div class="indicators">
            <div class="input-lights">
              <span><i class="lamp" data-aurenne-lamp="phono1"></i>PH 1</span><span><i class="lamp" data-aurenne-lamp="phono2"></i>PH 2</span>
              <span><i class="lamp" data-aurenne-lamp="aux"></i>AUX</span><span><i class="lamp red" data-aurenne-lamp="fm"></i>FM</span><span><i class="lamp" data-aurenne-lamp="am"></i>AM</span>
            </div>
            <span class="stereo-light"><i class="lamp green" data-aurenne-lamp="stereo"></i>FM STEREO</span>
          </div>
        </div>
        <div class="scales">
          <div class="scale"><b class="scale-name">FM</b><div class="ruler" data-band="fm"></div><span class="scale-unit">MHz</span></div>
          <div class="scale"><b class="scale-name">AM</b><div class="ruler" data-band="am"></div><span class="scale-unit">kHz</span></div>
          <i class="pointer"></i>
        </div>
      </div>

      <div class="nameplate">
        <span class="mark"><img data-wordmark alt="Aurenne"><b>P-220</b></span>
        <span>DC STEREO PREAMPLIFIER · AM / FM</span>
      </div>

      <div class="front-controls">
        <div>
          <div class="lever-bank" data-levers="power"></div>
          <div class="secondary-controls" data-controls="tone"></div>
        </div>
        <div class="large-knobs">
          <div class="control rotary main-control">
            <div class="graduated"><i class="knob" data-aurenne-knob="volumeStep" style="--index:-83deg"></i></div>
            <span class="control-label">VOLUME</span>
            <span class="control-detail">−∞ &nbsp; · &nbsp; 0 dB</span>
          </div>
          <div class="balance-bank">
            <div class="lever-bank" data-levers="mode"></div>
            <div data-controls="balance"></div>
          </div>
          <div class="control rotary main-control">
            <div class="graduated"><i class="knob" data-aurenne-knob="tuning" style="--index:14deg"></i></div>
            <span class="control-label">TUNING</span>
            <span class="control-detail">FM / AM</span>
          </div>
        </div>
        <div>
          <div class="lever-bank" data-levers="radio"></div>
          <div class="secondary-controls" data-controls="sources"></div>
        </div>
      </div>
    </div>

    <aside class="port-bank">
      <h3>OUT · RCA</h3>
      <span class="port-key">L      R</span>
      <div data-pairs="PRE OUT|TAPE 1 REC|TAPE 2 REC"></div>
    </aside>
  </div>`;

  const powerChassis = `
<div class="chassis power-chassis">
    <aside class="port-bank">
      <h3>INPUT</h3>
      <span class="port-key">L      R</span>
      <div data-pairs="POWER IN"></div>
    </aside>
    <div class="heat-sink"></div>
    <div class="power-core">
      <div class="fan-grille"><i class="fan-rotor"></i></div>
      <div class="power-controls"><div class="lever-bank" data-levers="output"></div></div>
      <span class="power-caption"><i data-aurenne-fan></i>AUTOMATIC FAN</span>
    </div>
    <div class="heat-sink"></div>
    <aside class="port-bank">
      <h3>SPEAKERS</h3>
      <div data-speakers></div>
    </aside>
    <div class="plinth"><b>AURENNE</b><span>DC STEREO POWER AMPLIFIER</span><b>R-220</b></div>
  </div>`;

  const levers = {
    power: [
      ["power", "POWER", "ON", true], ["tone", "TONE", "ON", true],
      ["loudness", "LOUD<br>NESS", "OFF"], ["bassTurn", "BASS<br>TURN", "200 / 400"],
      ["muted", "MUTE", "−20 dB"], ["trebleTurn", "TREBLE<br>TURN", "2.5 / 5k"],
    ],
    mode: [["mono", "MODE", "ST / MONO"]],
    radio: [
      ["fmMuting", "FM<br>MUTE", "ON", true], ["subsonic", "SUBSONIC", "16 Hz"],
      ["highFilter", "HIGH<br>FILTER", "3 kHz"], ["monitor", "TAPE<br>MON", "SOURCE"],
    ],
    output: [["power", "POWER", "ON", true], ["speakerA", "SPKR A", "ON", true], ["speakerB", "SPKR B", "OFF"]],
  };
  const knobs = {
    tone: [
      ["outPhone1", "1", "", "jack"], ["outPhone2", "2", "", "jack"],
      ["bass", "BASS", "− &nbsp; 0 &nbsp; +"], ["mid", "MIDRANGE", "− &nbsp; 0 &nbsp; +"], ["treble", "TREBLE", "− &nbsp; 0 &nbsp; +"],
    ],
    balance: [["balance", "BALANCE", "L &nbsp; R"]],
    sources: [
      ["impedance", "IMPEDANCE", "33 / 47 / 100k", "phono-knob", -55],
      ["source", "SELECTOR", "PH·AUX·FM·AM", "selector-knob", 45],
    ],
  };
  const ports = {
    "PHONO 1": ["phono1", "in", "phono"], "PHONO 2": ["phono2", "in", "phono"], AUX: ["aux", "in", "line"],
    "TAPE 1 PLAY": ["tape1", "in", "line"], "TAPE 2 PLAY": ["tape2", "in", "line"],
    "PRE OUT": ["pre", "out", "line"], "TAPE 1 REC": ["rec1", "out", "line"], "TAPE 2 REC": ["rec2", "out", "line"],
    "POWER IN": ["in", "in", "line"],
  };
  const controlNames = {
    power: "Ligar ou desligar", tone: "Controle de tonalidade", loudness: "Loudness",
    bassTurn: "Frequência de atuação dos graves", trebleTurn: "Frequência de atuação dos agudos",
    muted: "Atenuação de 20 dB", mono: "Modo mono", fmMuting: "Silenciar ruído entre estações FM",
    subsonic: "Filtro subsônico", highFilter: "Filtro de agudos", monitor: "Monitor de fita",
    speakerA: "Caixas A", speakerB: "Caixas B", volumeStep: "Volume", tuning: "Sintonia",
    bass: "Graves", mid: "Médios", treble: "Agudos", balance: "Balanço",
    impedance: "Impedância da entrada phono", source: "Seletor de fonte",
  };
  const meterScales = {
    left: { labels: ["−20", "−10", "−5", "0", "+3"], needle: .57 },
    right: { labels: ["−20", "−10", "−5", "0", "+3"], needle: .5 },
    signal: { labels: ["0", "1", "2", "3", "4", "5"], needle: .83 },
    tuning: { labels: ["−", "0", "+"], needle: .5 },
  };

  function drawMeter(canvas, position) {
    const { labels, needle } = meterScales[canvas.dataset.meter];
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const point = (fraction, radius) => {
      const angle = (fraction - .5) * 1.66;
      return [88 + radius * Math.sin(angle), 93 - radius * Math.cos(angle)];
    };
    ctx.lineWidth = 1;
    ctx.strokeStyle = "#243b2e";
    ctx.fillStyle = "#273b2e";
    ctx.font = "11px Arial";
    ctx.textAlign = "center";
    const divisions = (labels.length - 1) * 5;
    for (let tick = 0; tick <= divisions; tick++) {
      const fraction = tick / divisions;
      const major = tick % 5 === 0;
      ctx.beginPath();
      ctx.moveTo(...point(fraction, 65));
      ctx.lineTo(...point(fraction, major ? 74 : 70));
      ctx.stroke();
      if (major) ctx.fillText(labels[tick / 5], ...point(fraction, 78));
    }
    ctx.strokeStyle = "#772a21";
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(...point(position ?? needle, 0));
    ctx.lineTo(...point(position ?? needle, 75));
    ctx.stroke();
  }

  const bandScales = {
    fm: { positions: [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100], values: [88, 90, 92, 94, 96, 98, 100, 102, 104, 106, 108] },
    am: { positions: [0, 13, 26, 39, 58, 74, 88, 100], values: [530, 600, 700, 800, 1000, 1200, 1400, 1600] },
  };
  function frequency(band, percentage) {
    const { positions, values } = bandScales[band];
    const end = positions.findIndex(position => position >= percentage);
    if (end === 0) return values[0];
    if (end < 0) return values.at(-1);
    const start = end - 1;
    return values[start] + (values[end] - values[start]) * (percentage - positions[start]) / (positions[end] - positions[start]);
  }
  function renderRuler(ruler) {
    const { positions, values } = bandScales[ruler.dataset.band];
    const marks = [];
    positions.forEach((position, index) => {
      marks.push(`<i class="tick major" style="left:${position}%"></i><span class="tick-label" style="left:${position}%">${values[index]}</span>`);
      if (index === positions.length - 1) return;
      for (let step = 1; step < 5; step++) {
        const left = position + (positions[index + 1] - position) * step / 5;
        marks.push(`<i class="tick" style="left:${left}%"></i>`);
      }
    });
    ruler.innerHTML = marks.join("");
  }

  function makePort(preview, { node, io, signal, type, group, label, style }) {
    const attributes = preview ? "" :
      ` data-node="${node}" data-io="${io}" data-signal="${signal}" data-type="${type}" data-port-group="${group}" aria-label="${label}" title="${label}"`;
    const classes = preview ? style : `${style} port`;
    return `<i class="${classes}"${attributes}>${type === "wire" ? '<i class="post plus"></i><i class="post"></i>' : ""}</i>`;
  }

  function fillPortBanks(scope, preview) {
    scope.querySelectorAll("[data-pairs]").forEach(bank => {
      bank.innerHTML = bank.dataset.pairs.split("|").map(name => {
        const [prefix, io, signal] = ports[name];
        const pair = ["L", "R"].map(channel => makePort(preview, {
          node: prefix + channel, io, signal, type: "rca-" + channel.toLowerCase(),
          group: name, label: `${name} · RCA ${channel}`, style: channel === "L" ? "jack rca" : "jack rca red",
        })).join("");
        return `<div class="port-block"><span>${name}</span><span class="port-pair">${pair}</span></div>`;
      }).join("");
    });
    const speakers = scope.querySelector("[data-speakers]");
    if (!speakers) return;
    speakers.innerHTML = ["A", "B"].map(bank => `
      <div class="port-block"><span>SYSTEM ${bank}</span><div class="binding-posts">
        ${["L", "R"].map(channel => `<span class="binding-channel">${channel}</span>` + makePort(preview, {
          node: "speaker" + bank + channel, io: "out", signal: "amplified", type: "wire",
          group: `Caixas ${bank}`, label: `Caixas ${bank} · ${channel}`, style: "binding-channel binding-socket",
        })).join("")}
      </div></div>`).join("");
  }

  function fillLeverBanks(scope, preview) {
    scope.querySelectorAll("[data-levers]").forEach(bank => {
      bank.innerHTML = levers[bank.dataset.levers].map(([key, label, detail, on]) => {
        const tag = preview ? "span" : "button";
        const semantics = key === "power" ? `role="switch" aria-checked="${!!on}"` : `aria-pressed="${!!on}"`;
        const attributes = preview ? "" : ` type="button" data-own-skin data-aurenne-switch="${key}" aria-label="${controlNames[key]}" title="${controlNames[key]}" ${semantics}`;
        return `<div class="control">
          <span class="control-label">${label}</span>
          <${tag} class="lever-slot${key === "power" && !preview ? " power-btn" : ""}${on ? " up" : ""}"${attributes}><i class="lever"></i></${tag}>
          <span class="control-detail${key === "power" ? " power-state" : ""}">${detail}</span>
        </div>`;
      }).join("");
    });
  }

  function fillKnobs(scope, preview) {
    scope.querySelectorAll("[data-controls]").forEach(bank => {
      bank.innerHTML = knobs[bank.dataset.controls].map(([key, label, detail, shape = "", index = 0]) => {
        if (shape === "jack") {
          const socket = makePort(preview, {
            node: key, io: "out", signal: "headphone", type: "p10", group: "Fones " + label, label: "Fones P10 · " + label, style: "jack",
          });
          return `<div class="control jack-control">${socket}<span class="control-label">${label}</span></div>`;
        }
        return `<div class="control rotary ${shape}"><i class="knob" data-aurenne-knob="${key}" style="--index:${index}deg"></i><span class="control-label">${label}</span><span class="control-detail">${detail}</span></div>`;
      }).join("");
    });
    if (preview) return;
    scope.querySelectorAll("[data-aurenne-knob]").forEach(knob => {
      const button = document.createElement("button");
      const key = knob.dataset.aurenneKnob;
      button.type = "button";
      button.className = knob.className;
      button.style.cssText = knob.style.cssText;
      button.dataset.aurenneKnob = key;
      button.dataset.ownSkin = "";
      button.setAttribute("aria-label", controlNames[key]);
      button.title = controlNames[key];
      knob.replaceWith(button);
    });
  }

  function mount(target, type, { preview = false, assetBase = "./" } = {}) {
    const template = document.createElement("template");
    template.innerHTML = type === "preAurenne220" ? preChassis : powerChassis;
    const panel = template.content.firstElementChild;
    const wordmark = panel.querySelector("[data-wordmark]");
    if (wordmark) wordmark.src = assetBase + "assets/brands/aurenne-wordmark.svg";
    panel.querySelectorAll("[data-meter]").forEach(canvas => drawMeter(canvas));
    panel.querySelectorAll("[data-band]").forEach(renderRuler);
    fillLeverBanks(panel, preview);
    fillKnobs(panel, preview);
    fillPortBanks(panel, preview);
    target.classList.add("aurenne220");
    target.append(panel);
  }
  root.Aurenne220Panel = Object.freeze({ mount, drawMeter, frequency });
})(globalThis);
