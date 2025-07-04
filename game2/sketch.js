let n = 0;
let pause = false;
let angle1 = 0;
let l = 100;
let Xpos = [];
let Ypos = [];
let slider;

function setup() {
  createCanvas(1000, 1000);
  background(0);
  slider = createSlider(2, 25, 6);
  slider.position(10, height + 10);
  slider.style('width', '200px');

  n = slider.value();
  l = width / n;
  Xpos = [];
  Ypos = [];
}

function draw() {
  if (n !== slider.value()) {
    angle1 = 0;
    l = width / n;
    Xpos = [];
    Ypos = [];
    n = slider.value();
  }

  if (!pause) {
    calc();
    textSize(l / 4);
    fill(255);
    noStroke();
    text("Pause", 5, 23 + l / 3);
    noFill();
    stroke(255);
    rect(0, 0, l, l);
  }
}

function mouseClicked() {
  if (mouseX < l && mouseX > 0 && mouseY < l && mouseY > 0) {
    pause = !pause;
  }
}

function calc() {
  background(0);
  let xPos = [];
  let yPos = [];

  for (let i = 1; i < n; i++) {
    noFill();
    stroke(255);
    ellipse(i * l + l / 2, l / 2, l - 20, l - 20);
    ellipse(l / 2, i * l + l / 2, l - 20, l - 20);

    fill(255);
    let x1 = i * l + l / 2 + (l - 20) / 2 * cos(angle1 * i);
    let y1 = l / 2 + (l - 20) / 2 * sin(angle1 * i);
    ellipse(x1, y1, 10, 10);
    xPos[i - 1] = x1;

    let x2 = l / 2 + (l - 20) / 2 * cos(angle1 * i);
    let y2 = i * l + l / 2 + (l - 20) / 2 * sin(angle1 * i);
    ellipse(x2, y2, 10, 10);
    yPos[i - 1] = y2;

    stroke(255, 50);
    line(x1, y1, x1, height);
    line(x2, y2, width, y2);
  }

  Xpos.push(xPos);
  Ypos.push(yPos);

  for (let z = 0; z < n - 1; z++) {
    for (let j = 0; j < n - 1; j++) {
      beginShape();
      for (let i = 0; i < Xpos.length; i++) {
        let xPos1 = Xpos[i];
        let yPos1 = Ypos[i];
        if (xPos1 && yPos1) {
          noFill();
          stroke(255);
          curveVertex(xPos1[j], yPos1[z]);
        }
      }
      endShape();
    }
  }

  angle1 += 0.02;
  if (angle1 > TWO_PI) {
    angle1 = 0;
    Xpos = [];
    Ypos = [];
  }
}
