// Dice Combat Game: p5.js Version

// Global State Variables
let gameOverTextAlpha = 0;
let playerWon = false;

const GameState = { MENU: "MENU", GAME: "GAME", GAME_OVER: "GAME_OVER" };
let gameState = GameState.MENU;

let totalOverkillPoints = 0;
let killLogScrollOffset = 0;
let maxKillLogVisibleLines;

let killLog = [];
let currentAttackSequence = [];

let screenPos, screenSize, diceSize;
let separator;

let dice1, dice2;

const POINTS_BY_SUM = [0, 0, 36, 25, 16, 9, 4, 1, 4, 9, 16, 25, 36];
const MAX_CARDS = 6;
const HAND_SIZE = 5;
const MAX_REROLLS = 6;

// Attack Multipliers
const STRAIGHT_MULT = 50;
const FIVE_KIND_MULT = 30;
const FOUR_KIND_MULT = 12;
const FULL_HOUSE_MULT = 2;
const THREE_KIND_MULT = 6;
const TWO_PAIR_MULT = 3;
const ONE_PAIR_MULT = 3;

// Timing
const ROLL_DURATION = 300;
const PAUSE_DURATION = 450;
const ATTACK_DISPLAY_DURATION = 2000;

// Help Panel
let HELP_X, HELP_Y_START, HELP_LINE_HEIGHT;

const DealState = {
  IDLE: "IDLE",
  DEALING: "DEALING",
  PAUSED: "PAUSED",
  REROLLING: "REROLLING",
};
let dealState = DealState.IDLE;
let dealStart = 0;
let dealIndex = 0;
let rerollMode = false;

let rerollsRemaining = MAX_REROLLS;
let pendingRedraw = false;

let cards = [];
let rollButton, rerollButton, orderButton, attackButton;
let helpButton, closeHelpButton;
let buyRerollsButton;
let healButton, doubleMultButton, nextBonusButton;
let doubleMultiplierNext = false;
let applyNextBonus = false;

let rollValue1 = 0;
let rollValue2 = 0;

let showAttack = false;
let lastAttack;
let attackDisplayStart = 0;

let rerollQueue = [];

let showHelpPanel = false;

const ENEMY_COUNT = 200;
let enemyHealths = [];
let currentEnemy = 0;
let currentHealth = 0;
let gameOver = false;
let gameOverStart = 0;

// Attack Types
const AttackType = {
  STRAIGHT: "STRAIGHT",
  FIVE_KIND: "FIVE_KIND",
  FOUR_KIND: "FOUR_KIND",
  FULL_HOUSE: "FULL_HOUSE",
  THREE_KIND: "THREE_KIND",
  TWO_PAIR: "TWO_PAIR",
  ONE_PAIR: "ONE_PAIR",
  HIGH_CARD: "HIGH_CARD",
};

let playerHealth = 10;

