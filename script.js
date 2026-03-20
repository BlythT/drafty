/*
LAYOUTS lets us manually specify the grid-template-areas
and player rotations manually for each player count.

Originally I just numbered evenly across top and bottom
e.g. p1 p2 p3 p7
     p4 p5 p6 p7

However I didn't like how the colours "jump around" when
switching to the next player count
e.g. p1 p2 p3 p4
     p5 p6 p7 p8

See above how p4 goes from bottom left to top right? This happens often.

Whereas you can preserve stable ordering if you do odds-on-top, evens-on-bottom
p1 p3
p2 p4
and so on, for stable colours.
Makes these layouts slightly less simple, but worth it for the end result.
*/
const LAYOUTS = {
    2: {
        landscape: {
            areas: `"p1 p2"`,
            cols: '1fr 1fr',
            rows: '1fr',
            players: {
                // left side
                p1: 'rotate-90',
                // right side
                p2: 'rotate-270',
            }
        },
        portrait: {
            areas: `"p1"
                    "p2"`,
            cols: '1fr',
            rows: '1fr 1fr',
            players: {
                // top row
                p1: 'rotate-180',
                // bottom row
                p2: '',
            }
        }
    },
    3: {
        landscape: {
            areas: `"p1 p3" 
                    "p2 p2"`,
            cols: '1fr 1fr',
            rows: '1fr 1fr',
            players: {
                // top row
                p1: 'rotate-180',
                p3: 'rotate-180',
                // bottom row
                p2: '',
            }
        },
        portrait: {
            areas: `"p1 p2"
                    "p3 p3"`,
            cols: '1fr 1fr',
            rows: '1fr 1fr',
            players: {
                // top row
                p1: 'rotate-90',
                p2: 'rotate-270',
                // bottom cap
                p3: '',
            }
        }
    },
    4: {
        landscape: {
            areas: `"p1 p3"
                    "p2 p4"`,
            cols: '1fr 1fr',
            rows: '1fr 1fr',
            players: {
                // top row
                p1: 'rotate-180',
                p3: 'rotate-180',
                // bottom row
                p2: '',
                p4: '',
            }
        },
        portrait: {
            areas: `"p1 p2"
                    "p3 p4"`,
            cols: '1fr 1fr',
            rows: '1fr 1fr',
            players: {
                // left column
                p1: 'rotate-90',
                p3: 'rotate-90',
                // right column
                p2: 'rotate-270',
                p4: 'rotate-270',
            }
        }
    },
    5: {
        landscape: {
            areas: `"p1 p3 p5"
                    "p2 p4 p5"`,
            cols: '1fr 1fr 1fr',
            rows: '1fr 1fr',
            players: {
                // top row
                p1: 'rotate-180',
                p3: 'rotate-180',
                // bottom row
                p2: '',
                p4: '',
                // end cap
                p5: 'rotate-270',
            }
        },
        portrait: {
            areas: `"p1 p2"
                    "p3 p4"
                    "p5 p5"`,
            cols: '1fr 1fr',
            rows: '1fr 1fr 1fr',
            players: {
                // left column
                p1: 'rotate-90',
                p3: 'rotate-90',
                // right column
                p2: 'rotate-270',
                p4: 'rotate-270',
                // bottom cap
                p5: '',
            }
        }
    },
    6: {
        landscape: {
            areas: `"p1 p3 p5"
                    "p2 p4 p6"`,
            cols: '1fr 1fr 1fr',
            rows: '1fr 1fr',
            players: {
                // top row
                p1: 'rotate-180',
                p3: 'rotate-180',
                p5: 'rotate-180',
                // bottom row
                p2: '',
                p4: '',
                p6: '',
            }
        },
        portrait: {
            areas: `"p1 p2"
                    "p3 p4"
                    "p5 p6"`,
            cols: '1fr 1fr',
            rows: '1fr 1fr 1fr',
            players: {
                // left column
                p1: 'rotate-90',
                p3: 'rotate-90',
                p5: 'rotate-90',
                // right column
                p2: 'rotate-270',
                p4: 'rotate-270',
                p6: 'rotate-270',
            }
        }
    },
    7: {
        landscape: {
            areas: `"p1 p3 p5 p7"
                    "p2 p4 p6 p7"`,
            cols: '1fr 1fr 1fr 1fr',
            rows: '1fr 1fr',
            players: {
                // top row
                p1: 'rotate-180',
                p3: 'rotate-180',
                p5: 'rotate-180',
                // bottom row
                p2: '',
                p4: '',
                p6: '',
                // end cap
                p7: 'rotate-270',
            }
        },
        portrait: {
            areas: `"p1 p2"
                    "p3 p4"
                    "p5 p6"
                    "p7 p7"`,
            cols: '1fr 1fr',
            rows: '1fr 1fr 1fr 1fr',
            players: {
                // left column
                p1: 'rotate-90',
                p3: 'rotate-90',
                p5: 'rotate-90',
                // right column
                p2: 'rotate-270',
                p4: 'rotate-270',
                p6: 'rotate-270',
                // bottom cap
                p7: '',
            }
        }
    },
    8: {
        landscape: {
            areas: `"p1 p3 p5 p7"
                    "p2 p4 p6 p8"`,
            cols: '1fr 1fr 1fr 1fr',
            rows: '1fr 1fr',
            players: {
                // top row
                p1: 'rotate-180',
                p3: 'rotate-180',
                p5: 'rotate-180',
                p7: 'rotate-180',
                // bottom row
                p2: '',
                p4: '',
                p6: '',
                p8: '',
            }
        },
        portrait: {
            areas: `"p1 p2"
                    "p3 p4"
                    "p5 p6"
                    "p7 p8"`,
            cols: '1fr 1fr',
            rows: '1fr 1fr 1fr 1fr',
            players: {
                // left column
                p1: 'rotate-90',
                p3: 'rotate-90',
                p5: 'rotate-90',
                p7: 'rotate-90',
                // right column
                p2: 'rotate-270',
                p4: 'rotate-270',
                p6: 'rotate-270',
                p8: 'rotate-270',
            }
        }
    },
    9: {
        landscape: {
            areas: `"p1 p3 p5 p7 p9"
                    "p2 p4 p6 p8 p9"`,
            cols: '1fr 1fr 1fr 1fr 1fr',
            rows: '1fr 1fr',
            players: {
                // top row
                p1: 'rotate-180',
                p3: 'rotate-180',
                p5: 'rotate-180',
                p7: 'rotate-180',
                // bottom row
                p2: '',
                p4: '',
                p6: '',
                p8: '',
                // end cap
                p9: 'rotate-270',
            }
        },
        portrait: {
            areas: `"p1 p2"
                    "p3 p4"
                    "p5 p6"
                    "p7 p8"
                    "p9 p9"`,
            cols: '1fr 1fr',
            rows: '1fr 1fr 1fr 1fr 1fr',
            players: {
                // left column
                p1: 'rotate-90',
                p3: 'rotate-90',
                p5: 'rotate-90',
                p7: 'rotate-90',
                // right column
                p2: 'rotate-270',
                p4: 'rotate-270',
                p6: 'rotate-270',
                p8: 'rotate-270',
                // bottom cap
                p9: '',
            }
        }
    },
    10: {
        landscape: {
            areas: `"p1 p3 p5 p7 p9"
                    "p2 p4 p6 p8 p10"`,
            cols: '1fr 1fr 1fr 1fr 1fr',
            rows: '1fr 1fr',
            players: {
                // top row
                p1: 'rotate-180',
                p3: 'rotate-180',
                p5: 'rotate-180',
                p7: 'rotate-180',
                p9: 'rotate-180',
                // bottom row
                p2: '',
                p4: '',
                p6: '',
                p8: '',
                p10: '',
            }
        },
        portrait: {
            areas: `"p1 p2"
                    "p3 p4"
                    "p5 p6"
                    "p7 p8"
                    "p9 p10"`,
            cols: '1fr 1fr',
            rows: '1fr 1fr 1fr 1fr 1fr',
            players: {
                // left column
                p1: 'rotate-90',
                p3: 'rotate-90',
                p5: 'rotate-90',
                p7: 'rotate-90',
                p9: 'rotate-90',
                // right column
                p2: 'rotate-270',
                p4: 'rotate-270',
                p6: 'rotate-270',
                p8: 'rotate-270',
                p10: 'rotate-270',
            }
        }
    },
};

