// ─── GLOBAL STATE ──────────────────────────────────────────────────────────────
let menu1Pos, menu2Pos, menuSize, text1Pos, text2Pos, barSize;
let moveUp = false, moveDown = false, moveLeft = false, moveRight = false;
let touchJustReleased = false;
const STATE_START = 0, MENU = 1, GAME = 2, STATE_HELP = 3, GAME_OVER = 4;
let enemiesKilled = 0, levelsGained = 0, gameState = STATE_START;

const options1 = ["Move speed", "Fire speed", "Damage", "Health", "Shield"];
const options2 = ["Explosion", "Sniper bullet", "Multi-shot", "EMP Pulse"];
let options1Lvl = [0,0,0,0,0], options2Lvl = [0,0,0,0];
let chosenOption1, chosenOption2;

let textMaxWidth, smallestSize;

// ─── PLAYER, ENEMIES, BULLETS ────────────────────────────────────────────────────
let player;
let enemies = [], bullets = [], enemyBullets = [];

// ─── ABILITIES ───────────────────────────────────────────────────────────────────
let lastExplosionTime = 0, lastSniperTime = 0, lastMultiTime = 0, lastEMPTime = 0;
let sniperActive = false, empActive = false;
let sniperStartTime = 0, empStartTime = 0;

// ─── SPAWNING & SHOOTING ─────────────────────────────────────────────────────────
let lastSpawnTime = 0, spawnInterval = 1500, spawnRateDecrease = 30;
let lastShotTime = 0, shootDelay = 1000;
let bulletDamage = 1.0;

// ─── SETUP ──────────────────────────────────────────────────────────────────────
function setup() {
  createCanvas(windowWidth, windowHeight);
  textAlign(CENTER, CENTER);
  textFont('sans-serif');

  // Menu geometry
  let temp1 = width/20, temp2 = height/3;
  menu1Pos = createVector(temp1, temp2);
  menuSize = createVector(temp1*8, temp2);
  menu2Pos = createVector(menu1Pos.x + menuSize.x + temp1*2, temp2);
  text1Pos = createVector(menu1Pos.x + menuSize.x/2, menu1Pos.y + menu1Pos.y/3);
  text2Pos = createVector(menu2Pos.x + menuSize.x/2, menu2Pos.y + menu2Pos.y/3);

  textMaxWidth = menuSize.y * 0.9;
  smallestSize = 100;
  for (let s of options1) smallestSize = min(smallestSize, sizeForWidth(s, textMaxWidth, 20));
  for (let s of options2) smallestSize = min(smallestSize, sizeForWidth(s, textMaxWidth, 20));

  chooseOptions();
  player = new Player(createVector(width/2, height/2), 30, 10, 5);

  barSize = createVector(width/5, height/24);
}

// ─── DRAW LOOP ──────────────────────────────────────────────────────────────────
function draw() {
  background(0);
  switch(gameState) {
    case STATE_START: drawStartMenu(); break;
    case MENU:        menu();          break;
    case GAME:        gameDraw();      break;
    case STATE_HELP:  drawHelp();      break;
    case GAME_OVER:   drawGameOverScreen(); break;
  }
  touchJustReleased = false;
}

// ─── INPUT HANDLERS ─────────────────────────────────────────────────────────────

