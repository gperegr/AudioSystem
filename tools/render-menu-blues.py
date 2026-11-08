#!/usr/bin/env python3
"""SPDX-License-Identifier: CC0-1.0
Original 12-bar A blues. Offline synthesis only; the app plays a single cached MP3.
Requires numpy, scipy and ffmpeg. No samples or soundfonts are used.
"""
from pathlib import Path
import subprocess
import tempfile
import numpy as np
from scipy.signal import butter, sosfilt
from scipy.io.wavfile import write

SR = 44100
BPM = 76
BEAT = 60 / BPM
BAR = BEAT * 4
N = round(12 * BAR * SR)
rng = np.random.default_rng(20261108)
mix = np.zeros((N, 2), dtype=np.float64)


def add(sound, at, pan=0):
    start = round(at * SR) % N
    stereo = sound[:, None] * np.array([np.sqrt((1-pan)/2), np.sqrt((1+pan)/2)])
    first = min(len(sound), N-start)
    mix[start:start+first] += stereo[:first]
    if first < len(sound):
        mix[:len(sound)-first] += stereo[first:]


def pluck(note, length, velocity, bass=False):
    t = np.arange(round(length * SR)) / SR
    f = 440 * 2 ** ((note-69)/12)
    vibrato = 1 + .0016 * np.sin(2*np.pi*4.6*t) * np.minimum(1, t/.25)
    phase = 2*np.pi*f*np.cumsum(vibrato)/SR
    sound = np.zeros(len(t))
    for k in range(1, 6 if bass else 13):
        amplitude = 1 / k ** (1.65 if bass else 1.95)
        decay = np.exp(-t*(1+.27*(k-1))/(length*(.65 if bass else .58)))
        sound += amplitude * np.sin(phase*k*np.sqrt(1+.000018*k*k)) * decay
    pick = sosfilt(butter(1, 1800, fs=SR, output='sos'), rng.normal(0, 1, len(t)))
    sound += pick * (.025 if bass else .018) * np.exp(-t/ .016)
    envelope = (1-np.exp(-t/(.010 if bass else .004))) * np.clip((length-t)/.065, 0, 1)
    return sound * envelope * velocity


def piano(note, length, velocity):
    t = np.arange(round(length * SR)) / SR
    phase = 2*np.pi*440*2**((note-69)/12)*t
    sound = np.sin(phase + .65*np.sin(2*phase)*np.exp(-t/.16))
    sound += .12*np.sin(3*phase)*np.exp(-t/.25)
    return sound*(1-np.exp(-t/.008))*np.exp(-t/.60)*np.clip((length-t)/.12,0,1)*velocity


def brush(length, velocity, snare=False):
    t = np.arange(round(length*SR))/SR
    sound = sosfilt(butter(2, [900, 6500], btype='bandpass', fs=SR, output='sos'), rng.normal(0,1,len(t)))
    env = (1-np.exp(-t/.003))*np.exp(-t/(.046 if snare else .018))*np.clip((length-t)/.015,0,1)
    return sound*env*velocity


roots = [33,33,33,33,38,38,33,33,40,38,33,40]
voicings = {33:[55,61,64,71],38:[54,60,64,69],40:[56,62,66,71]}
for bar, root in enumerate(roots):
    for beat, interval in enumerate([0,7,9,10] if bar != 11 else [0,7,6,7]):
        add(pluck(root+interval, BEAT*1.09, .54+rng.uniform(-.025,.025), True), bar*BAR+beat*BEAT+rng.uniform(.001,.008))
    for beat in [.64,2.64]:
        for string, note in enumerate(voicings[root]):
            add(piano(note, BEAT*1.4, .090+rng.uniform(-.008,.008)), bar*BAR+beat*BEAT+string*.012, -.26)
    for beat in range(4):
        for off, level in [(0,.036),(.63,.024)]:
            add(brush(.11,level),bar*BAR+(beat+off)*BEAT,.28 if off else -.24)
        if beat in [1,3]:
            add(brush(.22,.075,True),bar*BAR+beat*BEAT+.012,.1)
        if beat in [0,2]:
            t=np.arange(round(.15*SR))/SR
            add(np.sin(2*np.pi*(51*t+1.3*(1-np.exp(-t*35))))*np.exp(-t*30)*.12,bar*BAR+beat*BEAT)

# Relaxed call-and-response phrases, leaving space for the rhythm section.
phrases = [
 [(1,64,.62),(1.64,60,.28),(2,62,.50),(2.64,63,.22),(3,64,.75)],
 [(1.64,57,.30),(2,60,.40),(2.64,61,.28),(3,64,.65)],
 [(0.64,67,.45),(1.64,64,.45),(2.64,62,.32),(3.1,60,.70)],
 [(2.64,57,.35),(3.3,60,.42)],
 [(0.64,69,.65),(1.64,67,.34),(2,64,.5),(2.64,62,.30),(3.2,64,.65)],
 [(1,66,.60),(2,62,.45),(2.64,60,.28),(3,57,.70)],
 [(0.64,64,.65),(1.64,67,.35),(2.64,69,.9)],
 [(2,64,.45),(2.64,62,.30),(3.2,60,.65)],
 [(0.64,71,.55),(1.64,69,.30),(2,68,.45),(2.64,67,.28),(3,64,.8)],
 [(0.64,66,.5),(1.64,64,.32),(2,62,.45),(2.64,60,.32),(3.2,57,.6)],
 [(0.64,60,.35),(1,61,.40),(1.64,64,.65),(2.64,69,.9)],
 [(0.64,64,.40),(1.3,62,.32),(2,61,.32),(2.64,60,.3),(3,59,.3),(3.64,52,.28)]
]
for bar, notes in enumerate(phrases):
    for beat, pitch, duration in notes:
        add(pluck(pitch,duration*BEAT+.12,.26+rng.uniform(-.025,.025)),bar*BAR+beat*BEAT+.012,.13)

# Circular room reflections preserve tails across the loop boundary, without a fade gap.
dry = mix.copy()
room = sosfilt(butter(2,2600,fs=SR,output='sos'),dry,axis=0)
for delay, level in [(.047,.09),(.081,.065),(.137,.045),(.211,.024)]:
    mix[:,0] += np.roll(room[:,1],round(delay*SR))*level
    mix[:,1] += np.roll(room[:,0],round((delay+.013)*SR))*level
mix -= mix.mean(axis=0)
mix = np.tanh(mix*1.18)
mix *= .80/np.max(np.abs(mix))
out = Path(__file__).resolve().parents[1]/'assets/audio/menu-blues.mp3'
with tempfile.TemporaryDirectory() as folder:
    wav=Path(folder)/'menu-blues.wav'
    write(wav,SR,(mix*32767).astype(np.int16))
    subprocess.run(['ffmpeg','-v','error','-y','-i',str(wav),'-codec:a','libmp3lame','-b:a','96k','-write_xing','1','-metadata','title=Menu Blues','-metadata','artist=Audio Lab','-metadata','copyright=CC0-1.0','-metadata','comment=https://creativecommons.org/publicdomain/zero/1.0/',str(out)],check=True)
print(f'{out}: {N/SR:.3f}s, {out.stat().st_size} bytes, RMS {np.sqrt(np.mean(mix**2)):.4f}')