const TIMER_DURATION = 60;
const MIN_PLAYERS = 2;
const MAX_PLAYERS = 10;

let playerCount = 8; // Draft usually has 8 players.

function applyLayout() {
    const container = document.querySelector('.container');  // add this
    const players = container.querySelectorAll('.player');   // add this

    const isPortrait = window.matchMedia("(orientation: portrait)").matches;
    const orientation = isPortrait ? 'portrait' : 'landscape';
    const layout = LAYOUTS[players.length][orientation];
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

function formatTime(seconds) {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
}

// Observable 10 palette by Observable, Inc.
// https://observablehq.com/blog/crafting-data-colors
//
// Preset colours array avoids "colour flicker" that the previous evenly-spaced
// oklab colour generator had
const PLAYER_COLORS = [
    { color: '#4269D0', name: 'blue' },
    { color: '#EFB118', name: 'yellow' },
    { color: '#FF725C', name: 'orange' },
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

function createPlayer(index, total) {
    const player = document.createElement('button');
    player.classList.add('player');
    player.style.setProperty('--player-color', getPlayerColor(index, total).color);

    const span = document.createElement('span');
    player.appendChild(span);

    let secondsLeft = TIMER_DURATION;
    let intervalId = null;
    let running = false;

    span.textContent = formatTime(secondsLeft);

    player.addEventListener('click', () => {
        player.classList.toggle('player--active', !running);

        if (running) {
            clearInterval(intervalId);
            running = false;
        } else {
            if (secondsLeft === 0) {
                secondsLeft = TIMER_DURATION;
                span.textContent = formatTime(secondsLeft);
            }
            intervalId = setInterval(() => {
                secondsLeft--;
                span.textContent = formatTime(secondsLeft);
                if (secondsLeft <= 0) {
                    clearInterval(intervalId);
                    running = false;
                    player.classList.remove('player--active');
                    span.textContent = '00:00';
                }
            }, 1000);
            running = true;
        }
    });

    return player;
}

function syncPlayers() {
    const container = document.querySelector('.container');
    const players = container.querySelectorAll('.player');

    if (players.length < playerCount) {
        for (let i = players.length; i < playerCount; i++) {
            container.appendChild(createPlayer(i, playerCount));
        }
    } else if (players.length > playerCount) {
        for (let i = players.length; i > playerCount; i--) {
            players[i - 1].remove();
        }
    }

    // Recalculate colours for all players when count changes
    container.querySelectorAll('.player').forEach((player, i) => {
        player.style.setProperty('--player-color', getPlayerColor(i, playerCount).color);
    });

    applyLayout();
}

document.addEventListener('DOMContentLoaded', () => {
    const container = document.querySelector('.container');

    container.querySelectorAll('.player').forEach(player => player.remove());

    const addBtn = document.querySelector('#add-player');
    const removeBtn = document.querySelector('#remove-player');

    addBtn.addEventListener('click', () => {
        if (playerCount < MAX_PLAYERS) {
            playerCount++;
            syncPlayers();
        }
    });

    removeBtn.addEventListener('click', () => {
        if (playerCount > MIN_PLAYERS) {
            playerCount--;
            syncPlayers();
        }
    });

    syncPlayers();

    let currentDir = 'cw';

    // Draft direction arrow border on controls
    const BORDER_SPEED = 80;
    const border = AnimateBorder(document.getElementById('controls'),
        {
            color: 'black',
            strokeWidth: 15,
            segments: 3,
            gap: 160,
            segmentCap: 'butt',
            arrowCap: 'butt',
            arrowStyle: 'full',
            arrowSize: 30,
            speed: BORDER_SPEED,
        });

    document.getElementById('reverse-direction').addEventListener('click', () => {
        currentDir = currentDir === 'cw' ? 'ccw' : 'cw';
        border.setDirection(currentDir);
    });

    let running = true;

    document.getElementById('start-stop-direction').addEventListener('click', () => {
        running = !running;
        border.setSpeed(running ? BORDER_SPEED : 0);
    });

    window.matchMedia("(orientation: portrait)").addEventListener('change', applyLayout);
});