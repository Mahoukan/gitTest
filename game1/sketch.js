let n = 3;
let radius;
let angleOffset = 0;
let rotationSpeed = 0.01;
let isPaused = false;
let showTrail = false;
let fillPolygon = false;
let showHelp = true;
let speedSlider, pointSlider;
let speedLabel, pointLabel;

function setup() {
  createCanvas(600, 600);
  colorMode(HSB, 255);
  radius = (3 * height) / 8;

  speedLabel = createDiv('Rotation Speed');
  speedLabel.position(20, height + 5);
  speedSlider = createSlider(-0.1, 0.1, 0.01, 0.001);
  speedSlider.position(20, height + 30);
  speedSlider.style('width', '250px');

  pointLabel = createDiv('Number of Points');
  pointLabel.position(290, height + 5);
  pointSlider = createSlider(1, 150, n, 1);
  pointSlider.position(290, height + 30);
  pointSlider.style('width', '250px');

  textFont('Courier New', 14);
}

function draw() {
  if (!showTrail) {
    background(255);
  } else {
    fill(255, 15);
    noStroke();
    rect(0, 0, width, height);
  }

  n = pointSlider.value();

  if (showHelp) drawUI();

  translate(width / 2, height / 2);

  let points = [];
  for (let i = 0; i < n; i++) {
    let angle = angleOffset + TWO_PI * i / n;
    let x = radius * cos(angle);
    let y = radius * sin(angle);
    points.push(createVector(x, y));
  }

  // Optional polygon fill
  if (fillPolygon) {
    noStroke();
    fill((frameCount * 2) % 255, 180, 255, 150);
    beginShape();
    for (let pt of points) {
      vertex(pt.x, pt.y);
    }
    endShape(CLOSE);
  }

  // Colourful connecting lines
  strokeWeight(1);
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      let hue = map(i + j, 0, n * 2, 0, 255);
      stroke((frameCount + hue) % 255, 200, 255);
      line(points[i].x, points[i].y, points[j].x, points[j].y);
    }
  }

  // Points as circles
  for (let pt of points) {
    fill(0);
    noStroke();
    circle(pt.x, pt.y, 6);
  }

  if (!isPaused) {
    rotationSpeed = speedSlider.value();
    angleOffset += rotationSpeed;
  }
}

function drawUI() {
  fill(0);
  noStroke();
  textAlign(LEFT, TOP);
  textSize(14);

  text(`Points: ${n}`, 10, 10);
  text(`Speed: ${rotationSpeed.toFixed(3)}`, 10, 30);
  text("CONTROLS:", 10, 60);
  text("← reset to 1    → +10\n↑ +1    ↓ -1    🖱 +1\nR: Pause/Play    T: Trail\nF: Fill polygon    S: Save image\nH: Hide/show help & sliders", 10, 80);
}

function mouseClicked() {
  if (n < 150) {
    n++;
    pointSlider.value(n);
  }
}

function keyReleased() {
  if (key === ' ') {
    isPaused = !isPaused;
  } else if (key === 't' || key === 'T') {
    showTrail = !showTrail;
  } else if (key === 'f' || key === 'F') {
    fillPolygon = !fillPolygon;
  } else if (key === 's' || key === 'S') {
    saveCanvas('polygon_network', 'png');
  } else if (key === 'r' || key === 'R') {
    isPaused = !isPaused;
  } else if (key === 'h' || key === 'H') {
    showHelp = !showHelp;
    let visibility = showHelp ? 'visible' : 'hidden';
    speedSlider.style('visibility', visibility);
    pointSlider.style('visibility', visibility);
    speedLabel.style('visibility', visibility);
    pointLabel.style('visibility', visibility);
  } else if (keyCode === UP_ARROW && n < 150) {
    n++;
    pointSlider.value(n);
  } else if (keyCode === DOWN_ARROW && n > 1) {
    n--;
    pointSlider.value(n);
  } else if (keyCode === LEFT_ARROW) {
    n = 1;
    pointSlider.value(n);
  } else if (keyCode === RIGHT_ARROW && n + 10 <= 150) {
    n += 10;
    pointSlider.value(n);
  }
}
