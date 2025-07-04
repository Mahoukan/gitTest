let button;
let colorPicker;
let sizeSlider;

function setup() {
  createCanvas(600, 400);
  background(255);
  noStroke();
  
  // Create color picker
  colorPicker = createColorPicker('#000000');
  colorPicker.position(10, height + 10);
  colorPicker.style('width', '100px');
  colorPicker.style('height', '30px');
  
  // Create size slider
  sizeSlider = createSlider(1, 100, 10);
  sizeSlider.position(130, height + 15);
  sizeSlider.style('width', '150px');
  
  // Create clear button
  button = createButton('Clear');
  button.position(width - 110, height + 15);
  button.size(100, 30);
  button.mousePressed(clearScreen);
}

function draw() {
  if (mouseIsPressed && mouseY < height) {
    fill(colorPicker.color());
    circle(mouseX, mouseY, sizeSlider.value());
  }
}

function clearScreen() {
  background(255);
}