function mouseReleased() {
  touchJustReleased = true;
  handleButtonTap(mouseX, mouseY);
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

// ─── START MENU ─────────────────────────────────────────────────────────────────
function drawStartMenu() {
  textSize(sizeForWidth("ZENITH", width/3, 64));
  fill(255);
  text("ZENITH", width/2, height/4);

  let bs = createVector(width/3, height/6);
  let p1 = createVector(width/2 - bs.x/2, 2*height/3 - bs.y - 20);
  let p2 = createVector(width/2 - bs.x/2, 2*height/3);

  // Play
  fill(255, isMouseOver(p1, bs) ? 150 : 50);
  rect(p1.x, p1.y, bs.x, bs.y, 10);
  fill(0);
  textSize(sizeForWidth("Play", bs.x/3, 64));
  text("Play", p1.x + bs.x/2, p1.y + bs.y/2);

  // Help
  fill(255, isMouseOver(p2, bs) ? 150 : 50);
  rect(p2.x, p2.y, bs.x, bs.y, 10);
  fill(0);
  text("Help", p2.x + bs.x/2, p2.y + bs.y/2);

  if (touchJustReleased) {
    if      (isMouseOver(p1, bs)) gameState = MENU;
    else if (isMouseOver(p2, bs)) gameState = STATE_HELP;
  }
}

// ─── UPGRADE MENU ───────────────────────────────────────────────────────────────
function menu() {
  fill(255, isMouseOver(menu1Pos, menuSize)?150:50);
  rect(menu1Pos.x, menu1Pos.y, menuSize.x, menuSize.y, 10);
  fill(255, isMouseOver(menu2Pos, menuSize)?150:50);
  rect(menu2Pos.x, menu2Pos.y, menuSize.x, menuSize.y, 10);

  fill(255);
  textAlign(CENTER);
  textSize(isMouseOver(menu1Pos, menuSize)?smallestSize*1.05:smallestSize);
  text(
    `${options1[chosenOption1]}\nLv ${options1Lvl[chosenOption1]} → ${options1Lvl[chosenOption1]+1}`,
    text1Pos.x, text1Pos.y
  );

  textSize(isMouseOver(menu2Pos, menuSize)?smallestSize*1.05:smallestSize);
  text(
    `${options2[chosenOption2]}\nLv ${options2Lvl[chosenOption2]} → ${options2Lvl[chosenOption2]+1}`,
    text2Pos.x, text2Pos.y
  );

  if (touchJustReleased) {
    if (isMouseOver(menu1Pos, menuSize)) {
      options1Lvl[chosenOption1]++;
      applyUpgrade(chosenOption1);
      gameState = GAME;
      chooseOptions();
    }
    if (isMouseOver(menu2Pos, menuSize)) {
      options2Lvl[chosenOption2]++;
      if (chosenOption2==0) lastExplosionTime = millis() - getExplosionCooldown();
      if (chosenOption2==1) lastSniperTime    = millis() - getSniperCooldown();
      if (chosenOption2==2) lastMultiTime     = millis() - getMultiCooldown();
      if (chosenOption2==3) lastEMPTime       = millis() - getEMPCooldown();
      gameState = GAME;
      chooseOptions();
    }
  }
}

// ─── MAIN GAME DRAW ────────────────────────────────────────────────────────────
function gameDraw() {
  if (player.health <= 0) {
    gameState = GAME_OVER;
    return;
  }

  // shield regen
  if (player.shieldOnCooldown && millis() - player.shieldRegenTimer >= player.shieldRegenDelay) {
    player.shieldCurrent = player.shieldMax;
    player.shieldOnCooldown = false;
  }

  drawUI();
  updatePlayerMovement();
  player.display();

  // auto-fire nearest
  if (millis() - lastShotTime > shootDelay) {
    let e = getNearestEnemy();
    if (e) {
      bullets.push(new Bullet(player.position.copy(), e.pos.copy()));
      lastShotTime = millis();
    }
  }

  updateBullets();
  handleEnemySpawning();
  updateEnemies();
  updateEnemyBullets();
}

// ─── DRAW UI ───────────────────────────────────────────────────────────────────
function drawUI() {
  noStroke();
  // XP bar
  fill(0,200,255);
  let xpW = map(player.xp, 0, max(1, player.xpToNextLevel), 0, barSize.x);
  rect(10, 10, xpW, barSize.y);
  noFill(); stroke(255);
  rect(10, 10, barSize.x, barSize.y);
  fill(255);
  textSize(sizeForWidth(`${player.xp}/${player.xpToNextLevel}`, width/30, 64));
  textAlign(LEFT, CENTER);
  text(`${player.xp}/${player.xpToNextLevel}`, barSize.x + 20, 30);

  // Health bar
  noStroke(); fill(255,0,0);
  let hW = map(player.health, 0, player.maxHealth, 0, barSize.x);
  rect(10, barSize.y+20, hW, barSize.y);
  noFill(); stroke(255);
  rect(10, barSize.y+20, barSize.x, barSize.y);
  fill(255);
  text(`${player.health}/${player.maxHealth}`, barSize.x + 20, barSize.y+40);

  // Shield bar
  if (player.shieldMax>0) {
    noStroke();
    if (!player.shieldOnCooldown) fill(0,255,0);
    else {
      fill(80);
      rect(10, barSize.y*2+30, barSize.x, barSize.y);
      let prog = constrain((millis()-player.shieldRegenTimer)/player.shieldRegenDelay, 0, 1);
      noStroke(); fill(0,200,255);
      rect(10, barSize.y*2+30, prog*barSize.x, barSize.y);
      noFill(); stroke(255);
    }
    noStroke(); fill(255);
    let sW = map(player.shieldCurrent, 0, player.shieldMax, 0, barSize.x);
    rect(10, barSize.y*2+30, sW, barSize.y);
    text(`${player.shieldCurrent}/${player.shieldMax}`, barSize.x+20, barSize.y*2+50);
  }

  // Abilities
  drawAbilityButton(0, "Explosion", options2Lvl[0], lastExplosionTime, getExplosionCooldown(), color(0,200,255));
  drawAbilityButton(1, "Sniper",    options2Lvl[1], lastSniperTime,    getSniperCooldown(),    color(200,200,0));
  drawAbilityButton(2, "Multi-shot",options2Lvl[2], lastMultiTime,     getMultiCooldown(),     color(0,200,0));
  drawAbilityButton(3, "EMP Pulse", options2Lvl[3], lastEMPTime,       getEMPCooldown(),       color(150,0,255));
}

function drawAbilityButton(idx, label, lvl, lastTime, cd, colr) {
  if (lvl<=0) return;
  let sz = createVector(width/12, height/12);
  let pos = createVector(width - sz.x - 10, idx*(sz.y+10) + 10);
  let ready = millis() - lastTime >= cd;

  noStroke();
  fill( ready ? colr : 80 );
  rect(pos.x, pos.y, sz.x, sz.y, 5);

  fill(idx===1 ? 0 : 255);
  textSize(sizeForWidth(label, sz.x-20, 32));
  textAlign(CENTER, CENTER);
  text(label, pos.x+sz.x/2, pos.y+sz.y/2);

  if (!ready) {
    let frac = constrain((millis()-lastTime)/cd, 0, 1);
    noStroke(); fill(255,0,0,150);
    rect(pos.x, pos.y, sz.x*(1-frac), sz.y, 5);
  }
}

// ─── GAME OVER ─────────────────────────────────────────────────────────────────
function drawGameOverScreen() {
  background(0);
  fill(255); textAlign(CENTER, CENTER);
  textSize(sizeForWidth("Game Over", width*0.6,64));
  text("Game Over", width/2, height/4);

  textSize(sizeForWidth(`Enemies Killed: ${enemiesKilled}`, width/4,64));
  text(`Levels Gained: ${levelsGained}\nEnemies Killed: ${enemiesKilled}`,
       width/2, height/2 - 20);

  let bs = createVector(width/4, height/6);
  let pRestart = createVector(width/2 - bs.x - 20, height*3/4);
  let pMenu    = createVector(width/2 + 20, height*3/4);

  fill(255, isMouseOver(pRestart, bs)?150:50);
  rect(pRestart.x,pRestart.y,bs.x,bs.y,10);
  fill(0); text("Restart", pRestart.x+bs.x/2, pRestart.y+bs.y/2);

  fill(255, isMouseOver(pMenu, bs)?150:50);
  rect(pMenu.x,pMenu.y,bs.x,bs.y,10);
  fill(0); text("Main Menu", pMenu.x+bs.x/2, pMenu.y+bs.y/2);

  if (touchJustReleased) {
    if (isMouseOver(pRestart, bs)) {
      resetGame(); gameState = GAME;
    }
    if (isMouseOver(pMenu, bs)) {
      resetGame(); gameState = STATE_START;
    }
  }
}

// ─── HELP SCREEN ───────────────────────────────────────────────────────────────
function drawHelp() {
  background(0);
  fill(255); textAlign(CENTER, TOP);
  textSize(sizeForWidth("Use WASD or arrow keys to move", 2*width/3,64));
  let h = `Use WASD or arrow keys to move
Auto-fire at nearest enemy
Defeat enemies for XP to level up
Level up to gain new powers

Click to return`;
  text(h, 0, height*0.15, width*0.9, height*0.85);
  if (touchJustReleased) gameState = STATE_START;
}

// ─── RESET ─────────────────────────────────────────────────────────────────────
function resetGame() {
  player.health        = player.maxHealth;
  player.xp            = 0;
  player.level         = 1;
  player.xpToNextLevel = 10;
  player.shieldMax     = 0;
  player.shieldCurrent = 0;
  player.shieldOnCooldown = false;

  enemies = []; bullets = []; enemyBullets = [];
  lastSpawnTime = millis();
  enemiesKilled = 0; levelsGained  = 0;
  options1Lvl = [0,0,0,0,0];
  options2Lvl = [0,0,0,0];
  chooseOptions();
}

// ─── GAME LOGIC ────────────────────────────────────────────────────────────────
function updatePlayerMovement() {
  // read all four keys every frame
  let dx = 0, dy = 0;
  if ( keyIsDown(87)    || keyIsDown(UP_ARROW)    ) dy -= 1;  // W or ↑
  if ( keyIsDown(83)    || keyIsDown(DOWN_ARROW)  ) dy += 1;  // S or ↓
  if ( keyIsDown(65)    || keyIsDown(LEFT_ARROW)  ) dx -= 1;  // A or ←
  if ( keyIsDown(68)    || keyIsDown(RIGHT_ARROW) ) dx += 1;  // D or →

  // only move if there’s input
  if (dx !== 0 || dy !== 0) {
    let d = createVector(dx, dy).normalize().mult(player.maxSpeed);
    player.position.add(d);
  }

  // constrain to screen
  player.position.x = constrain(player.position.x, player.halfSize, width - player.halfSize);
  player.position.y = constrain(player.position.y, player.halfSize, height - player.halfSize);
}


function handleButtonTap(tx, ty) {
  let sz = createVector(width/12, height/12);
  // Explosion
  if (options2Lvl[0]>0 && millis()-lastExplosionTime>=getExplosionCooldown()) {
    let eb = createVector(width - sz.x - 10, 10);
    if (tx>eb.x && tx<eb.x+sz.x && ty>eb.y && ty<eb.y+sz.y) {
      enemies = []; enemyBullets = []; lastExplosionTime = millis();
      return;
    }
  }
  // Sniper
  if (options2Lvl[1]>0 && millis()-lastSniperTime>=getSniperCooldown()) {
    let sb = createVector(width - sz.x - 10, sz.y + 20);
    if (tx>sb.x && tx<sb.x+sz.x && ty>sb.y && ty<sb.y+sz.y) {
      sniperActive = true; sniperStartTime = millis(); lastSniperTime = millis();
      return;
    }
  }
  // Multi-shot
  if (options2Lvl[2]>0 && millis()-lastMultiTime>=getMultiCooldown()) {
    let mb = createVector(width - sz.x - 10, sz.y*2 + 30);
    if (tx>mb.x && tx<mb.x+sz.x && ty>mb.y && ty<mb.y+sz.y) {
      let shots = options2Lvl[2]*8;
      for (let i=0; i<shots; i++) {
        let angle = i * TWO_PI / shots;
        let dir = p5.Vector.fromAngle(angle);
        let tgt = p5.Vector.add(player.position, dir.mult(10));
        bullets.push(new Bullet(player.position.copy(), tgt));
      }
      lastMultiTime = millis();
      return;
    }
  }
  // EMP
  if (options2Lvl[3]>0 && millis()-lastEMPTime>=getEMPCooldown()) {
    let eb = createVector(width - sz.x - 10, sz.y*3 + 40);
    if (tx>eb.x && tx<eb.x+sz.x && ty>eb.y && ty<eb.y+sz.y) {
      empActive = true; empStartTime = millis(); lastEMPTime = millis();
    }
  }
}

function updateBullets() {
  if (sniperActive && millis()-sniperStartTime > 5000) sniperActive = false;
  for (let i=bullets.length-1; i>=0; i--) {
    let b = bullets[i];
    b.move(); b.display();
    let hit = false;
    for (let j=enemies.length-1; j>=0; j--) {
      let e = enemies[j];
      if (b.hits(e)) { e.health -= bulletDamage; hit = true; }
    }
    if ((!sniperActive && hit) || b.offScreen()) bullets.splice(i,1);
  }
}

function handleEnemySpawning() {
  if (millis() - lastSpawnTime > spawnInterval) {
    spawnEnemy();
    lastSpawnTime = millis();
    if (spawnInterval > 20 && millis() % 5000 < 50) spawnInterval -= spawnRateDecrease;
  }
}

function spawnEnemy() {
  let buf=50, x, y;
  let side = floor(random(4));
  if (side===0) { x=random(width);  y=-buf; }
  else if (side===1) { x=width+buf;  y=random(height); }
  else if (side===2) { x=random(width);  y=height+buf; }
  else              { x=-buf;        y=random(height); }
  let types=["sprinter","tank","splitter","normal"], t=3, r=random();
  if (r>0.9) t=2; else if (r>0.8) t=1; else if (r>0.6) t=0;
  enemies.push(new Enemy(createVector(x,y), types[t]));
}

function getNearestEnemy() {
  let best=null, bd=Infinity;
  for (let e of enemies) {
    let d = p5.Vector.dist(player.position, e.pos);
    if (d<bd) { bd=d; best=e; }
  }
  return best;
}

function updateEnemies() {
  if (empActive && millis()-empStartTime>5000) empActive=false;
  for (let i=enemies.length-1; i>=0; i--) {
    let e = enemies[i];
    if (p5.Vector.dist(e.pos, player.position)<30) {
      if (player.shieldCurrent>0) {
        player.shieldCurrent--;
        if (player.shieldCurrent===0) {
          player.shieldOnCooldown=true;
          player.shieldRegenTimer=millis();
        }
      } else {
        player.health -= e.startingHealth;
      }
      enemies.splice(i,1);
      continue;
    }
    if (!empActive) e.move(player.position);
    e.display();
    if ((e.type==="tank"||e.type==="splitter") && millis()-e.lastShotTime>=2000) {
      enemyBullets.push(new Bullet(e.pos.copy(), player.position.copy()));
      e.lastShotTime = millis();
    }
    if (e.isDead()) {
      enemiesKilled++;
      player.xp += e.startingHealth;
      if (player.xp >= player.xpToNextLevel) {
        player.level++; levelsGained++;
        player.xp -= player.xpToNextLevel;
        player.xpToNextLevel = 10*player.level;
        gameState = MENU;
      }
      if (e.type==="splitter") {
        let tmp = min(floor(1000/spawnInterval),5);
        for (let k=0; k<3+tmp; k++) {
          let off = p5.Vector.random2D().mult(20);
          enemies.push(new Enemy(p5.Vector.add(e.pos, off), "sprinter"));
        }
      }
      enemies.splice(i,1);
    }
  }
}

function updateEnemyBullets() {
  for (let i=enemyBullets.length-1; i>=0; i--) {
    let b = enemyBullets[i];
    b.move();
    fill(255,0,0); noStroke();
    ellipse(b.pos.x, b.pos.y, b.r*2);

    if (p5.Vector.dist(b.pos, player.position) < b.r + player.halfSize) {
      player.health--;
      enemyBullets.splice(i,1);
    } else if (b.offScreen()) {
      enemyBullets.splice(i,1);
    }
  }
}

// ─── UTILITIES ─────────────────────────────────────────────────────────────────
function sizeForWidth(str, maxW, baseTS) {
  textSize(baseTS);
  return baseTS * (maxW / textWidth(str));
}

function isMouseOver(p, s) {
  return mouseX > p.x && mouseX < p.x + s.x
      && mouseY > p.y && mouseY < p.y + s.y;
}

function chooseOptions() {
  chosenOption1 = floor(random(options1.length));
  chosenOption2 = floor(random(options2.length));
}

function applyUpgrade(idx) {
  let opt = options1[idx];
  if (opt==="Move speed")      player.maxSpeed += 0.25;
  else if (opt==="Fire speed") shootDelay = max(50, shootDelay - 10);
  else if (opt==="Damage")     bulletDamage += 0.1;
  else if (opt==="Health") {
    player.maxHealth += 2;
    player.health = player.maxHealth;
  } else if (opt==="Shield") {
    player.shieldMax++;
    player.shieldCurrent = player.shieldMax;
    player.shieldOnCooldown = false;
  }
}

function getExplosionCooldown() { return max(0, 30000 - options2Lvl[0]*250); }
function getSniperCooldown()    { return max(0, 30000 - options2Lvl[1]*250); }
function getMultiCooldown()     { return max(0, 5000  - options2Lvl[2]*100); }
function getEMPCooldown()       { return max(0, 20000 - options2Lvl[3]*200); }

// ─── CLASSES ───────────────────────────────────────────────────────────────────
class Bullet {
  constructor(st, tg) {
    this.pos = st.copy();
    this.vel = p5.Vector.sub(tg, st).normalize().mult(10);
    this.r   = 5;
  }
  move() { this.pos.add(this.vel); }
  display() {
    fill(255,150,0); noStroke();
    ellipse(this.pos.x, this.pos.y, this.r*2);
  }
  hits(e) {
    return p5.Vector.dist(this.pos, e.pos) < this.r + 15;
  }
  offScreen() {
    return (this.pos.x<0||this.pos.x>width||this.pos.y<0||this.pos.y>height);
  }
}

class Enemy {
  constructor(st, t) {
    this.pos = st.copy();
    this.type = t;
    switch(t) {
      case "sprinter": this.speed=7;   this.health=1; break;
      case "tank":     this.speed=0.5; this.health=5; break;
      case "splitter": this.speed=0.2; this.health=3; break;
      default:         this.speed=2;   this.health=2; break;
    }
    this.startingHealth = this.health;
    this.lastShotTime   = millis();
  }
  move(tgt) {
    let d = p5.Vector.sub(tgt, this.pos);
    if (d.mag()>1) {
      d.setMag(this.speed);
      this.pos.add(d);
    }
  }
  display() {
    noStroke();
    switch(this.type) {
      case "sprinter": fill(255,0,0); break;
      case "tank":     fill(0,0,255); break;
      case "splitter": fill(255,255,0); break;
      default:         fill(0,255,255);
    }
    ellipse(this.pos.x, this.pos.y, 30);
  }
  isDead() { return this.health <= 0; }
}

class Player {
  constructor(p, sz, mh, ms) {
    this.position = p.copy();
    this.size     = sz;
    this.halfSize = sz/2;
    this.maxHealth= mh;
    this.health   = mh;
    this.maxSpeed = ms;
    this.xp       = 0;
    this.level    = 1;
    this.xpToNextLevel = 10;
    this.shieldMax = 0;
    this.shieldCurrent = 0;
    this.shieldRegenDelay = 10000;
    this.shieldRegenTimer = 0;
    this.shieldOnCooldown = false;
  }
  display() {
    fill(255); noStroke();
    ellipse(this.position.x, this.position.y, this.size);
  }
}
