import { LAYOUTS } from './layouts.js';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const MIN_PLAYERS = 2;
const MAX_PLAYERS = 10;
const BORDER_SPEED = 80;

// ---------------------------------------------------------------------------
// State machine
// ---------------------------------------------------------------------------

const State = {
    SETUP: 'setup',
    READY: 'ready',
    DRAFTING: 'drafting',
};

let appState = State.SETUP;
let roundNumber = 0;
let borderDirection = 'cw';

const CenterControlMode = {
    COMPACT: 'compact',
    FULL: 'full',
};

/** Indices of players who have tapped their button this round. */
let activatedThisRound = new Set();

function updateCenterControl(state) {
    const centerControl = document.getElementById('center-control');
    const primary = document.getElementById('center-control-primary');
    const secondary = document.getElementById('center-control-secondary');
    const overlay = document.querySelector('.overlay');

    centerControl.disabled = state === State.DRAFTING;

    const mode = state === State.SETUP ? CenterControlMode.COMPACT : CenterControlMode.FULL;
    setCenterControlMode(mode, {
        wrapSecondary: state === State.DRAFTING,
    });
    overlay.classList.toggle('divider-hidden', mode === CenterControlMode.FULL);

    if (state === State.SETUP) {
        primary.textContent = String(playerCount);
        secondary.textContent = 'Confirm';
        centerControl.setAttribute('aria-label', `Confirm ${playerCount} players`);
        return;
    }

    if (state === State.READY) {
        primary.textContent = 'Start';
        secondary.textContent = 'Draft';
        centerControl.setAttribute('aria-label', 'Start draft');
        return;
    }

    primary.textContent = `ROUND ${roundNumber}`;
    secondary.textContent = 'Tap Your Square When Done';
    centerControl.setAttribute('aria-label', `Round ${roundNumber}`);
}

function setCenterControlMode(mode, options = {}) {
    const centerControl = document.getElementById('center-control');

    centerControl.classList.toggle('is-compact', mode === CenterControlMode.COMPACT);
    centerControl.classList.toggle('is-full', mode === CenterControlMode.FULL);
    centerControl.classList.toggle('wrap-secondary', Boolean(options.wrapSecondary));
}

/**
 * Transition to a new state. Swaps the visible control panel and runs any
 * entry logic for the incoming state.
 */
function setState(next) {
    document.getElementById('setup-buttons').hidden = next !== State.SETUP;

    appState = next;

    const disablePlayers = () =>
        document.querySelectorAll('.player').forEach(p => p.disabled = true);
    const enablePlayers = () =>
        document.querySelectorAll('.player').forEach(p => p.disabled = false);

    switch (next) {
        case State.SETUP:
            border.setSpeed(0);
            disablePlayers();
            updateCenterControl(next);
            break;

        case State.READY:
            border.setSpeed(0);
            disablePlayers();
            updateCenterControl(next);
            break;

        case State.DRAFTING: {
            roundNumber++;
            activatedThisRound = new Set();
            resetPlayerRounds();
            enablePlayers();

            // Direction alternates: odd rounds CW, even rounds CCW.
            const dir = roundNumber % 2 === 1 ? 'cw' : 'ccw';
            borderDirection = dir;
            syncBorderState();
            updateCenterControl(next);
            break;
        }
    }
}

/**
 * Called by each player button when it is first activated during a drafting
 * round. Once every player has tapped, the round ends.
 */
function onPlayerActivated(playerIndex) {
    if (appState !== State.DRAFTING) return;

    activatedThisRound.add(playerIndex);

    if (activatedThisRound.size >= playerCount) {
        // Brief pause so the last player can see their timer start.
        setTimeout(() => setState(State.READY), 600);
    }
}

// ---------------------------------------------------------------------------
// Player count
// ---------------------------------------------------------------------------

let playerCount = 8;

function updatePlayerCountDisplay() {
    if (appState === State.SETUP) {
        updateCenterControl(State.SETUP);
    }
}

// ---------------------------------------------------------------------------
// Layout
// ---------------------------------------------------------------------------

function applyLayout() {
    const container = document.querySelector('.container');
    const players = container.querySelectorAll('.player');

    const isPortrait = window.matchMedia('(orientation: portrait)').matches;
    const orientation = isPortrait ? 'portrait' : 'landscape';
    const layout = LAYOUTS[players.length]?.[orientation];
    if (!layout) return;

    const allRotations = ['rotate-90', 'rotate-180', 'rotate-270'];

    players.forEach((player, index) => {
        const key = `p${index + 1}`;
        player.style.gridArea = key;
        const rotationClass = layout.players[key] ?? '';
        const span = player.querySelector('span');
        span.classList.remove(...allRotations);
        if (rotationClass) span.classList.add(rotationClass);
    });

    container.style.gridTemplateAreas = layout.areas;
    container.style.gridTemplateColumns = layout.cols;
    container.style.gridTemplateRows = layout.rows;
}

// ---------------------------------------------------------------------------
// Player colours  (Observable 10 palette)
// https://observablehq.com/blog/crafting-data-colors
// ---------------------------------------------------------------------------

