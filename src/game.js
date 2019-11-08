const table = require('../node_modules/table');
const { table:drawTable } = table;

//Players signs. first element starts first and have one more turn. [tableSign, playerName]
// sample = [
//   ['X', "MohammadReza"],
//   ['X', "Mohammad"]
// ];
let players = [
  ['X','X'],
  ['O','O']
];

// Every stack (z) is a 3*3 matrix in a 9 cell vector:
// 0  1  2
// 3  4  5
// 6  7  8
const cube = [
  [0,0,0,0,0,0,0,0,0], //z = 0
  [0,0,0,0,0,0,0,0,0], //z = 1
  [0,0,0,0,0,0,0,0,0]  //z = 2
];

// Game maximu length is 27 turns. So first player plays one more turn in maximum state.
// First player moves all false turn and seconded player moves known as true turn.
let turn = false;

//Players scores. First (false) player in index 0 and second (true) player in index 1;
//mXax score is 58.
let scores = [0 ,0];

//c for cell
function move(z, c) {
  if(z >= 0 && z <= 2 && c >= 0 && c <= 8) {
    if(cube[z][c]===0) {
      cube[z][c] = turn ? 2 : 1;
      //Recalculate scores.
      caculateScores();
      
      if(shouldGameEnded()) {
        console.log("Game ended");
        printMatch(true);
      } else {
        turn = !turn; //Change turn for next player.
      }
    } else {
      console.error('filled cell');
    }
  } else {
    console.error('forbidden cell');
  }
}

function caculateScores() {
  //Recalculting, so reset scores.
  scores = [0,0]

  //Calculating in z level.
  caculate2d(cube[0]);
  caculate2d(cube[1]);
  caculate2d(cube[2]);
  //Calculating in x level. No need to calculate y level.
  caculate2d([...cube[0].slice(0, 3),...cube[1].slice(0, 3),...cube[2].slice(0, 3)]);
  caculate2d([...cube[0].slice(3, 6),...cube[1].slice(3, 6),...cube[2].slice(3, 6)]);
  caculate2d([...cube[0].slice(6, 9),...cube[1].slice(6, 9),...cube[2].slice(6, 9)]);

  //Calculating cubes 4 diameters.
  caculate1d(cube[0][0] + cube[1][4] + cube[2][8])
  caculate1d(cube[0][8] + cube[1][4] + cube[2][0])
  caculate1d(cube[0][2] + cube[1][4] + cube[2][6])
  caculate1d(cube[0][6] + cube[1][4] + cube[2][2])
}

function caculate2d(square) {
  //Calculating squares rows.
  caculate1d(square[0] + square[1] + square[2]);
  caculate1d(square[3] + square[4] + square[5]);
  caculate1d(square[6] + square[7] + square[8]);
  //Calculating squares columns.
  caculate1d(square[0] + square[3] + square[6]);
  caculate1d(square[1] + square[4] + square[7]);
  caculate1d(square[2] + square[5] + square[8]);
  //Calculating squares diameters.
  caculate1d(square[0] + square[4] + square[8]);
  caculate1d(square[2] + square[4] + square[6]);
}

function caculate1d(sum) {
  //+1 for false player score if thats all 1.
  if(sum === 3) {
    scores[0]++;
  }
  //+1 for true player score if thats all 2.
  if(sum === 6) {
    scores[1]++;
  }
}

//Game should ended if there isnt any empty (zero) cell.
function shouldGameEnded() {
  return Math.min(...cube[0]) && Math.min(...cube[1]) && Math.min(...cube[2]);
}

//Transforms 0, 1, 2 cube to empty and players sign cube for printing.
function transformToSigns(cube) {
  return cube.map(square => square.map(cell => cell === 0 ? " " : players[cell-1][0]))
}

//Print the cube and game status.
function printMatch(gameEnded) {
  const transformedCube = transformToSigns(cube);
  
  console.log("z=0")
  console.log(drawTable([transformedCube[0].slice(0, 3), transformedCube[0].slice(3, 6), transformedCube[0].slice(6, 9)]));
  console.log("z=1")
  console.log(drawTable([transformedCube[1].slice(0, 3), transformedCube[1].slice(3, 6), transformedCube[1].slice(6, 9)]));
  console.log("z=2")
  console.log(drawTable([transformedCube[2].slice(0, 3), transformedCube[2].slice(3, 6), transformedCube[2].slice(6, 9)]));

  if(gameEnded) {
    console.log(`Scores: ${players[0][1]}: ${scores[1]} - ${players[1][1]}: ${scores[1]}`);
  
    if(scores[0] > scores[1]){
      console.log(`${players[0][1]} won the game!`);
    } else if(scores[0] < scores[1]) {
      console.log(`${players[1][1]} won the game!`);
    } else {
      console.log("Its draw.")
    }
  }
}