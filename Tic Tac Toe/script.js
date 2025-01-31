const container = document.querySelector('.grid-container');
const resetButton = document.querySelector('#reset');
const backButton = document.querySelector('#back');
const resetContainer = document.querySelector('.reset-container');
const statusMessage = document.querySelector('.game-status');
const modeSelection = document.querySelector('.mode-selection');
const nameInputSection = document.querySelector('.name-input');
const player1NameInput = document.querySelector('#player1-name');
const player2NameInput = document.querySelector('#player2-name');
const startGameButton = document.querySelector('#start-game');
const namePrompt = document.querySelector('#name-prompt');

let currentPlayer = 'X';
let gameActive = false;
let aiEnabled = false;
let player1Name = '';
let player2Name = 'Bot'; // Default name for AI bot
const winConditions = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6]
];

// Initialize the grid
function initializeGrid() {
    container.innerHTML = '';
    for (let i = 0; i < 9; i++) {
        let cell = document.createElement('div');
        cell.classList.add('grid-item');
        cell.dataset.index = i;
        container.appendChild(cell);
    }
}

// Event listeners for game modes
document.getElementById('2-player').addEventListener('click', () => {
    aiEnabled = false;
    promptForNames();
});

document.getElementById('ai-bot').addEventListener('click', () => {
    aiEnabled = true;
    promptForNames();
});

// Prompt for player names based on game mode
function promptForNames() {
    modeSelection.style.display = 'none';
    nameInputSection.style.display = 'flex';

    if (aiEnabled) {
        namePrompt.textContent = 'Enter your name to play against the Bot:';
        player2NameInput.style.display = 'none';
        player1NameInput.placeholder = 'Enter Your Name';
    } else {
        namePrompt.textContent = 'Enter the names for both players:';
        player2NameInput.style.display = 'block';
        player1NameInput.placeholder = 'Enter Player 1 Name';
    }
}

// Start the game after entering names
startGameButton.addEventListener('click', () => {
    player1Name = player1NameInput.value.trim();
    player2Name = aiEnabled ? 'Bot' : player2NameInput.value.trim();

    if (!player1Name || (!aiEnabled && !player2Name)) {
        alert('Please enter valid names for all players!');
        return;
    }

    startGame();
});

// Start the game
function startGame() {
    gameActive = true;
    currentPlayer = 'X';
    statusMessage.textContent = `${player1Name}'s turn`;
    nameInputSection.style.display = 'none';
    container.style.display = 'grid';
    resetContainer.style.display = 'flex';
    initializeGrid();
}

// Event listener for grid clicks
container.addEventListener('click', (event) => {
    const clickedCell = event.target;

    if (clickedCell.classList.contains('grid-item') && gameActive && clickedCell.textContent === '') {
        playerMove(clickedCell);
        if (gameActive && aiEnabled && currentPlayer === 'O') {
            setTimeout(aiMove, 500);
        }
    }
});

// Event listener for Reset button
resetButton.addEventListener('click', resetGame);

// Event listener for Back button
backButton.addEventListener('click', () => {
    resetGame();
    modeSelection.style.display = 'flex';
    container.style.display = 'none';
    resetContainer.style.display = 'none';
    statusMessage.textContent = '';
    player1NameInput.value = '';
    player2NameInput.value = '';
    nameInputSection.style.display = 'none';
});

// Player move
function playerMove(cell) {
    cell.textContent = currentPlayer;
    if (checkWinner()) {
        gameActive = false;
        highlightWinningCells();
        statusMessage.textContent = `${currentPlayer === 'X' ? player1Name : player2Name} has won!`;
    } else if (Array.from(container.children).every(cell => cell.textContent !== '')) {
        statusMessage.textContent = 'Game Draw!';
        gameActive = false;
    } else {
        currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
        statusMessage.textContent = `${currentPlayer === 'X' ? player1Name : player2Name}'s turn`;
    }
}

// AI move using Minimax algorithm
function aiMove() {
    if (!gameActive) return;

    const bestMove = findBestMove();
    const bestCell = container.children[bestMove];
    playerMove(bestCell);
}

// Minimax Algorithm Implementation
function findBestMove() {
    const board = Array.from(container.children).map(cell => cell.textContent);
    let bestScore = -Infinity;
    let move;

    for (let i = 0; i < board.length; i++) {
        if (board[i] === '') {
            board[i] = 'O'; // AI's move
            const score = minimax(board, 0, false);
            board[i] = ''; // Undo the move
            if (score > bestScore) {
                bestScore = score;
                move = i;
            }
        }
    }
    return move;
}

function minimax(board, depth, isMaximizing) {
    if (checkWin('O', board)) return 10 - depth; // AI wins
    if (checkWin('X', board)) return depth - 10; // Player wins
    if (board.every(cell => cell !== '')) return 0; // Draw

    if (isMaximizing) {
        let bestScore = -Infinity;
        for (let i = 0; i < board.length; i++) {
            if (board[i] === '') {
                board[i] = 'O';
                const score = minimax(board, depth + 1, false);
                board[i] = '';
                bestScore = Math.max(score, bestScore);
            }
        }
        return bestScore;
    } else {
        let bestScore = Infinity;
        for (let i = 0; i < board.length; i++) {
            if (board[i] === '') {
                board[i] = 'X';
                const score = minimax(board, depth + 1, true);
                board[i] = '';
                bestScore = Math.min(score, bestScore);
            }
        }
        return bestScore;
    }
}

// Check for a winner
function checkWinner() {
    const cells = document.querySelectorAll('.grid-item');
    for (let i = 0; i < winConditions.length; i++) {
        const [a, b, c] = winConditions[i];
        if (cells[a].textContent && cells[a].textContent === cells[b].textContent && cells[a].textContent === cells[c].textContent) {
            return true;
        }
    }
    return false;
}

// Check if a specific player has won on a given board
function checkWin(player, board) {
    return winConditions.some(condition => {
        return condition.every(index => board[index] === player);
    });
}

// Highlight winning cells
function highlightWinningCells() {
    const cells = document.querySelectorAll('.grid-item');
    for (let i = 0; i < winConditions.length; i++) {
        const [a, b, c] = winConditions[i];
        if (cells[a].textContent && cells[a].textContent === cells[b].textContent && cells[a].textContent === cells[c].textContent) {
            cells[a].classList.add('winning-cell');
            cells[b].classList.add('winning-cell');
            cells[c].classList.add('winning-cell');
        }
    }
}

// Reset game
function resetGame() {
    gameActive = true;
    currentPlayer = 'X';
    statusMessage.textContent = `${player1Name}'s turn`;
    initializeGrid();
}
