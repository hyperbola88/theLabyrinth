//ADDITIONAL FEATURES

//Buttons
const menuButton = document.querySelector(".menu-btn");
const readyButton = document.querySelector("#ready");
const seconds = document.querySelector(".seconds");

//Menu options
const menuNewGame = document.querySelector("#menu-new");

//Containers / Inputs
const menuContainer = document.querySelector(".menu-container");
const score = document.querySelector(".score");
const round = document.querySelector(".round");
const timer = document.querySelector(".timer");

//Global Variables
let intervalId; // timer
let storedRound = Number(localStorage.getItem("round"));
let storedScore = Number(localStorage.getItem("score"));
let storedTotal = Number(localStorage.getItem("total"));
let storedCellsX = Number(localStorage.getItem("cellsx"));
let storedCellsY = Number(localStorage.getItem("cellsx"));

let cellsHorizontalTemp = storedCellsX > 4 || undefined ? storedCellsX : 4;
let cellsVerticalTemp = storedCellsY > 3 || undefined ? storedCellsY : 3;

//Local Storage
const storage = (key, value) => {
  if (key === "round") {
    localStorage.setItem("round", value);
  }
  if (key === "score") {
    localStorage.setItem("score", value);
  }
  if (key === "total") {
    localStorage.setItem("total", value);
  }
  if (key === "cellsx") {
    localStorage.setItem("cellsx", value);
  }
  if (key === "cellsy") {
    localStorage.setItem("cellsy", value);
  }
};

// Listeners
// Ready button
readyButton.addEventListener("click", (event) => {
  timerStart();
  rounds();
  readyButton.classList.add("hidden");
  console.log("ready ", storedRound);
});

// Menu button
menuButton.addEventListener("click", (event) => {
  if (menuContainer.classList.contains("hidden")) {
    menuContainer.classList.remove("hidden");
    clearInterval(intervalId);
  } else {
    menuContainer.classList.add("hidden");
  }
});

// Menu option new game
menuNewGame.addEventListener("click", (event) => {
  newGame();
});


// Game controls //
// New/Next Game
const newGame = () => {
  location.reload();
  localStorage.clear();
};

const nextGame = () => {
  location.reload();
};

// Increase X/Y Cells
const increaseCells = () => {
  let addCellsX = cellsHorizontalTemp + 1;
  let addCellsY = cellsHorizontalTemp + 1;
  storage("cellsx", addCellsX);
  storage("cellsy", addCellsY);
};

// Total Score
const totalScore = () => {
  let total = storedScore + storedTotal;
  storage("total", total);
};

// Increment Rounds
const rounds = () => {
  let currentRound = Number(round.innerHTML);
  let nextRound = currentRound + 1;
  round.innerHTML = nextRound;
  storage("round", nextRound);
};

// Update Round Points
const roundPoints = (points) => {
  let remainingTime = Number(timer.innerHTML);
  let totalNewPoints = Math.abs(
    Math.floor((storedRound * 10000 - remainingTime) / 1000)
  );
  storage("score", totalNewPoints);
};

// Timer Start
const timerStart = () => {
  intervalId = setInterval(() => {
    let timeLeft = ++timer.innerHTML;

    if (timeLeft < 10000) {
      timer.innerHTML = timeLeft + 1;
    } else {
      clearInterval(intervalId);
      gameOverMessage();
    }
  }, 10);
};

// Timer Stop
const timerStop = () => {
  seconds.innerHTML = Math.floor(timer.innerHTML / 100);
  clearInterval(intervalId);
  roundPoints();
  increaseCells();
  totalScore();
  setTimeout(() => {
    nextGame();
  }, 3000);
};

// Update Scoreboard
window.onload = () => {
  console.log("onload ", storedRound);
  score.innerHTML = storedScore + storedTotal;
  round.innerHTML = storedRound;
};

// Game over message
const gameOverMessage = () => {
  document.querySelector(".time-out").classList.remove("hidden");
  setTimeout(() => {
    document.querySelector(".time-out").classList.add("hidden");
    newGame();
  }, 2000);
};
