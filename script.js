document.addEventListener('DOMContentLoaded', () => {
    // Game elements
    const board = document.getElementById('board');
    const cells = document.querySelectorAll('.cell');
    const playerScoreEl = document.getElementById('player-score');
    const aiScoreEl = document.getElementById('ai-score');
    const statusMessage = document.getElementById('status-message');
    const playAgainBtn = document.getElementById('play-again');
    const timerEl = document.getElementById('timer');
    const soundToggle = document.getElementById('sound-toggle');
    const startButton = document.getElementById('start-button');
    
    // Audio elements
    const clickSound = document.getElementById('click-sound');
    const winSound = document.getElementById('win-sound');
    const loseSound = document.getElementById('lose-sound');
    const drawSound = document.getElementById('draw-sound');
    const timeoutSound = document.getElementById('timeout-sound');
    
    // Game state
    let gameBoard = ['', '', '', '', '', '', '', '', ''];
    let currentPlayer = 'X'; // Player is X, AI is O
    let gameActive = false; // Start inactive until button click
    let playerScore = 0;
    let aiScore = 0;
    let timer;
    let timeLeft = 30;
    let soundOn = true;
    
    // Winning combinations
    const winningCombinations = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
        [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
        [0, 4, 8], [2, 4, 6]             // diagonals
    ];
    
    // Initialize the game
    function initGame() {
        gameBoard = ['', '', '', '', '', '', '', '', ''];
        gameActive = true;
        currentPlayer = 'X';
        clearTimeout(timer);
        timeLeft = 30;
        timerEl.textContent = timeLeft;
        
        // Clear the board
        cells.forEach(cell => {
            cell.textContent = '';
            cell.classList.remove('x', 'o', 'winner');
        });
        
        // Hide status message and play again button
        statusMessage.classList.remove('visible');
        playAgainBtn.classList.remove('visible');
        statusMessage.textContent = '';
        
        // Update score display
        playerScoreEl.textContent = playerScore;
        aiScoreEl.textContent = aiScore;
    }
    
    // Handle cell click
    function handleCellClick(e) {
        if (!gameActive) return;
        
        const clickedCell = e.target;
        const clickedCellIndex = parseInt(clickedCell.getAttribute('data-index'));
        
        // If cell is already filled or game is not active, ignore click
        if (gameBoard[clickedCellIndex] !== '' || !gameActive || currentPlayer !== 'X') return;
        
        // Play sound
        if (soundOn) clickSound.play();
        
        // Place the player's mark
        placeMark(clickedCell, clickedCellIndex, 'X');
        
        // Check for win or draw
        if (checkWin('X')) {
            gameOver('player');
            return;
        } else if (isDraw()) {
            gameOver('draw');
            return;
        }
        
        // Switch to AI's turn
        currentPlayer = 'O';
        statusMessage.textContent = "AI is thinking...";
        statusMessage.classList.add('visible');
        
        // AI makes a move after a short delay
        setTimeout(() => {
            aiMove();
        }, 800);
    }
    
    // Place mark on the board
    function placeMark(cell, index, player) {
        gameBoard[index] = player;
        cell.textContent = player;
        cell.classList.add(player.toLowerCase());
        
        // Add animation
        cell.style.animation = 'fadeIn 0.5s';
        setTimeout(() => {
            cell.style.animation = '';
        }, 500);
    }
    
    // AI move using minimax algorithm
    function aiMove() {
        if (!gameActive || currentPlayer !== 'O') return;
        
        // Reset timer
        resetTimer();
        
        // Find best move using minimax
        let bestScore = -Infinity;
        let bestMove;
        
        for (let i = 0; i < 9; i++) {
            if (gameBoard[i] === '') {
                gameBoard[i] = 'O';
                let score = minimax(gameBoard, 0, false);
                gameBoard[i] = '';
                
                if (score > bestScore) {
                    bestScore = score;
                    bestMove = i;
                }
            }
        }
        
        // Make the best move
        placeMark(cells[bestMove], bestMove, 'O');
        
        // Check for win or draw
        if (checkWin('O')) {
            gameOver('ai');
            return;
        } else if (isDraw()) {
            gameOver('draw');
            return;
        }
        
        // Switch back to player's turn
        currentPlayer = 'X';
        statusMessage.textContent = "Your turn!";
        
        // Start countdown timer
        startTimer();
    }
    
    // Minimax algorithm
    function minimax(board, depth, isMaximizing) {
        // Check for terminal states
        if (checkWin('O')) return 10 - depth;
        if (checkWin('X')) return depth - 10;
        if (isDraw()) return 0;
        
        if (isMaximizing) {
            let bestScore = -Infinity;
            for (let i = 0; i < 9; i++) {
                if (board[i] === '') {
                    board[i] = 'O';
                    let score = minimax(board, depth + 1, false);
                    board[i] = '';
                    bestScore = Math.max(score, bestScore);
                }
            }
            return bestScore;
        } else {
            let bestScore = Infinity;
            for (let i = 0; i < 9; i++) {
                if (board[i] === '') {
                    board[i] = 'X';
                    let score = minimax(board, depth + 1, true);
                    board[i] = '';
                    bestScore = Math.min(score, bestScore);
                }
            }
            return bestScore;
        }
    }
    
    // Check for win
    function checkWin(player) {
        return winningCombinations.some(combination => {
            const [a, b, c] = combination;
            if (gameBoard[a] === player && gameBoard[b] === player && gameBoard[c] === player) {
                // Highlight winning cells
                combination.forEach(index => {
                    cells[index].classList.add('winner');
                });
                return true;
            }
            return false;
        });
    }
    
    // Check for draw
    function isDraw() {
        return gameBoard.every(cell => cell !== '');
    }
    
    // Game over
    function gameOver(result) {
        gameActive = false;
        clearTimeout(timer);
        
        // Show appropriate message and update scores
        switch (result) {
            case 'player':
                playerScore++;
                playerScoreEl.textContent = playerScore;
                statusMessage.textContent = "YOU WIN!";
                if (soundOn) winSound.play();
                break;
            case 'ai':
                aiScore++;
                aiScoreEl.textContent = aiScore;
                statusMessage.textContent = "AI WINS!";
                if (soundOn) loseSound.play();
                break;
            case 'draw':
                statusMessage.textContent = "DRAW!";
                if (soundOn) drawSound.play();
                break;
            case 'timeout':
                aiScore++;
                aiScoreEl.textContent = aiScore;
                statusMessage.textContent = "TIME'S UP! AI WINS!";
                if (soundOn) timeoutSound.play();
                break;
        }
        
        statusMessage.classList.add('visible');
        playAgainBtn.classList.add('visible');
    }
    
    // Timer functions
    function startTimer() {
        clearTimeout(timer);
        timeLeft = 30;
        timerEl.textContent = timeLeft;
        timerEl.classList.add('neon-glow');
        
        timer = setInterval(() => {
            timeLeft--;
            timerEl.textContent = timeLeft;
            
            if (timeLeft <= 0) {
                clearInterval(timer);
                timerEl.classList.remove('neon-glow');
                gameOver('timeout');
            }
        }, 1000);
    }
    
    function resetTimer() {
        clearTimeout(timer);
        timeLeft = 30;
        timerEl.textContent = timeLeft;
        timerEl.classList.remove('neon-glow');
    }
    
    // Sound toggle
    function toggleSound() {
        soundOn = !soundOn;
        soundToggle.innerHTML = soundOn ? '<i class="fas fa-volume-up"></i>' : '<i class="fas fa-volume-mute"></i>';
        soundToggle.style.backgroundColor = soundOn ? 'rgba(10, 10, 40, 0.7)' : 'rgba(255, 0, 255, 0.3)';
        soundToggle.style.borderColor = soundOn ? 'var(--neon-blue)' : 'var(--neon-pink)';
        soundToggle.style.color = soundOn ? 'var(--neon-blue)' : 'var(--neon-pink)';
    }
    
    // Start game button
    function startGame() {
        // Play silent sound to unlock audio
        const silentSound = new Audio('data:audio/wav;base64,UklGRl9vT19XQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YU...');
        silentSound.volume = 0;
        silentSound.play().then(() => {
            startButton.style.display = 'none';
            silentSound.remove();
            gameActive = true;
            initGame();
        }).catch(error => {
            console.log("Audio playback failed:", error);
            startButton.style.display = 'none';
            gameActive = true;
            initGame();
        });
    }
    
    // Event listeners
    cells.forEach(cell => {
        cell.addEventListener('click', handleCellClick);
    });
    
    playAgainBtn.addEventListener('click', initGame);
    soundToggle.addEventListener('click', toggleSound);
    startButton.addEventListener('click', startGame);
    
    // Initialize with game inactive until start button is clicked
    gameActive = false;
});