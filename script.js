const cells = document.querySelectorAll(".cell");
const statusText = document.getElementById("status");
const resetButton = document.getElementById("reset-button");

let currentPlayer = "X";
let board = ["", "", "", "", "", "", "", "", ""];
let isGameActive = true;

const winningConditions = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6]
];

// Handle cell click
function handleCellClick(event) {
  const cell = event.target;
  const index = cell.dataset.index;

  if (board[index] !== "" || !isGameActive) return;

  board[index] = currentPlayer;
  cell.textContent = currentPlayer;
  cell.classList.add("taken");

  checkWinner();
  switchPlayer();
}

// Check for a winner
function checkWinner() {
  let roundWon = false;

  for (let condition of winningConditions) {
    const [a, b, c] = condition;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      roundWon = true;
      break;
    }
  }

  if (roundWon) {
    statusText.textContent = `${currentPlayer} wins! 🎉`;
    isGameActive = false;
  } else if (!board.includes("")) {
    statusText.textContent = "It's a tie! 🤝";
    isGameActive = false;
  }
}

// Switch player
function switchPlayer() {
  currentPlayer = currentPlayer === "X" ? "O" : "X";
  if (isGameActive) {
    statusText.textContent = `Player ${currentPlayer}'s turn`;
  }
}

// Reset the game
function resetGame() {
  board = ["", "", "", "", "", "", "", "", ""];
  currentPlayer = "X";
  isGameActive = true;

  cells.forEach(cell => {
    cell.textContent = "";
    cell.classList.remove("taken");
  });

  statusText.textContent = `Player X's turn`;
}

// Add event listeners
cells.forEach(cell => cell.addEventListener("click", handleCellClick));
resetButton.addEventListener("click", resetGame);
