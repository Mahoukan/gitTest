let colorPicker, sizeSlider, clearButton, undoButton, saveButton, brushSelector;
let helpVisible = true;
let brushType = 'Circle';
let history = [];
let maxHistory = 10;
let prevX, prevY;

function setup() {
  createCanvas(600, 400);
  background(255);
  noStroke();
  textFont('Courier New');

  // Colour Picker
  createDiv("Colour").position(10, height + 5).style('color', '#000');
  colorPicker = createColorPicker('#000000');
  colorPicker.position(10, height + 30);
  colorPicker.style('width', '100px');

  // Brush Size
  createDiv("Size").position(130, height + 5).style('color', '#000');
  sizeSlider = createSlider(1, 100, 10);
  sizeSlider.position(130, height + 30);
  sizeSlider.style('width', '100px');

  // Brush Type Selector
  createDiv("Brush Type").position(250, height + 5).style('color', '#000');
  brushSelector = createSelect();
  brushSelector.position(250, height + 30);
  brushSelector.option('Circle');
  brushSelector.option('Square');
  brushSelector.option('Line');
  brushSelector.option('Spray');
  brushSelector.changed(() => brushType = brushSelector.value());

  // Buttons
  clearButton = createButton('Clear');
  clearButton.position(400, height + 30);
  clearButton.mousePressed(clearScreen);

  undoButton = createButton('Undo');
  undoButton.position(460, height + 30);
  undoButton.mousePressed(undo);

  saveButton = createButton('Save');
  saveButton.position(520, height + 30);
  saveButton.mousePressed(() => saveCanvas('drawing', 'png'));
}

function draw() {
  if (mouseIsPressed && mouseY < height) {
    fill(colorPicker.color());
    noStroke();

    let size = sizeSlider.value();

    if (brushType === 'Circle') {
      circle(mouseX, mouseY, size);
    } else if (brushType === 'Square') {
      rect(mouseX - size / 2, mouseY - size / 2, size, size);
    } else if (brushType === 'Line' && prevX !== undefined) {
      stroke(colorPicker.color());
      strokeWeight(size);
      line(prevX, prevY, mouseX, mouseY);
    } else if (brushType === 'Spray') {
      for (let i = 0; i < 20; i++) {
        let offsetX = random(-size / 2, size / 2);
        let offsetY = random(-size / 2, size / 2);
        if (dist(0, 0, offsetX, offsetY) < size / 2) {
          circle(mouseX + offsetX, mouseY + offsetY, 1);
        }
      }
    }
  }

  if (helpVisible) {
    drawHelp();
  }

  prevX = mouseX;
  prevY = mouseY;
}

function drawHelp() {
  noStroke();
  fill(0);
  textSize(14);
  text("Press H to toggle help", 10, 20);
  text("Brush types: Circle, Square, Line, Spray", 10, 40);
  text("Click buttons below to Clear, Undo, or Save", 10, 60);
}

function clearScreen() {
  saveToHistory();
  background(255);
}

function undo() {
  if (history.length > 0) {
    let img = history.pop();
    image(img, 0, 0);
  }
}

function saveToHistory() {
  if (history.length >= maxHistory) history.shift();
  history.push(get());
}

function mousePressed() {
  if (mouseY < height) {
    saveToHistory();
  }
}

function keyPressed() {
  if (key === 'H' || key === 'h') {
    helpVisible = !helpVisible;
    return false;
  }
}
