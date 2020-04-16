let meter = new FPSMeter({
  theme: "transparent",
  top: "5px",
  right: "5px",
  left: "auto",
  maxFps: "100"
});
const cnv = document.getElementById("canvas");
const ctx = cnv.getContext("2d");

let generation = 0,
  totalSteps = 0;

// Конфигурация симуляции
const cfg = {
  fieldSize: { x: 14, y: 30 },
  gridColor: "rgba(255,255,255, 0.1)",
  lifeDuration: 100,
  beingColor: "rgb(0,0,150)",
  beingCount: 10,
  foodCount: 10,
  foodColor: "rgb(0,150,0)",
  foodEnergy: 10
};

let w, h, cw, ch, cx, cy, pixSize;
function resizeCanvas() {
  w = innerWidth;
  h = innerHeight;
  cx = cw / 2;
  cy = ch / 2;
  pixSize =
    (w / cfg.fieldSize.x) * cfg.fieldSize.y > h
      ? h / cfg.fieldSize.y
      : w / cfg.fieldSize.x;
  cw = cnv.width = cfg.fieldSize.x * pixSize;
  ch = cnv.height = cfg.fieldSize.y * pixSize;
  drawGrid();
}
resizeCanvas();
window.addEventListener(`resize`, resizeCanvas);

function drawBeing(x, y, w, h) {
  ctx.fillStyle = cfg.beingColor;
  ctx.fillRect(x * pixSize, y * pixSize, w, h);
}

function drawFood(x, y, w, h) {
  ctx.fillStyle = cfg.foodColor;
  ctx.fillRect(x * pixSize, y * pixSize, w, h);
}

function drawGrid() {
  function drawLine(x1, y1, x2, y2, color = cfg.gridColor) {
    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
  }
  for (let x = 0; x < cw; x += pixSize) drawLine(x, 0, x, ch);
  for (let y = 0; y < ch; y += pixSize) drawLine(0, y, cw, y);
}
drawGrid();

class Being {
  constructor(
    x = Math.trunc(Math.random() * cfg.fieldSize.x),
    y = Math.trunc(Math.random() * cfg.fieldSize.y)
  ) {
    this.pos = { x, y };
    this.lifeDuration = cfg.lifeDuration;
    this.age = 0;
  }

  moving() {
    let dir = Math.round(Math.random() * 8);

    if (dir == 1) this.pos.y++;
    if (dir == 2) {
      this.pos.x++;
      this.pos.y++;
    }
    if (dir == 3) this.pos.x++;
    if (dir == 4) {
      this.pos.x++;
      this.pos.y--;
    }
    if (dir == 5) this.pos.y--;
    if (dir == 6) {
      this.pos.x--;
      this.pos.y--;
    }
    if (dir == 7) this.pos.x--;
    if (dir == 8) {
      this.pos.x--;
      this.pos.y++;
    }
    if (this.pos.x > cfg.fieldSize.x) this.pos.x = 0;
    if (this.pos.x < 0) this.pos.x = cfg.fieldSize.x;
    if (this.pos.y > cfg.fieldSize.y) this.pos.y = 0;
    if (this.pos.y < 0) this.pos.y = cfg.fieldSize.y;
    this.age++;
  }

  redrawBeing() {
    drawBeing(this.pos.x, this.pos.y, pixSize, pixSize);
  }

  killing(id) {
    if (this.age == this.lifeDuration) {
      beingList.splice(id, 1);
    }
  }

  getFood(id) {
    for (let i = 0; i < foodList.length; i++) {
      if (this.pos.x == foodList[i].pos.x && this.pos.y == foodList[i].pos.y) {
        foodList.splice(i, 1);
        this.lifeDuration = this.lifeDuration + cfg.foodEnergy;
        console.log(this.age);
      }
    }
  }
}

class Food {
  constructor() {
    let x = Math.trunc(Math.random() * cfg.fieldSize.x);
    let y = Math.trunc(Math.random() * cfg.fieldSize.y);
    this.pos = { x, y };
  }
  redrawFood() {
    drawFood(this.pos.x, this.pos.y, pixSize, pixSize);
  }
}

let foodList = [];
function addFood() {
  if (foodList.length < cfg.foodCount) foodList.push(new Food());
}

function drFood() {
  while (foodList.length < cfg.foodCount) addFood();
}
drFood();

let beingList = [];
function addBeing() {
  while (beingList.length < cfg.beingCount) beingList.push(new Being());
}
addBeing();

function refreshBeing() {
  beingList.forEach((i, id) => {
    i.moving();
    i.killing(id);
    i.getFood(id);
    i.redrawBeing();
  });
}

function refreshFood() {
  foodList.forEach(i => {
    i.redrawFood();
  });
}

function loop() {
  ctx.clearRect(0, 0, cw, ch);
  drawGrid();
  addFood();
  if (beingList.length == 0) {
    addBeing();
    generation++;
  }
  totalSteps++;

  document.getElementById("generation").innerHTML = generation;
  document.getElementById("totalSteps").innerHTML = totalSteps;

  refreshFood();
  refreshBeing();

  meter.tick();
  requestAnimationFrame(loop);
}
loop();
