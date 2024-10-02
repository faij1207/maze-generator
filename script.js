const canvas = document.getElementById("mazeCanvas");
const ctx = canvas.getContext("2d");
const rows = 20;
const cols = 20;
const cellSize = 25;
canvas.width = cols * cellSize;
canvas.height = rows * cellSize;

let grid = [];
let stack = [];
let path = [];
let start, end;

// Initialize the grid with cells having walls
function initializeGrid() {
  grid = [];
  for (let row = 0; row < rows; row++) {
    let rowArray = [];
    for (let col = 0; col < cols; col++) {
      rowArray.push({
        row,
        col,
        visited: false,
        walls: { top: true, right: true, bottom: true, left: true },
        previous: null,
      });
    }
    grid.push(rowArray);
  }
}

// Draw the maze on the canvas
function drawMaze() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (let row of grid) {
    for (let cell of row) {
      let x = cell.col * cellSize;
      let y = cell.row * cellSize;

      ctx.strokeStyle = "#000";
      ctx.lineWidth = 2;

      // Draw walls
      if (cell.walls.top) ctx.strokeRect(x, y, cellSize, 0);
      if (cell.walls.right) ctx.strokeRect(x + cellSize, y, 0, cellSize);
      if (cell.walls.bottom) ctx.strokeRect(x, y + cellSize, cellSize, 0);
      if (cell.walls.left) ctx.strokeRect(x, y, 0, cellSize);

      // Mark start and end points
      if (cell === start) {
        colorCell(cell, "green"); // Start point
      } else if (cell === end) {
        colorCell(cell, "red"); // End point
      }
    }
  }
}

// Color the cell for visualization
function colorCell(cell, color) {
  ctx.fillStyle = color;
  let x = cell.col * cellSize + 2;
  let y = cell.row * cellSize + 2;
  ctx.fillRect(x, y, cellSize - 4, cellSize - 4);
}

// Maze generation using Depth-First Search
function generateMaze() {
  initializeGrid();
  start = grid[0][0]; // Set start point
  end = grid[rows - 1][cols - 1]; // Set end point
  let current = start;
  current.visited = true;
  stack.push(current);

  function mazeStep() {
    if (stack.length > 0) {
      let next = getUnvisitedNeighbor(current);
      if (next) {
        removeWalls(current, next);
        next.visited = true;
        stack.push(next);
        current = next;
      } else {
        current = stack.pop();
      }
      drawMaze();
      requestAnimationFrame(mazeStep);
    }
  }

  mazeStep();
}

// Get a random unvisited neighbor
function getUnvisitedNeighbor(cell) {
  let neighbors = [];
  let { row, col } = cell;

  if (row > 0 && !grid[row - 1][col].visited) neighbors.push(grid[row - 1][col]); // top
  if (col < cols - 1 && !grid[row][col + 1].visited) neighbors.push(grid[row][col + 1]); // right
  if (row < rows - 1 && !grid[row + 1][col].visited) neighbors.push(grid[row + 1][col]); // bottom
  if (col > 0 && !grid[row][col - 1].visited) neighbors.push(grid[row][col - 1]); // left

  if (neighbors.length > 0) {
    let randomIndex = Math.floor(Math.random() * neighbors.length);
    return neighbors[randomIndex];
  }
  return undefined;
}

// Remove walls between two cells
function removeWalls(a, b) {
  let x = a.col - b.col;
  if (x === 1) {
    a.walls.left = false;
    b.walls.right = false;
  } else if (x === -1) {
    a.walls.right = false;
    b.walls.left = false;
  }

  let y = a.row - b.row;
  if (y === 1) {
    a.walls.top = false;
    b.walls.bottom = false;
  } else if (y === -1) {
    a.walls.bottom = false;
    b.walls.top = false;
  }
}

// Start pathfinding visualization
function startPathfinding() {
  if (!start || !end) return;
  resetVisited();
  bfsPathfinding();
}

// Reset the visited property for all cells
function resetVisited() {
  for (let row of grid) {
    for (let cell of row) {
      cell.visited = false;
      cell.previous = null;
    }
  }
}

// Breadth-First Search (BFS) visualization
function bfsPathfinding() {
  let queue = [];
  queue.push(start);
  start.visited = true;

  function pathfindingStep() {
    if (queue.length > 0) {
      let current = queue.shift();
      colorCell(current, "lightgreen");

      if (current === end) {
        tracePath(end);
        return;
      }

      let neighbors = getValidNeighbors(current);
      for (let neighbor of neighbors) {
        if (!neighbor.visited) {
          neighbor.visited = true;
          neighbor.previous = current;
          queue.push(neighbor);
          colorCell(neighbor, "lightblue");
        }
      }

      requestAnimationFrame(pathfindingStep);
    }
  }

  pathfindingStep();
}

// Trace back the path from end to start
function tracePath(endCell) {
  let current = endCell;
  path = [];

  while (current) {
    path.push(current);
    current = current.previous;
  }

  drawPath();
  drawMaze(); // Ensure the maze is redrawn to visualize the path correctly
}

// Trace back the path from end to start
function tracePath(endCell) {
    let current = endCell;
    path = [];
  
    while (current) {
      path.push(current);
      current = current.previous;
    }
  
    drawPath();
  }
  

// Draw the shortest path on the maze
function drawPath() {
  for (let cell of path) {
    colorCell(cell, "yellow");
  }
}

// Get valid neighbors for BFS (based on walls)
function getValidNeighbors(cell) {
  let neighbors = [];
  let { row, col } = cell;

  if (row > 0 && !cell.walls.top) neighbors.push(grid[row - 1][col]); // top
  if (col < cols - 1 && !cell.walls.right) neighbors.push(grid[row][col + 1]); // right
  if (row < rows - 1 && !cell.walls.bottom) neighbors.push(grid[row + 1][col]); // bottom
  if (col > 0 && !cell.walls.left) neighbors.push(grid[row][col - 1]); // left

  return neighbors;
}
