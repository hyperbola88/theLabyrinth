const { Engine, Render, Runner, World, Bodies, Body, Events } = Matter;

//variables to adjust labyrinth's size and complexity

const width = window.innerWidth;
const height = window.innerHeight * 0.9;
const cellsHorizontal = cellsHorizontalTemp;
const cellsVertical = cellsVerticalTemp;
const cellWidth = width / cellsHorizontal;
const cellHeight = height / cellsVertical;

//creating and rendering the field
const engine = Engine.create();
engine.world.gravity.y = 0;
const { world } = engine;
const render = Render.create({
  element: document.body,
  engine: engine,
  options: {
    wireframes: false,
    width: width,
    height: height,
  },
});
Render.run(render);
Runner.run(Runner.create(), engine);

//walls of the field
const walls = [
  Bodies.rectangle(width / 2, 0, width, 2, { isStatic: true }),
  Bodies.rectangle(width / 2, height, width, 2, { isStatic: true }),
  Bodies.rectangle(0, height / 2, 2, height, { isStatic: true }),
  Bodies.rectangle(width, height / 2, 2, height, { isStatic: true }),
];

World.add(world, walls);

//labyrinth construction

//function to shuffle array elements in random order
const shuffle = (arr) => {
  let counter = arr.length;
  while (counter > 0) {
    const index = Math.floor(Math.random() * counter);
    counter--;
    const temp = arr[counter];
    arr[counter] = arr[index];
    arr[index] = temp;
  }
  return arr;
};

//2-dimensional array of grids, false = unvisited
const grid = Array(cellsVertical)
  .fill(null)
  .map(() => Array(cellsHorizontal).fill(false));

//2-dimensional array of vertical walls between grid cells, false = wall is blocking the way
const verticals = Array(cellsVertical)
  .fill(null)
  .map(() => Array(cellsHorizontal - 1).fill(false));

//2-dimensional array of horizontal walls between grid cells, false = wall is blocking the way
const horizontals = Array(cellsVertical - 1)
  .fill(null)
  .map(() => Array(cellsHorizontal).fill(false));

//randomly choosing the starting cell
const startRow = Math.floor(Math.random() * cellsVertical);
const startColumn = Math.floor(Math.random() * cellsHorizontal);

const recurseThruoghCells = (row, column) => {
  //if I have already visited cell (row===true && column===true) than return
  if (grid[row][column]) {
    return;
  }
  //mark cell as visited
  grid[row][column] = true;
  //create a list of neighbors in random order
  const neighbors = shuffle([
    [row + 1, column, "down"],
    [row - 1, column, "up"],
    [row, column + 1, "right"],
    [row, column - 1, "left"],
  ]);
  //for each neighbor cell
  for (let neighbor of neighbors) {
    const [nextRow, nextColumn, direction] = neighbor;
    //check if that cell is outside the walls
    if (
      nextRow < 0 ||
      nextRow >= cellsVertical ||
      nextColumn < 0 ||
      nextColumn >= cellsHorizontal
    ) {
      continue;
    }
    //if we have already visited this neighbor - move on to the next
    if (grid[nextRow][nextColumn]) {
      continue;
    }
    //remove wall from horizontals or verticals array
    if (direction === "left") {
      verticals[row][column - 1] = true;
    } else if (direction === "right") {
      verticals[row][column] = true;
    } else if (direction === "up") {
      horizontals[row - 1][column] = true;
    } else if (direction === "down") {
      horizontals[row][column] = true;
    }
    recurseThruoghCells(nextRow, nextColumn);
  }
};

recurseThruoghCells(startRow, startColumn);

//drawing labyrinth's inside walls
horizontals.forEach((row, rowIndex) => {
  row.forEach((open, columnIndex) => {
    if (open) return;
    const wall = Bodies.rectangle(
      columnIndex * cellWidth + cellWidth / 2,
      rowIndex * cellHeight + cellHeight,
      cellWidth,
      10,
      { isStatic: true, label: "wall", render: { fillStyle: "white" } }
    );
    World.add(world, wall);
  });
});

verticals.forEach((row, rowIndex) => {
  row.forEach((open, columnIndex) => {
    if (open) return;
    const wall = Bodies.rectangle(
      columnIndex * cellWidth + cellWidth,
      rowIndex * cellHeight + cellHeight / 2,
      10,
      cellHeight,
      { isStatic: true, label: "wall", render: { fillStyle: "white" } }
    );
    World.add(world, wall);
  });
});

//adding the goal
const goal = Bodies.rectangle(
  width - cellWidth / 2,
  height - cellHeight / 2,
  cellWidth * 0.7,
  cellHeight * 0.7,
  { isStatic: true, label: "goal", render: { fillStyle: "#40e0d0" } }
);
World.add(world, goal);

//adding the ball
const ball = Bodies.circle(
  cellWidth / 2,
  cellHeight / 2,
  Math.min(cellHeight, cellWidth) * 0.3,
  {
    label: "ball",
    render: { fillStyle: "#ff0080" },
  }
);
World.add(world, ball);

//manipulating ball with keyboards
document.addEventListener("keydown", (event) => {
  const { x, y } = ball.velocity;
  const speedLimit = 15;
  switch (event.keyCode) {
    case 38:
      Body.setVelocity(ball, { x: x, y: Math.max(y - 5, -speedLimit) });
      break;
    case 40:
      Body.setVelocity(ball, { x: x, y: Math.min(y + 5, speedLimit) });
      break;
    case 37:
      Body.setVelocity(ball, { x: Math.max(x - 5, -speedLimit), y: y });
      break;
    case 39:
      Body.setVelocity(ball, { x: Math.min(x + 5, speedLimit), y: y });
      break;
  }
});

//win condition
Events.on(engine, "collisionStart", (event) => {
  event.pairs.forEach((collision) => {
    const labels = ["goal", "ball"];
    if (
      labels.includes(collision.bodyA.label) &&
      labels.includes(collision.bodyB.label)
    ) {
      document.querySelector(".winner").classList.remove("hidden");
      world.gravity.y = 1;
      world.bodies.forEach((body) => {
        if (body.label === "wall") {
          Body.setStatic(body, false);
        }
      });
      timerStop();
    }
  });
});
