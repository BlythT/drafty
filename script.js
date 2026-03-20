const LAYOUTS = {
    2: {
        areas: '"p1 p2"',
        cols: '1fr 1fr',
        rows: '1fr'
    },
    4: {
        areas: '"p1 p2" "p3 p4"',
        cols: '1fr 1fr',
        rows: '1fr 1fr'
    },
    5: {
        areas: '"p1 p2 p5" "p3 p4 p5"',
        cols: '1fr 1fr 1fr',
        rows: '1fr 1fr'
    },
    6: {
        areas: '"p1 p2 p5" "p3 p4 p6"',
        cols: '1fr 1fr 1fr',
        rows: '1fr 1fr'
    },
    7: {
        areas: '"p1 p2 p5 p7" "p3 p4 p6 p7"',
        cols: '1fr 1fr 1fr 1fr',
        rows: '1fr 1fr'
    },
    8: {
        areas: '"p1 p2 p5 p6" "p3 p4 p7 p8"',
        cols: '1fr 1fr 1fr 1fr',
        rows: '1fr 1fr'
    },
};

const ROTATIONS = {
    2: { p1: 180, p2: 0 },
    3: { p1: 180, p2: 0, p3: 0 },
    4: { p1: 180, p2: 180, p3: 0, p4: 0 },
    5: { p1: 180, p2: 180, p3: 0, p4: 0, p5: 270 },
    6: { p1: 180, p2: 180, p3: 0, p4: 0, p5: 270, p6: 90 },
    7: { p1: 180, p2: 180, p3: 0, p4: 0, p5: 270, p6: 270, p7: 90 },
    8: { p1: 180, p2: 180, p3: 0, p4: 0, p5: 270, p6: 270, p7: 90, p8: 90 },
};

const TIMER_DURATION = 60;
const MIN_PLAYERS = 2;
const MAX_PLAYERS = 8;

let playerCount = 4;

function applyLayout() {
    const container = document.querySelector('.container');
    const players = container.querySelectorAll('.player');

    players.forEach((player, index) => {
        player.style.gridArea = `p${index + 1}`;
    });

    players.forEach((player, index) => {
        const key = `p${index + 1}`;
        const rotation = ROTATIONS[players.length]?.[key] ?? 0;
        player.querySelector('span').style.transform = `rotate(${rotation}deg)`;
    });

    const layout = LAYOUTS[players.length];
    if (!layout) return;

    container.style.gridTemplateAreas = layout.areas;
    container.style.gridTemplateColumns = layout.cols;
    container.style.gridTemplateRows = layout.rows;
}

function formatTime(seconds) {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
}

function getPlayerColor(index, total) {
    const hue = (index / total) * 360;
    return `oklch(60% 0.18 ${hue}deg)`;
}

function createPlayer(index, total) {
    const player = document.createElement('button');
    player.classList.add('player');
    player.style.setProperty('--player-color', getPlayerColor(index, total));

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
    player.style.setProperty('--player-color', getPlayerColor(i, playerCount));
  });

  applyLayout();
}

document.addEventListener('DOMContentLoaded', () => {
    const container = document.querySelector('.container');

    container.querySelectorAll('.player').forEach(player => player.remove());

    const [addBtn, removeBtn] = document.querySelectorAll('#controls button');

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
});