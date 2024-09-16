const rs = require('readline-sync');

const alphabet = ["A","B","C","D","E","F"];
const wrongAnswer = "❗";

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}

class Ship {
  constructor(boardSize, isSmall=true, isVertical=false, buildForwards=true, position=null) {
    this.boardSize = boardSize;
    this.length = isSmall ? 2 : 3;
    this.symbol = isSmall ? "🟠" : "🔵";
    this.isVertical = isVertical;
    this.buildForwards = buildForwards;

    if (position===null) {
      const range = buildForwards ? [0, this.boardSize - this.length] : [this.length - 1, this.boardSize];
      this.position = [getRandomInt(...range), getRandomInt(...range)];
    } else {
      this.position = position;
    }

  }
  getAllPositions() {
    let positions = [];
    for (let s = 0; s < this.length; s++) {
      const forwardValue = this.buildForwards ? 1 : -1;
      let add = this.isVertical ? [forwardValue*s, 0] : [0, forwardValue*s];
      let newPosition = [this.position[0] + add[0], this.position[1] + add[1]]
      positions.push(newPosition);
    }
    return positions;
  }
}

function getShipSizes(boardSize) {
  // true indicates short ship, long indicates long ship.
  switch (boardSize) {
    case 4:
      return [true, false];
    case 5:
      return [true, true, false];
    case 6:
      return [true, true, false, false];
    default:
      return [true, false];
  }
}

const generateShips = (boardSize) => {
  let shipSizes = getShipSizes(boardSize);

  let totalPositions = [];

  const getShip = (isSmall=true) => {
    const isVertical = Math.random() < 0.5;
    const buildForwards = Math.random() < 0.5;

    const ship = new Ship(boardSize, isSmall, isVertical, buildForwards);
    const positions = ship.getAllPositions();

    // Check for overlap
    for (let pos of positions) {
      if (
        totalPositions.some(totPos => totPos[0] === pos[0] && totPos[1] === pos[1])
        || pos[0] >= boardSize || pos[1] >= boardSize
      ) {
        return null;
      }
    }

    totalPositions = [...totalPositions, ...positions];
    return ship;
  }

  let ships = [];
  for (let size of shipSizes) {
    let ship = getShip(size);
    while (ship===null) {
      ship = getShip(size);
    }
    ships.push(ship);
  }

  return ships;
}

const generateBoard = (boardSize) => {
  let board = {};
  for (let i = 0; i < boardSize; i++) {
    board[alphabet[i]] = new Array(boardSize).fill("-");
  }
  return board;
}

const win = `========
__   _______ _   _   _    _ _____ _   _
\ \ / /  _  | | | | | |  | |_   _| \ | |
 \ V /| | | | | | | | |  | | | | |  \| |
  \ / | | | | | | | | |/\| | | | | . ' |
  | | \ \_/ / |_| | \  /\  /_| |_| |\  |
  \_/  \___/ \___/   \/  \/ \___/\_| \_/
========`

const setUp = (size) => {
  const board = generateBoard(size);
  const ships = generateShips(size);
  return [board, ships];
}

const chooseBoardSize = () => {
  const sizeOptions = ["4x4", "5x5", "6x6"];
  const boardSize = rs.keyInSelect(sizeOptions, "Choose board size: ");
  return (boardSize + 4);
}

const test = (num) => {
  // Run Tests here!
  const [board, ships] = setUp(num);
  const shipPositions = ships.map((ship) => ship.getAllPositions());
  console.log(shipPositions);
}

function runGame() {
  console.log("Welcome to Battleship 🚢");

  const boardSize = chooseBoardSize();

  const [board, ships] = setUp(boardSize);

  const shipPositionCount = ships.map((ship) => ship.length).reduce((count, sum) => count + sum);
  let guesses = [];
  let correctGuesses = 0;
  let incorrectGuesses = 0;

  const printOnBoard = (guess) => {
    const xIndex = alphabet.findIndex(a => a === guess[0]);
    const yIndex = Number(guess[1]);

    const ship = ships.find(ship => ship.getAllPositions().some(pos => pos[0] === xIndex && pos[1] === yIndex));
    if (ship===undefined) {
      board[guess[0]][yIndex] = wrongAnswer;
      incorrectGuesses += 1;
    } else {
      board[guess[0]][yIndex] = ship.symbol;
      correctGuesses += 1;
    }
    guesses.push(guess);
  }

  while (correctGuesses < shipPositionCount) {
    console.table(board);
    const guess = rs.question("Guess: ")
    if (
      guess.length !== 2 
      || !alphabet.includes(guess[0]) 
      || Number(guess[1]) >= boardSize
    ) {
      console.log("Choose a valid position (A1, B2, etc)"); 
      continue;
    } else if (guesses.includes(guess)) {
      console.log(`${guess} has already been guessed!`); 
      continue;
    }
    printOnBoard(guess);
  }

  console.table(board);
  console.log(win);
  console.log(`Correct: ${correctGuesses} | Incorrect: ${incorrectGuesses}`);
}