const PLAYER_COLORS = [
    { color: '#4269D0', name: 'blue' },
    { color: '#FF725C', name: 'orange' },
    { color: '#EFB118', name: 'yellow' },
    { color: '#6CC5B0', name: 'teal' },
    { color: '#3CA951', name: 'green' },
    { color: '#FF8AB7', name: 'pink' },
    { color: '#A463F2', name: 'purple' },
    { color: '#97BBF5', name: 'light blue' },
    { color: '#9C6B4E', name: 'brown' },
    { color: '#9498A0', name: 'gray' },
];

function getPlayerColor(index) {
    return PLAYER_COLORS[index % PLAYER_COLORS.length];
}

// ---------------------------------------------------------------------------
// Player creation
// ---------------------------------------------------------------------------

function createPlayer(index) {
    const player = document.createElement('button');
    player.classList.add('player');
    player.dataset.playerIndex = index;
    player.style.setProperty('--player-color', getPlayerColor(index).color);

    const span = document.createElement('span');
    span.textContent = `P${index + 1}`;
    span.classList.add('player-label');
    player.appendChild(span);

    let activated = false;

    player.addEventListener('click', () => {
        if (activated) return;
        activated = true;
        player.classList.add('player--active');
        span.textContent = 'DONE';
        onPlayerActivated(Number(player.dataset.playerIndex));
    });

    player.resetRound = () => {
        activated = false;
        player.classList.remove('player--active');
        span.textContent = `P${player.dataset.playerIndex * 1 + 1}`;
    };

    return player;
}

// ---------------------------------------------------------------------------
// Player sync
// ---------------------------------------------------------------------------

function syncPlayers() {
    const container = document.querySelector('.container');
    const players = container.querySelectorAll('.player');

    if (players.length < playerCount) {
        for (let i = players.length; i < playerCount; i++) {
            container.appendChild(createPlayer(i));
        }
    } else if (players.length > playerCount) {
        for (let i = players.length; i > playerCount; i--) {
            players[i - 1].remove();
        }
    }

    // Keep indices and colours in sync after additions/removals.
    container.querySelectorAll('.player').forEach((player, i) => {
        player.dataset.playerIndex = i;
        player.style.setProperty('--player-color', getPlayerColor(i).color);
        player.disabled = appState !== State.DRAFTING;
        // Keep the label current unless the player is already activated
        if (!player.classList.contains('player--active')) {
            player.querySelector('.player-label').textContent = `P${i + 1}`;
        }
    });

    applyLayout();
}

/** Reset per-round activation flags on all current players. */
function resetPlayerRounds() {
    document.querySelectorAll('.player').forEach(p => p.resetRound?.());
}

// ---------------------------------------------------------------------------
// Border animation (assigned after DOMContentLoaded)
// ---------------------------------------------------------------------------

let border;

function readCssNumber(name) {
    const probe = document.createElement('div');
    probe.style.position = 'absolute';
    probe.style.visibility = 'hidden';
    probe.style.pointerEvents = 'none';
    probe.style.width = `var(${name})`;

    const host = document.getElementById('controls-wrapper');
    host.appendChild(probe);
    const value = probe.getBoundingClientRect().width;
    probe.remove();

    return value;
}

function syncBorderState() {
    if (!border) return;

    if (appState === State.DRAFTING) {
        border.setDirection(borderDirection);
        border.setSpeed(BORDER_SPEED);
        return;
    }

    border.setSpeed(0);
}

function rebuildBorder() {
    border?.destroy();
    const rootStyle = getComputedStyle(document.documentElement);
    border = AnimateBorder(
        document.getElementById('controls-wrapper'),
        {
            color: 'white',
            arrowOutlineColor: rootStyle.getPropertyValue('--color-bg').trim(),
            strokeWidth: readCssNumber('--border-stroke-width'),
            segments: 1,
            gap: readCssNumber('--border-gap'),
            segmentCap: 'round',
            arrowCap: 'butt',
            arrowStyle: 'outlined',
            arrowSize: readCssNumber('--border-arrow-size'),
            speed: 0,
        },
    );
    syncBorderState();
}

// ---------------------------------------------------------------------------
// Boot
// ---------------------------------------------------------------------------

document.addEventListener('DOMContentLoaded', () => {
    const container = document.querySelector('.container');

    // Clear any server-rendered players.
    container.querySelectorAll('.player').forEach(p => p.remove());

    // Initial player count display.
    updatePlayerCountDisplay();

    // --- Setup state controls ---

    document.getElementById('add-player').addEventListener('click', () => {
        if (playerCount < MAX_PLAYERS) {
            playerCount++;
            updatePlayerCountDisplay();
            syncPlayers();
        }
    });

    document.getElementById('remove-player').addEventListener('click', () => {
        if (playerCount > MIN_PLAYERS) {
            playerCount--;
            updatePlayerCountDisplay();
            syncPlayers();
        }
    });

    document.getElementById('center-control').addEventListener('click', () => {
        if (appState === State.SETUP) {
            setState(State.READY);
        } else if (appState === State.READY) {
            setState(State.DRAFTING);
        }
    });

    // --- Border animation ---

    rebuildBorder();

    // --- Orientation change ---

    window.matchMedia('(orientation: portrait)').addEventListener('change', () => {
        applyLayout();
        rebuildBorder();
    });
    window.addEventListener('resize', rebuildBorder);

    // --- Initial render ---

    syncPlayers();
    setState(State.SETUP);
});
