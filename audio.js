let audioContext = null;
let audioReadyPromise = null;

function getAudioContext() {
    if (audioContext) return audioContext;

    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) {
        return null;
    }

    audioContext = new AudioContextClass();
    return audioContext;
}

export async function ensureAudioReady() {
    const context = getAudioContext();
    if (!context) return false;

    if (context.state === 'running') {
        return true;
    }

    if (!audioReadyPromise) {
        audioReadyPromise = context.resume().finally(() => {
            audioReadyPromise = null;
        });
    }

    await audioReadyPromise;
    return context.state === 'running';
}

let _reverb = null;

function getReverb(context) {
    if (_reverb) return _reverb;

    const length = context.sampleRate * 1.5;
    const impulse = context.createBuffer(2, length, context.sampleRate);
    for (let ch = 0; ch < 2; ch++) {
        const data = impulse.getChannelData(ch);
        for (let i = 0; i < length; i++) {
            data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, 2.5);
        }
    }

    const convolver = context.createConvolver();
    convolver.buffer = impulse;

    const wet = context.createGain();
    const dry = context.createGain();
    wet.gain.value = 0.2;
    dry.gain.value = 0.8;

    _reverb = {
        connect(source, destination) {
            source.connect(dry);
            source.connect(convolver);
            convolver.connect(wet);
            dry.connect(destination);
            wet.connect(destination);
        },
    };

    return _reverb;
}

function playSinePad({
    start = 0,
    frequency = 440,
    volume = 0.38,
    attack = 0.01,
    decay = 0.25,
    release = 0.2,
    filterFrequency = 4000,
} = {}) {
    const context = getAudioContext();
    if (!context || context.state !== 'running') return;

    const startTime = context.currentTime + start;

    function playLayer(freq, vol, att, dec, rel) {
        const osc = context.createOscillator();
        const gain = context.createGain();
        const filter = context.createBiquadFilter();

        osc.type = 'sine';
        osc.frequency.value = freq;

        filter.type = 'lowpass';
        filter.frequency.value = filterFrequency;
        filter.Q.value = 0.7;

        gain.gain.cancelScheduledValues(startTime);
        gain.gain.setValueAtTime(0.0001, startTime);
        gain.gain.linearRampToValueAtTime(vol, startTime + att);
        gain.gain.exponentialRampToValueAtTime(0.0001, startTime + att + dec + rel);

        osc.connect(filter);
        filter.connect(gain);
        getReverb(context).connect(gain, context.destination);

        osc.start(startTime);
        osc.stop(startTime + att + dec + rel + 0.05);
    }

    // Root note
    playLayer(frequency, volume, attack, decay, release);
    // Quiet octave shimmer
    playLayer(frequency * 2, volume * 0.18, attack * 1.5, decay * 0.6, release * 0.6);
}

async function withReady(callback) {
    const ready = await ensureAudioReady();
    if (!ready) return false;
    callback();
    return true;
}

export async function playRoundSinePad() {
    return withReady(() => {
        [523, 659, 784, 1047].forEach((freq, i) => {
            playSinePad({ start: i * 0.1, frequency: freq, volume: 0.36, decay: 0.25, release: 0.2 });
        });
    });
}

function getSinePadCountdownStep(step) {
    const freq = step === 1 ? 659 : 440;
    const volume = step === 1 ? 0.42 : 0.34;
    const attack = 0.01;
    const decay = 0.25;
    const release = 0.2;
    return { frequency: freq, volume, attack, decay, release, filterFrequency: 4000 };
}

export async function playCountdownSinePadBeep(step) {
    return withReady(() => {
        playSinePad(getSinePadCountdownStep(step));
    });
}

function runCountdownSequence(beepPlayer) {
    beepPlayer(3);
    window.setTimeout(() => beepPlayer(2), 1000);
    window.setTimeout(() => beepPlayer(1), 2000);
}

export async function playCountdownSinePadSequence() {
    const ready = await ensureAudioReady();
    if (!ready) return false;
    runCountdownSequence(playCountdownSinePadBeep);
    return true;
}

export async function playDirectionChangeSinePad() {
    return withReady(() => {
        [523, 659, 1047].forEach((freq, i) => {
            playSinePad({ start: i * 0.15, frequency: freq });
        });
    });
}

let urgencyIntervalId = null;
let urgencyStartTime = 0;

export async function startUrgencyAudio() {
    if (urgencyIntervalId) return true; // Already running

    return withReady(() => {
        const context = getAudioContext();
        if (!context) return;

        urgencyStartTime = context.currentTime;
        let tickCounter = 0;

        urgencyIntervalId = window.setInterval(() => {
            const timeActive = context.currentTime - urgencyStartTime;

            const baseNote = 659;
            const alertNote = 698;
            const currentPitch = (tickCounter % 2 === 0) ? baseNote : alertNote;

            // Gradually swells from a quiet 0.04 to 0.35 ceiling
            const volumeSwell = Math.min(0.04 + (timeActive * 0.018), 0.35);

            const pendulumConfig = {
                frequency: currentPitch,
                volume: volumeSwell,
                attack: 0.05,
                decay: 0.20,
                release: 0.20,
                filterFrequency: 3000
            };

            playSinePad({ ...pendulumConfig, start: 0 });

            tickCounter++;
        }, 800); // Every 800ms for a steady, heartbeat-like rhythm
    });
}

export function stopUrgencyAudio() {
    if (urgencyIntervalId) {
        window.clearInterval(urgencyIntervalId);
        urgencyIntervalId = null;
    }

    urgencyStartTime = 0;
}

export function playTapGlassBead(playerProgressIndex, totalPlayers) {
    const context = getAudioContext();
    if (!context) return;

    // Midi notes 60 (C4) to 72 (C5).
    const floorMidi = 60;
    const ceilingMidi = 72;
    const midiRange = ceilingMidi - floorMidi;

    // Interpolate the MIDI note based on player progress, ensuring it scales with player count.
    const steps = Math.max(1, totalPlayers - 1);
    const exactMidiNote = floorMidi + (midiRange * (playerProgressIndex / steps));

    const targetMidi = Math.round(exactMidiNote);

    // Convert the MIDI note back to an exact acoustic frequency: 440 * 2^((note - 69) / 12)
    const fundamental = 440 * Math.pow(2, (targetMidi - 69) / 12);
    const now = context.currentTime;

    const components = [
        { freq: fundamental, vol: 0.14, decay: 0.07 },
        { freq: fundamental * 2.00, vol: 0.08, decay: 0.04 },
        { freq: fundamental * 3.00, vol: 0.04, decay: 0.02 }
    ];

    components.forEach(comp => {
        const osc = context.createOscillator();
        const gainNode = context.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(comp.freq, now);

        gainNode.gain.setValueAtTime(0, now);
        gainNode.gain.linearRampToValueAtTime(comp.vol, now + 0.001);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, now + comp.decay);

        osc.connect(gainNode);
        gainNode.connect(context.destination);

        osc.start(now);
        osc.stop(now + comp.decay + 0.02);
    });
}