function setup() {
  createCanvas(windowWidth, windowHeight);
  pixelDensity(1);

  // Help panel dimensions
  HELP_X = width * 0.06;
  HELP_Y_START = height * 0.12;
  HELP_LINE_HEIGHT = height * 0.03;

  // Base units
  let unit = min(width, height) / 100;
  separator = unit * 1.2;

  screenSize = createVector(width * 0.75, height * 0.75);
  screenPos = createVector(width * 0.125, height * 0.0625);

  let side = min(width, height) / 10;
  diceSize = createVector(side, side);
  let canvasCenter = p5.Vector.add(screenPos, p5.Vector.mult(screenSize, 0.5));
  dice1 = new Dice(
    createVector(canvasCenter.x - side - separator, canvasCenter.y - side / 2),
    diceSize,
    separator
  );
  dice2 = new Dice(
    createVector(canvasCenter.x + separator, canvasCenter.y - side / 2),
    diceSize,
    separator
  );

  // Initialize cards
  cards = [];
  let cardSize = createVector(
    (screenSize.x - separator * (MAX_CARDS + 1)) / MAX_CARDS,
    screenSize.y / 3
  );
  let baseY = screenPos.y + screenSize.y - cardSize.y - separator;
  for (let i = 0; i < MAX_CARDS; i++) {
    let pos = createVector(
      screenPos.x + separator + i * (cardSize.x + separator),
      baseY
    );
    cards.push(new Card(pos, cardSize, separator * 3));
  }

  // UI Buttons sizing
  let buttonTextSize = height * 0.035;
  textSize(buttonTextSize);
  let buttonWidth = textWidth("Roll Cards") * 1.4;
  let buttonHeight = buttonTextSize * 1.6;
  let bSize = createVector(buttonWidth, buttonHeight);

  // Label scale
  textSize(1);
  let lblSize = (bSize.x * 0.8) / textWidth("Roll Cards");

  rollButton = new Button(
    createVector(screenPos.x + separator, screenPos.y + separator),
    bSize,
    "Roll Cards",
    color(0, 150, 200),
    lblSize
  );
  rerollButton = new Button(
    createVector(
      screenPos.x + separator,
      screenPos.y + separator * 2 + bSize.y
    ),
    bSize,
    "Reroll",
    color(0, 200, 150),
    lblSize
  );
  orderButton = new Button(
    createVector(
      screenPos.x + separator,
      screenPos.y + separator * 3 + bSize.y * 2
    ),
    bSize,
    "Order",
    color(200, 150, 0),
    lblSize
  );
  attackButton = new Button(
    createVector(
      screenPos.x + screenSize.x - separator - bSize.x,
      screenPos.y + separator
    ),
    bSize,
    "Attack",
    color(200, 50, 50),
    lblSize
  );

  let helpSize = unit * 7;
  helpButton = new Button(
    createVector(unit * 2, unit * 2),
    createVector(helpSize, helpSize),
    "?",
    color(100, 100, 255),
    helpSize * 0.5
  );
  closeHelpButton = new Button(
    createVector(unit * 5, unit * 5),
    createVector(helpSize * 0.8, helpSize * 0.8),
    "X",
    color(200, 50, 50),
    helpSize * 0.4
  );

  let buySize = diceSize.y;
  let buyPos = createVector(
    screenPos.x,
    screenPos.y + screenSize.y + separator
  );
  buyRerollsButton = new Button(
    buyPos,
    createVector(buySize, buySize),
    "R+",
    color(0, 200, 255),
    buySize * 0.5
  );

  let healPos = createVector(
    screenPos.x + diceSize.x + separator * 2,
    screenPos.y + screenSize.y + separator
  );
  healButton = new Button(
    healPos,
    createVector(diceSize.y, diceSize.y),
    "HP+",
    color(0, 200, 100),
    diceSize.y * 0.4
  );

  let multPos = createVector(healPos.x + diceSize.y + separator * 2, healPos.y);
  doubleMultButton = new Button(
    multPos,
    createVector(diceSize.y, diceSize.y),
    "×2",
    color(255, 180, 0),
    diceSize.y * 0.4
  );

  let bonusPos = createVector(
    multPos.x + diceSize.y + separator * 2,
    healPos.y
  );
  nextBonusButton = new Button(
    bonusPos,
    createVector(diceSize.y, diceSize.y),
    "½",
    color(150, 150, 255),
    diceSize.y * 0.4
  );

  maxKillLogVisibleLines = int((height * 0.35) / (height * 0.018 * 1.25));

  // Initialize enemy HP sequence
  enemyHealths = [];
  enemyHealths[0] = int(random(100, 201));
  for (let i = 1; i < ENEMY_COUNT; i++) {
    enemyHealths[i] = enemyHealths[i - 1] + int(random(100, 201));
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function draw() {
  background(0);

  switch (gameState) {
    case GameState.MENU:
      drawMainMenu();
      break;
    case GameState.GAME:
      updateDealLogic();
      drawStatus();
      if (pendingRedraw && !showAttack) {
        pendingRedraw = false;
        startDeal();
      }
      updateAndDrawUI();
      if (gameOver && millis() - gameOverStart > 3000) {
        let elapsed = millis() - gameOverStart;
        gameOverTextAlpha = min(255, elapsed * 0.2);
        if (elapsed > 3000) gameState = GameState.MENU;
      }
      break;
    case GameState.GAME_OVER:
      drawGameOverScreen();
      break;
  }
}

function mousePressed() {
  if (gameState === GameState.MENU) {
    startGame();
    return;
  }
  if (gameState === GameState.GAME_OVER) {
    gameState = GameState.MENU;
    return;
  }
  if (showHelpPanel && closeHelpButton.isMouseOver(mouseX, mouseY)) {
    showHelpPanel = false;
    return;
  }
  if (helpButton.isMouseOver(mouseX, mouseY)) {
    showHelpPanel = true;
    return;
  }
  if (showHelpPanel) return;
  handleUIInteractions();
}

function keyPressed() {
  if (showHelpPanel && keyCode === ESCAPE) {
    key = null; // prevent exit
    showHelpPanel = false;
  }
}

function mouseWheel(event) {
  let e = event.delta > 0 ? 1 : -1;
  let totalLines = 0;
  for (let info of killLog) {
    totalLines += info.getSummary().split("\n").length + 1;
  }
  let maxScroll = max(0, totalLines - maxKillLogVisibleLines);
  killLogScrollOffset = constrain(killLogScrollOffset + e, 0, maxScroll);
}

// Game Control Functions
function startGame() {
  currentEnemy = 0;
  playerHealth = 10;
  totalOverkillPoints = 0;
  rerollsRemaining = MAX_REROLLS;
  killLog = [];
  currentAttackSequence = [];
  doubleMultiplierNext = false;
  applyNextBonus = false;
  gameOver = false;
  showAttack = false;

  startDeal();
  gameState = GameState.GAME;
}

function startDeal() {
  for (let c of cards) {
    c.value = 0;
    c.die1 = 0;
    c.die2 = 0;
  }
  rerollMode = false;
  dealState = DealState.DEALING;
  dealIndex = 0;
  dealStart = millis();
  rollDice();
  pendingRedraw = false;
}

function startReroll() {
  rerollQueue = cards.filter((c) => c.selected);
  if (rerollQueue.length === 0) return;
  dealState = DealState.REROLLING;
  dealIndex = 0;
  dealStart = millis();
  rollDice();
}

function updateDealLogic() {
  if (dealState === DealState.IDLE) return;
  let elapsed = millis() - dealStart;

  if (
    (dealState === DealState.DEALING || dealState === DealState.REROLLING) &&
    elapsed >= ROLL_DURATION
  ) {
    dealState = DealState.PAUSED;
    dealStart = millis();
  }

  if (dealState === DealState.PAUSED && elapsed >= PAUSE_DURATION) {
    if (rerollMode) dealNextReroll();
    else dealNextCard();
  }
}

function dealNextCard() {
  let c = cards[dealIndex];
  c.die1 = rollValue1;
  c.die2 = rollValue2;
  c.value = rollValue1 + rollValue2;
  dealIndex++;
  if (dealIndex < cards.length) {
    dealState = DealState.DEALING;
    dealStart = millis();
    rollDice();
  } else {
    dealState = DealState.IDLE;
    rerollsRemaining--;
  }
}

function dealNextReroll() {
  let c = rerollQueue[dealIndex];
  c.die1 = rollValue1;
  c.die2 = rollValue2;
  c.value = rollValue1 + rollValue2;
  dealIndex++;
  if (dealIndex < rerollQueue.length) {
    dealState = DealState.REROLLING;
    dealStart = millis();
    rollDice();
  } else {
    dealState = DealState.IDLE;
    rerollsRemaining--;
  }
}

function rollDice() {
  rollValue1 = int(random(1, 7));
  rollValue2 = int(random(1, 7));
}

function getSelectedCardCount() {
  return cards.reduce((sum, c) => sum + (c.selected ? 1 : 0), 0);
}

function isIdle() {
  return dealState === DealState.IDLE && !showAttack;
}

// UI & Drawing Functions
function drawMainMenu() {
  push();
  textAlign(CENTER, CENTER);
  textSize(height * 0.08);
  fill(255);
  text("Dice Combat", width / 2, height * 0.3);
  textSize(height * 0.035);
  text("Click to Start", width / 2, height * 0.55);
  pop();
}

function drawGameOverScreen() {
  background(0);
  push();
  fill(255);
  textAlign(CENTER, CENTER);
  textSize(height * 0.08);
  text("Game Over", width / 2, height * 0.2);
  textSize(height * 0.04);
  text("Enemies Defeated: " + currentEnemy, width / 2, height * 0.4);
  text("Total Shop Points: " + totalOverkillPoints, width / 2, height * 0.5);
  text("Click to return to Menu", width / 2, height * 0.7);
  pop();
}

function drawStatus() {
  push();
  fill(255);
  textAlign(CENTER, CENTER);
  let titleSize = height * 0.035;
  let lineSize = height * 0.025;
  textSize(titleSize);
  let topY = screenPos.y + screenSize.y / 2 - diceSize.y - height * 0.06;
  if (!gameOver)
    text(
      "Enemy " + (currentEnemy + 1) + " HP: " + currentHealth,
      width / 2,
      topY
    );
  else {
    fill(255, gameOverTextAlpha);
    text(playerWon ? "Final Boss Defeated!" : "You Died!", width / 2, topY);
  }

  textSize(lineSize);
  let y = screenPos.y + separator + lineSize;
  if (!isIdle()) {
    if (dealState !== DealState.IDLE)
      text("Please wait... Rolling hand", width / 2, y);
    else if (showAttack) {
      let e = millis() - attackDisplayStart;
      if (e < ATTACK_DISPLAY_DURATION / 2)
        text(lastAttack.getCalcText(), width / 2, y);
      else if (e < ATTACK_DISPLAY_DURATION)
        text(lastAttack.getTotalText(), width / 2, y);
      else showAttack = false;
    }
  }

  let rightX =
    screenPos.x + screenSize.x + (width - screenSize.x - screenPos.x) / 2;
  text("Rerolls left: " + rerollsRemaining, rightX, y);
  text("Player HP: " + playerHealth, rightX, y + lineSize * 1.5);
  text("Shop Credit: " + totalOverkillPoints / 100, rightX, y + lineSize * 3);
  pop();
}

function drawHelpPanel() {
  push();
  fill(50, 50, 70, 240);
  noStroke();
  rect(40, 40, width - 80, height - 80, 20);
  closeHelpButton.update(mouseX, mouseY);
  closeHelpButton.draw();
  fill(255);
  textAlign(LEFT, TOP);
  textSize(height * 0.035);
  text("Scoring Guide:", HELP_X, HELP_Y_START);
  textSize(height * 0.025);
  let lines = [
    "COMBAT SCORING:",
    "  - Straight (5 in sequence): ×50",
    "  - Five of a kind: ×30",
    "  - Four of a kind: ×12",
    "  - Full House (3 + 2): ×2",
    "  - Three of a kind: ×6",
    "  - Two Pairs: ×3",
    "  - One Pair: ×3",
    "  - High value card: ×1",
    "",
    "CONTROLS:",
    "  - 'Roll Cards': Deal all 6 cards",
    "  - Select cards (click) to prepare for reroll",
    "  - 'Reroll': Reroll selected cards (max 6 rerolls total)",
    "  - 'Order': Sort dealt cards by value",
    "  - 'Attack': Use selected 5 cards to strike",
    "",
    "TIPS:",
    "  - Use 'Order' before choosing pairs or straights",
    "  - Higher dice sums score more base points",
    "  - Killing enemies heals you; balance damage & survival",
  ];
  for (let i = 0; i < lines.length; i++) {
    text(lines[i], HELP_X, HELP_Y_START + 40 + i * HELP_LINE_HEIGHT);
  }
  pop();
}

function drawKillLog() {
  push();
  let logTextSize = height * 0.018;
  let lineHeight = logTextSize * 1.25;
  let entrySpacing = lineHeight * 0.5;
  textSize(logTextSize);
  textAlign(LEFT, TOP);
  let panelX = helpButton.pos.x;
  let panelY = helpButton.pos.y + helpButton.size.y + height * 0.02;
  let panelW = width * 0.1;
  let panelH = height * 0.35;
  fill(20, 20, 20, 180);
  noStroke();
  rect(panelX - 10, panelY - 10, panelW + 20, panelH + 20, 8);
  push();
  clip(panelX, panelY, panelW, panelH);
  fill(255);
  let y = panelY - killLogScrollOffset * lineHeight;
  for (let info of killLog) {
    let lines = info.getSummary().split("\n");
    for (let line of lines) {
      text(line, panelX, y, panelW, lineHeight);
      y += lineHeight;
    }
    y += entrySpacing;
  }
  noClip();
  pop();
  pop();
}

function updateAndDrawUI() {
  if (showHelpPanel) {
    drawHelpPanel();
    return;
  }
  drawKillLog();

  let selectedCount = getSelectedCardCount();
  if (showAttack) {
    rollButton.setEnabled(false);
    rerollButton.setEnabled(false);
    orderButton.setEnabled(false);
    attackButton.setEnabled(false);
  } else {
    rollButton.setEnabled(rerollsRemaining > 0 && dealState === DealState.IDLE);
    rerollButton.setEnabled(
      selectedCount > 0 &&
        selectedCount <= HAND_SIZE &&
        rerollsRemaining > 0 &&
        dealState === DealState.IDLE
    );
    let allDealt = cards.every((c) => c.value > 0);
    orderButton.setEnabled(allDealt && dealState === DealState.IDLE);
    attackButton.setEnabled(
      selectedCount === HAND_SIZE && dealState === DealState.IDLE
    );
  }

  // Draw buttons
  rollButton.update(mouseX, mouseY);
  rollButton.draw();
  rerollButton.update(mouseX, mouseY);
  rerollButton.draw();
  orderButton.update(mouseX, mouseY);
  orderButton.draw();
  attackButton.update(mouseX, mouseY);
  attackButton.draw();
  helpButton.update(mouseX, mouseY);
  helpButton.draw();

  buyRerollsButton.setEnabled(totalOverkillPoints >= 500);
  buyRerollsButton.update(mouseX, mouseY);
  buyRerollsButton.draw();

  healButton.setEnabled(totalOverkillPoints >= 500);
  healButton.update(mouseX, mouseY);
  healButton.draw();

  doubleMultButton.setEnabled(totalOverkillPoints >= 1000);
  doubleMultButton.update(mouseX, mouseY);
  doubleMultButton.draw();

  nextBonusButton.setEnabled(totalOverkillPoints >= 1000);
  nextBonusButton.update(mouseX, mouseY);
  nextBonusButton.draw();

  // Shop labels
  push();
  textAlign(CENTER, TOP);
  textSize(height * 0.02);
  fill(totalOverkillPoints >= 5 ? 255 : 175);
  text(
    "5 pts → +2",
    buyRerollsButton.pos.x + buyRerollsButton.size.x / 2,
    buyRerollsButton.pos.y + buyRerollsButton.size.y + height * 0.005
  );
  fill(totalOverkillPoints >= 5 ? 255 : 175);
  text(
    "5 pts → +5HP",
    healButton.pos.x + healButton.size.x / 2,
    healButton.pos.y + healButton.size.y + height * 0.005
  );
  fill(totalOverkillPoints >= 10 ? 255 : 175);
  text(
    "10 pts → ×2",
    doubleMultButton.pos.x + doubleMultButton.size.x / 2,
    doubleMultButton.pos.y + doubleMultButton.size.y + height * 0.005
  );
  fill(totalOverkillPoints >= 10 ? 255 : 175);
  text(
    "10 pts → Half HP",
    nextBonusButton.pos.x + nextBonusButton.size.x / 2,
    nextBonusButton.pos.y + nextBonusButton.size.y + height * 0.005
  );
  pop();

  // Draw dice and cards
  dice1.drawFace(rollValue1);
  dice2.drawFace(rollValue2);
  noFill();
  stroke(255);
  rect(screenPos.x, screenPos.y, screenSize.x, screenSize.y);
  for (let c of cards) {
    c.update(mouseX, mouseY);
    c.draw();
  }
}

function handleUIInteractions() {
  if (buyRerollsButton.isMouseOver(mouseX, mouseY)) {
    if (totalOverkillPoints >= 500) {
      totalOverkillPoints -= 500;
      rerollsRemaining += 2;
    }
    return;
  }
  if (healButton.isMouseOver(mouseX, mouseY)) {
    if (totalOverkillPoints >= 500) {
      totalOverkillPoints -= 500;
      playerHealth += 5;
    }
    return;
  }
  if (doubleMultButton.isMouseOver(mouseX, mouseY)) {
    if (totalOverkillPoints >= 1000) {
      totalOverkillPoints -= 1000;
      doubleMultiplierNext = true;
    }
    return;
  }
  if (nextBonusButton.isMouseOver(mouseX, mouseY)) {
    if (totalOverkillPoints >= 1000) {
      totalOverkillPoints -= 1000;
      applyNextBonus = true;
    }
    return;
  }
  if (rollButton.isMouseOver(mouseX, mouseY)) {
    startDeal();
    cards.forEach((c) => (c.selected = false));
    return;
  }
  if (rerollButton.isMouseOver(mouseX, mouseY)) {
    startReroll();
    return;
  }
  if (orderButton.isMouseOver(mouseX, mouseY)) {
    let vals = cards.map((c) => c.value).sort((a, b) => a - b);
    cards.forEach((c, i) => (c.value = vals[i]));
    return;
  }
  if (attackButton.isMouseOver(mouseX, mouseY)) {
    let sel = cards.filter((c) => c.selected).map((c) => c.value);
    lastAttack = computeAttack(sel);
    if (doubleMultiplierNext) {
      lastAttack.total *= 2;
      doubleMultiplierNext = false;
    }
    showAttack = true;
    currentAttackSequence.push(lastAttack.total);
    currentHealth -= lastAttack.total;
    if (currentHealth <= 0) {
      playerHealth += 5;
      let overkill = -currentHealth;
      totalOverkillPoints += overkill;
      let maxHP = enemyHealths[currentEnemy];
      killLog.push(
        new EnemyKillInfo(
          currentEnemy,
          currentAttackSequence.length,
          currentAttackSequence.slice(),
          overkill,
          maxHP
        )
      );
      currentAttackSequence = [];
      currentEnemy++;
      if (applyNextBonus && currentEnemy < ENEMY_COUNT) {
        enemyHealths[currentEnemy] = int(enemyHealths[currentEnemy] * 0.5);
        applyNextBonus = false;
      }
      if (currentEnemy >= ENEMY_COUNT) {
        gameOver = true;
        gameOverStart = millis();
        playerWon = true;
      } else currentHealth = enemyHealths[currentEnemy];
    } else {
      playerHealth -= currentEnemy + 1;
      if (playerHealth <= 0) {
        playerHealth = 0;
        gameOver = true;
        playerWon = false;
        gameState = GameState.GAME_OVER;
      }
    }
    attackDisplayStart = millis();
    pendingRedraw = true;
    rerollsRemaining += 2;
    cards.forEach((c) => (c.selected = false));
    return;
  }
  // Card selection
  for (let c of cards) {
    if (c.isMouseOver(mouseX, mouseY)) {
      if (c.selected) c.selected = false;
      else if (getSelectedCardCount() < HAND_SIZE) c.selected = true;
      break;
    }
  }
}

function computeAttack(vals) {
  vals.sort((a, b) => a - b);
  let freq = Array(13).fill(0);
  let raw = 0;
  vals.forEach((v) => {
    freq[v]++;
    raw += POINTS_BY_SUM[v];
  });

  let type = AttackType.HIGH_CARD;
  let mult = 1;
  let isStraight = vals.every((v, i, a) => i === 0 || v === a[i - 1] + 1);
  if (isStraight) {
    type = AttackType.STRAIGHT;
    mult = STRAIGHT_MULT;
  } else if (freq[vals[0]] === HAND_SIZE) {
    type = AttackType.FIVE_KIND;
    mult = FIVE_KIND_MULT;
  } else {
    let four = -1,
      three = -1,
      pair = -1;
    for (let v = 2; v <= 12; v++) {
      if (freq[v] === 4) four = v;
      if (freq[v] === 3) three = v;
      if (freq[v] === 2) pair = v;
    }
    if (four !== -1) {
      type = AttackType.FOUR_KIND;
      raw = POINTS_BY_SUM[four] * 4;
      mult = FOUR_KIND_MULT;
    } else if (three !== -1 && pair !== -1) {
      type = AttackType.FULL_HOUSE;
      raw = POINTS_BY_SUM[three] * 3 * 6 + POINTS_BY_SUM[pair] * 2 * 3;
      mult = FULL_HOUSE_MULT;
    } else if (three !== -1) {
      type = AttackType.THREE_KIND;
      raw = POINTS_BY_SUM[three] * 3;
      mult = THREE_KIND_MULT;
    } else {
      let pairs = 0,
        lastPair = 0;
      for (let v = 2; v <= 12; v++) {
        if (freq[v] === 2) {
          pairs++;
          lastPair = v;
        }
      }
      if (pairs >= 2) {
        type = AttackType.TWO_PAIR;
        raw = vals.reduce(
          (s, v) => (freq[v] === 2 ? s + POINTS_BY_SUM[v] * 2 : s),
          0
        );
        mult = TWO_PAIR_MULT;
      } else if (pairs === 1) {
        type = AttackType.ONE_PAIR;
        raw = POINTS_BY_SUM[lastPair] * 2;
        mult = ONE_PAIR_MULT;
      } else {
        let high = vals[vals.length - 1];
        raw = POINTS_BY_SUM[high];
      }
    }
  }
  return new AttackResult(raw, mult, raw * mult, vals, type);
}

// Classes
class AttackResult {
  constructor(rawSum, multiplier, total, hand, type) {
    this.rawSum = rawSum;
    this.multiplier = multiplier;
    this.total = total;
    this.hand = [...hand];
    this.type = type;
  }
  getCalcText() {
    return `Hand: ${this.hand} → ${this.type}, raw=${this.rawSum}, mult=${this.multiplier}, total=${this.total}`;
  }
  getTotalText() {
    return `Attack total points: ${this.total}`;
  }
}

class EnemyKillInfo {
  constructor(index, attacks, damageValues, overkill, maxHealth) {
    this.index = index;
    this.attacks = attacks;
    this.damageValues = [...damageValues];
    this.overkill = overkill;
    this.maxHealth = maxHealth;
  }
  getSummary() {
    let sb = `Enemy ${this.index + 1} (HP: ${this.maxHealth})\nKilled in ${
      this.attacks
    } attacks:\n`;
    sb += this.damageValues.join(" - ");
    sb += `\n${this.overkill} over kill points awarded`;
    return sb;
  }
}

class Card {
  constructor(pos, size, maxOff) {
    this.pos = pos;
    this.size = size;
    this.hoverOff = 0;
    this.targetOff = 0;
    this.maxOff = maxOff;
    this.selected = false;
    this.value = 0;
    this.die1 = 0;
    this.die2 = 0;
  }
  update(mx, my) {
    this.targetOff =
      this.selected || this.isMouseOver(mx, my) ? this.maxOff : 0;
    this.hoverOff += (this.targetOff - this.hoverOff) * 0.2;
  }
  isMouseOver(mx, my) {
    return (
      mx >= this.pos.x &&
      mx <= this.pos.x + this.size.x &&
      my >= this.pos.y - this.hoverOff &&
      my <= this.pos.y + this.size.y
    );
  }
  draw() {
    push();
    fill(255);
    stroke(255);
    strokeWeight(1);
    rect(this.pos.x, this.pos.y - this.hoverOff, this.size.x, this.size.y, 10);
    if (this.value > 0) this.drawSpecialOutline();
    if (this.value > 0) {
      fill(0);
      noStroke();
      textAlign(CENTER, CENTER);
      textSize(min(this.size.x, this.size.y) * 0.6);
      text(
        this.value,
        this.pos.x + this.size.x / 2,
        this.pos.y - this.hoverOff + this.size.y / 2
      );
    }
    pop();
  }
  drawSpecialOutline() {
    let alpha = 128 + 127 * sin(millis() / 500);
    let baseCol;
    if ([2, 12].includes(this.value)) baseCol = color(154, 197, 219);
    else if ([3, 11].includes(this.value)) baseCol = color(203, 227, 240);
    else if ([4, 10].includes(this.value)) baseCol = color(241, 247, 251);
    else return;
    noFill();
    stroke(red(baseCol), green(baseCol), blue(baseCol), alpha);
    strokeWeight(3);
    rect(this.pos.x, this.pos.y - this.hoverOff, this.size.x, this.size.y, 10);
    strokeWeight(1);
  }
}

class Button {
  constructor(pos, size, label, baseColor, labelSize) {
    this.pos = pos;
    this.size = size;
    this.label = label;
    this.baseColor = baseColor;
    this.hovered = false;
    this.enabled = true;
    this.growth = 5;
    this.labelSize = labelSize;
  }
  setEnabled(e) {
    this.enabled = e;
  }
  isMouseOver(mx, my) {
    let w = this.size.x + (this.enabled ? this.growth : 0);
    let h = this.size.y + (this.enabled ? this.growth : 0);
    let x = this.pos.x - (w - this.size.x) / 2;
    let y = this.pos.y - (h - this.size.y) / 2;
    return this.enabled && mx >= x && mx <= x + w && my >= y && my <= y + h;
  }
  update(mx, my) {
    this.hovered = this.isMouseOver(mx, my);
  }
  draw() {
    push();
    let w = this.size.x + (this.hovered && this.enabled ? this.growth : 0);
    let h = this.size.y + (this.hovered && this.enabled ? this.growth : 0);
    let x = this.pos.x - (w - this.size.x) / 2;
    let y = this.pos.y - (h - this.size.y) / 2;
    let c = this.enabled
      ? this.hovered
        ? lerpColor(this.baseColor, color(0), 0.1)
        : this.baseColor
      : color(100);
    noStroke();
    fill(c);
    rect(x, y, w, h, 5);
    textAlign(CENTER, CENTER);
    textSize(this.labelSize);
    fill(this.enabled ? 255 : 200);
    text(this.label, x + w / 2, y + h / 2);
    pop();
  }
}

class Dice {
  constructor(pos, size, spacing) {
    this.pos = pos;
    this.size = size;
    this.spacing = spacing;
    this.dotSize = this.size.y / 4;
    this.spacing = this.size.y / 10;
    this.computePips();
    this.buildFaces();
  }
  computePips() {
    this.pips = [];
    let c = p5.Vector.add(this.pos, p5.Vector.mult(this.size, 0.5));
    let r = this.dotSize,
      s = this.spacing;
    this.pips.push(c.copy());
    this.pips.push(createVector(c.x - r - s, c.y - r - s));
    this.pips.push(createVector(c.x + r + s, c.y + r + s));
    this.pips.push(createVector(c.x - r - s, c.y + r + s));
    this.pips.push(createVector(c.x + r + s, c.y - r - s));
    this.pips.push(createVector(c.x - r - s, c.y));
    this.pips.push(createVector(c.x + r + s, c.y));
  }
  buildFaces() {
    this.faces = [];
    this.faces.push([0]);
    this.faces.push([1, 2]);
    this.faces.push([0, 1, 2]);
    this.faces.push([1, 2, 3, 4]);
    this.faces.push([0, 1, 2, 3, 4]);
    this.faces.push([1, 2, 3, 4, 5, 6]);
  }
  drawFace(v) {
    push();
    fill(255);
    stroke(0);
    strokeWeight(1);
    rect(this.pos.x, this.pos.y, this.size.x, this.size.y, 10);
    noStroke();
    fill(0);
    let face = this.faces[v - 1];
    for (let idx of face)
      circle(this.pips[idx].x, this.pips[idx].y, this.dotSize);
    pop();
  }
}
