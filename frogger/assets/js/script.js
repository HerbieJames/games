// DECLARATIONS
// --TOOLING DECLARATIONS--
const startBtnEl = document.getElementById("startBtnEl");
const upBtnEl    = document.getElementById("btnUpEl");
const downBtnEl  = document.getElementById("btnDownEl");
const leftBtnEl  = document.getElementById("btnLeftEl");
const rightBtnEl = document.getElementById("btnRightEl");
const grid       = document.getElementById("gameDisplayEl");
const gridXinit  = 1;
const gridYinit  = 2;
const gridX      = 12;
const gridY      = 12;
const imgRoot    = "./frogger/assets/images/";
let playerImg = "frog1.PNG";
let player;

// --FROGGER DECLARATIONS--
let roadRows  = [];
let waterRows = [];
let grassRows = [];
let logRows   = {};
let carRows   = {};
let active    = false;
let tick      = 0;
let score     = 0;
let lives     = 0;
let fly;

// FUNCTIONS
// --TOOLING FUNCTIONS--
/**Returns the tile element on or closest ahead of a given co-ordinate on the grid.
 * @param {Number} x coordinate in grid with left as 1
 * @param {Number} y coordinate in grid with top as 1
*/
function nearestTile(x,y) {
    var element;
    for (let i = 0; i <= grid.childElementCount; i++) {
        var head = document.querySelector(`#gameDisplayEl :nth-child(${i})`);
        if (head == undefined)                                           {}
        else if (!head.classList.contains("tile"))                       {}
        else if (head.style.gridRow < y)                                 {}
        else if ((head.style.gridColumn < x)&&(head.style.gridRow == y)) {}
        else {
            element = head; 
            break;
        }
    }
    return element;
}

/**Returns all elements at a given co-ordinate on the grid.
 * @param {Number} x coordinate in grid with left as 1
 * @param {Number} y coordinate in grid with top as 1
*/
function allAtXY(x,y) {
    var elements = [];
    for (let i = 0; i <= grid.childElementCount; i++) {
        var head = document.querySelector(`#gameDisplayEl :nth-child(${i})`);
        if (head == undefined) {}
        else if ((head.style.gridColumn == x)&&(head.style.gridRow == y)) {
            elements.push(head);
        }
    }
    return elements;
}

/**Creates linebreaks between rows in grid and spaces (<small>" "</small>) between cells
 * for non-CSS functionality
 */
function gridHTML() {
    for (let i = (gridYinit + 1); i <= gridY; i++) {
        var neighbor = nearestTile(gridXinit,i);
        if (neighbor != undefined) {
            var br = document.createElement('br');
            neighbor.insertAdjacentElement("beforebegin", br);
        }
    }
    for (let j = gridYinit; j <= gridY; j++) {
        for (let i = (gridXinit + 1); i <= gridX; i++) {
            var neighbor = nearestTile(i,j);
            if (neighbor != undefined) {
                var cell = document.createElement('small');
                cell.innerHTML = " ";
                neighbor.insertAdjacentElement("beforebegin", cell);
            }
        }
    }
}

/**Creates an image with src, id and class 
 * at a specified location on the grid, and
 * appropriate position in the DOM
 * @param {Number} x       column position of image in grid
 * @param {Number} y       row position of image in grid
 * @param {String} src     src of image (in imgRoot)
 * @param {Array } classes Array of strings; classes for image to assume
 * @param {String} id      id for image to assume
 * @return {Node }         the generated element
*/
function initSprite(x, y, src, classes, id) {
    var img = document.createElement('img');
    var neighbor = nearestTile(x,y);
    img.classList.add("sprite");
    img.alt = " ";
    img.style.gridColumn = x;
    img.style.gridRow    = y;
    if (src != undefined) { 
        src = imgRoot.concat(src);
        img.src = src;
    }
    if (classes != undefined) { 
        classes.forEach((element) => { img.classList.add(element); });
    }
    if (id  !== undefined) { img.id  = id; }
    if (neighbor != undefined) {
        neighbor.insertAdjacentElement("beforebegin", img);
    } else {
        grid.appendChild(img);
    }
    if (id  !== undefined) {
        console.log('initSprite(): "#'+id, "created before", neighbor+'"', img);
    }
    return img;
}

/**Sets the co-ordiated of a given element on the grid and updates their position in the DOM.
 * @param {Element} element the target HTML element
 * @param {Number}  x       row position of element in grid
 * @param {Number}  y       column position of element in grid
*/
function setSpriteXY(element, x, y) {
    var neighbor = nearestTile(x,y);
    if (neighbor != undefined) { neighbor.before(element); }
    element.style.gridColumn = x;
    element.style.gridRow = y;
}

/**Moves a given element on the grid a specified distance and updates their position in the DOM.
 * @param {Element} element the target HTML element
 * @param {Number}  x       row distance where positive is right
 * @param {Number}  y       column distance where posititve is down
*/
function moveSprite(element, x, y) {
    var neighbor = nearestTile(element.style.gridColumn - -x,element.style.gridRow - -y);
    if (neighbor != undefined) { neighbor.before(element); }
    element.style.gridColumn -= -x;
    element.style.gridRow -= -y;
}

/**Sets a given element's rotation to a specified angle in degrees.
 * @param {Element} element the target HTML element
 * @param {Number}  deg     orientation to set element where 0 is up
*/
function setSpriteDeg(element, deg) {
    element.style.transform = `rotate(${deg}deg)`;
}

/**Returns the grid co-ordinates of a given element
 * @param {Element} element the target HTML element
 * @return {Object}         the ".x" and ".y" values.
*/
function getSpriteXY(element) {
    var x = element.style.gridColumn
    var y = element.style.gridRow
    return {x: x, y :y}
}

/**Returns whether a given coordinate on the grid can be moved to by the player.
 * @param  {NodeList} ahead    All elements at a given coordinate
 * @return {Object}            An array of boolean elements named "moveable", "score" and "death".
*/
function careAhead(ahead) {
    var moveable = true;
    var death    = false;
    var score    = false;
    var plySprt
    if (ahead.length == 0) {
        moveable = false;
        console.log("BOUNDARY", ahead);
    } else {
        ahead.forEach((element) => {
            if (element.classList.contains("obst"))  { moveable = false; }
            if (element.classList.contains("point")) { score    = true;  }
            if (element.classList.contains("hurts")) { death    = true;  }
            if (element.id == "player")              { plySprt  = true;  }
        });
        ahead.forEach((element) => { // for FROGGER only.
            if (element.classList.contains("log"))   { death    = false;  }
        });
    }
    return {moveable: moveable, death: death, score: score, player: plySprt};
}

/**Creates a sprite with id "player" and src playerImg.
 */
function initPlayer() {
    initSprite(gridXinit, gridYinit, playerImg, null, "player");
    player = document.getElementById("player");
}

/**Sets the player's coordinates to the centre of the bottom row
 */
function setPlayer() {
    active = true;
    setSpriteXY(player, Math.ceil(gridX/2), gridY);
    setTimeout(enableControl, 250);
    player.src = imgRoot + playerImg;
}

/**Removes the player and determines whether to continue or end the game.
 */
function endPlayer() {
    if (active == true) {
        var life;
        active = false;
        disableControl();
        player.src = imgRoot + "frog3.PNG";
        allAtXY(gridX + 1 - lives, 1).forEach((element) => {
            if (element.classList.contains("life")) { life = element; }
        });
        console.log("lives:", lives);
        if (lives != 0) { 
            life.remove();
            lives -= 1
            console.log("life lost:", life, lives, "left")
            setTimeout(setPlayer, 1000);
        } else { setTimeout(endGame, 1000); }
    }
}

/**Increases the player's score by a specified amount, and updates the display's HTML
 * @param {Number} x amount to increase the player's score by.
 */
function addScore(x) {
    score += x
    var scoreTxt = "";
    for (let i = 1; i <= (6 - Math.floor(Math.log10(score)+1)); i++) { scoreTxt += "0"; }
    scoreTxt += score;
    document.getElementById("scoreEl").innerHTML = scoreTxt;
    console.log(x, "Points! Score:", scoreTxt);
}

/**Initializes Game
 */
function startUp() {
    if (active == false) {
        startBtnEl.style.display = "none";
        score = 0;
        lives = 0;
        var txt = document.createElement('p');
        txt.style.color = "white";
        txt.style.backgroundColor = "black";
        txt.classList.add(`score-area`);
        txt.style.gridRow    = 1;
        txt.id = `scoreEl`;
        txt.innerHTML = "000000";
        txt.style.gridColumn = 1;
        grid.appendChild(txt);
        initPlayer();
        initLevel();
        setPlayer();
    }
}

/**Removes player, level, score, and resets start menu
 */
function endGame() {
    player.remove();
    clearLvl();
    document.getElementById("scoreEl").remove();
    startBtnEl.style.display = "inline";
}

// --TILING FUNCTIONS--
/** Toggles the image of water sprites for animation.
 */
function toggleWater() {
    var water1PNG = imgRoot + "water1.PNG"
    var water2PNG = imgRoot + "water2.PNG"
    var water1tiles = grid.querySelectorAll(`img[src='${water1PNG}']`)
    var water2tiles = grid.querySelectorAll(`img[src='${water2PNG}']`)
    water1tiles.forEach((element) => {
        element.src = water2PNG;
    });
    water2tiles.forEach((element) => {
        element.src = water1PNG;
    });
}

/** Toggles the image of fly sprites for animation.
 */
function toggleFly() {
    var fly1PNG = imgRoot + "fly1.PNG"
    var fly2PNG = imgRoot + "fly2.PNG"
    var fly1tiles = grid.querySelectorAll(`img[src='${fly1PNG}']`)
    var fly2tiles = grid.querySelectorAll(`img[src='${fly2PNG}']`)
    fly1tiles.forEach((element) => {
        element.src = fly2PNG;
    });
    fly2tiles.forEach((element) => {
        element.src = fly1PNG;
    });
}

/**Initializes appropriate road tile art on the rows specified for level generation with initLevel.
 * @param {Array} y the rows where tiles will be generated
 */
function initRoadRows(y) {
    var lastIsThree = false;
    y.forEach((element) => {
        if (lastIsThree && !y.includes(element - 1)) { lastIsThree = false; }
        var carIndex = element.toString();
        Object.defineProperty(carRows, carIndex, { 
            value : {
                "len" : lastIsThree ? Math.ceil(Math.random()*2)
                                    : Math.ceil(Math.random()*3),
                "gap" :   Math.floor(Math.random()*3),
                "dir" : 2*Math.floor(Math.random()*2) - 1
            }
        });
        if (carRows[element].len == 3) { lastIsThree = true; }
        else { lastIsThree = false; }
        if (!y.includes(element-1) && !y.includes(element+1)) {
            for (let i = gridXinit; i <= gridX; i++) {
                initSprite(i, element, "road1.PNG", ["tile", "road"]);
            }
        } else if (!y.includes(element-1)) {
            for (let i = gridXinit; i <= gridX; i++) {
                initSprite(i, element, "road2.PNG", ["tile", "road"]);
            }
        } else if (!y.includes(element+1)) {
            for (let i = gridXinit; i <= gridX; i++) {
                initSprite(i, element, "road3.PNG", ["tile", "road"]);
            }
        } else {
            for (let i = gridXinit; i <= gridX; i++) {
                initSprite(i, element, "road4.PNG", ["tile", "road"]);
            }
        }
    });
    console.log("carRows:", carRows);
}

/**Initializes water tiles on the rows specified for level generation with initLevel.
 * @param {Array} y the rows where tiles will be generated
 */
function initWaterRows(y) {
    var LastIsOne = false;
    y.forEach((element) => {
        if (LastIsOne && !y.includes(element - 1)) { LastIsOne = false; }
        var logIndex = element.toString();
        Object.defineProperty(logRows, logIndex, { 
            value : {
                "len" : LastIsOne ? Math.ceil(Math.random()*2) + 1
                                  : Math.ceil(Math.random()*3),
                "gap" : Math.floor(Math.random()*3)
            }
        });
        if (logRows[element].len == 1) { LastIsOne = true; }
        else { LastIsOne = false; }
        for (let i = gridXinit; i <= gridX; i++) {
            if ((i + (gridX-1)*element) % 2 == 0) {
                initSprite(i, element, "water1.PNG", ["tile", "water", "hurts"]);
            } else {
                initSprite(i, element, "water2.PNG", ["tile", "water", "hurts"]);
            }
        }
    });
    console.log("logRows:", logRows);
}

/**Initializes grass tiles on the rows specified for level generation with initLevel.
 * @param {Number} y the rows where tiles will be generated
 */
function initGrassRows(y) {
    var bugCell  = 0;
    y.forEach((element) => {
        var obstCell = 0;
        for (let i = gridXinit; i <= gridX; i++) {
            var above = allAtXY(i, (element - 1));
            var obstValid = (!y.includes(element - 1) && (obstCell < gridX/2)) || (!careAhead(above).moveable);
            if (obstValid && (Math.random() <= 0.09375)) {
                initSprite(i, element, "rock1.PNG", ["tile", "obst"]);
                obstCell += 1;
            } else if (obstValid && Math.random() <= 0.28125) {
                initSprite(i, element, "tree1.PNG", ["tile", "obst"]);
                obstCell += 1;
            } else if ((bugCell != 1)&&(Math.random() <= 0.01)) {
                fly = initSprite(i, element, "fly1.PNG", ["tile", "point"], "fly");
                bugCell += 1;
            } else {
                initSprite(i, element, "grass1.PNG", ["tile", "grass"]);
            }
        }
    });
}

// --LEVEL FUNCTIONS--
/**Initializes level by randomly allocating certain
 * types of tiles to certain rows, then initializing them.
 */
function initLevel() {
    roadRows  = []
    waterRows = []
    grassRows = []
    logRows   = {}
    carRows   = {}
    for (let i = gridXinit; i <= gridX; i++) {
        initSprite(i, gridYinit, "grass4.PNG", ["tile"]);
    }
    for (let y = (gridYinit + 1); y < gridY; y++) {
        var roadRow  = 9 - roadRows.length;
        var waterRow = 9 - (document.querySelectorAll('#gameDisplayEl .water').length)/gridX;
        var grassRow = 9 - (document.querySelectorAll('#gameDisplayEl .water').length)/gridX;
        var totalRow = roadRow + waterRow + grassRow;
        if ((score >= 2000) && (totalRow * Math.random() <= roadRow)) {
            roadRows.push(y);
            // grassRows.push(y);
        } else if (((score >= 1000) && !((score >= 2000) && (score <= 3000))) &&
        (totalRow * Math.random() <= roadRow + waterRow))  {
            waterRows.push(y);
            // grassRows.push(y);
        } else {
            grassRows.push(y);
        }
    }
    console.log("road:", roadRows);
    console.log("water:", waterRows);
    console.log("grass:", grassRows);
    initRoadRows(roadRows);
    initWaterRows(waterRows);
    initGrassRows(grassRows);
    for (let i = gridXinit; i <= gridX; i++) {
        initSprite(i, gridY, "grass3.PNG", ["tile"]);
    }
    tick = 1;
    gridHTML()
}

/**Deletes all tile elements, pagebreaks and cell spaces.
 */
function clearLvl() {
    document.querySelectorAll(".tile").forEach((element) => {
        element.remove();
    });
    document.querySelectorAll(".log").forEach((element) => {
        element.remove();
    });
    document.querySelectorAll(".car").forEach((element) => {
        element.remove();
    });
    document.querySelectorAll("br").forEach((element) => {
        element.remove();
    });
    document.querySelectorAll("small").forEach((element) => {
        element.remove();
    });
    console.log("----CLEARED----")
}

/**Disables controls, gives points, pauses the game and prepares the next level
 */
function stageLvl() {
    active = false;
    disableControl();
    clearLvl();
    addScore(1000);
    setTimeout(initLevel, 1000);
    setTimeout(setPlayer, 1000);
}

/**Is called when the player moves into the same space as the fly. 
 * Removes fly and increases player score.
 */
function eatFly() {
    console.log("lives:", lives);
    addScore(250);
    initSprite(fly.style.gridColumn, fly.style.gridRow, "grass2.PNG", ["tile"]);
    fly.remove();
    initSprite(gridX - lives, 1, playerImg, ["life"]);
    lives += 1
    console.log("lives:", lives);
}

/**Checks whether and which log starts to build at end of row y.
 * Is called by the function moveLogRows.
 * @param {Number} y the row to check for building a new log in.
 */
function buildLogStart(y) {
    var logAtTop   = false;
    allAtXY(gridX, y).forEach((element) => {
        if (element.classList.contains("log")){ logAtTop = true;}
    });
    if (logAtTop == true) {}
    else if (logRows[y].gap > 0) { logRows[y].gap -= 1; }
    else if (logRows[y].len != 1) {
        initSprite(gridX, y, "log1.PNG", ["log", "log1"]);
        logRows[y].gap = Math.floor(4*Math.random()) + 1;
    } else {
        initSprite(gridX, y, "log4.PNG", ["log", "log4"]);
        logRows[y].gap = Math.floor(4*Math.random()) + 1;
    }
}

/**Takes the sprite for an unfinished log and develops it further.
 * Is called by the moveLog function.
 * @param {Element} log the end-most sprite of an unfinished log.
 */
function buildLogEnd(log) {
    elX = getSpriteXY(log).x;
    elY = getSpriteXY(log).y;
    if ((log.classList.contains("log1")) && (logRows[elY].len > 2)) {
        initSprite(gridX, elY, "log2.PNG", ["log", "log2"]);
    } else if (log.classList.contains("log1")) {
        initSprite(gridX, elY, "log3.PNG", ["log", "log3"]);
    } else if (log.classList.contains("log2")) {
        initSprite(gridX, elY, "log3.PNG", ["log", "log3"]);
        logRows[elY].gap = Math.floor(4*Math.random()) + 1;
    }
}

/**Takes a given element with class "log" and moves it, removes it, or develops it.
 * It calls the buildLogEnd function to do the latter.
 * @param {Element} log the element to move.
 */
function moveLog(log) {
    var playerOn = false;
    var elX = getSpriteXY(log).x;
    var elY = getSpriteXY(log).y;
    if ((getSpriteXY(player).x == elX) && (getSpriteXY(player).y == elY)){
        var playerOn = true;
    }
    if (getSpriteXY(log).x == 1) {
        log.remove()
        if (playerOn){ endPlayer(); }
    } else {
        moveSprite(log, -1, 0);
        if (playerOn) { moveSprite(player, -1, 0) }
        elX = getSpriteXY(log).x;
    }
    if (elX != (gridX-1))   {}
    else { buildLogEnd(log); }
}

/**Takes a given row and calls moveLog on each to move the entire row, 
 * @param {Number} y row to move all logs within.
*/
function moveLogRow(y) {
    var logSprites = document.getElementsByClassName("log");
    var logsInRow  = [];
    for (var i = 0; i < logSprites.length; i++) {
        if (getSpriteXY(logSprites[i]).y == y){ logsInRow.push(logSprites[i]); }
    }
    logsInRow.forEach((element) => { moveLog(element); });
    buildLogStart(y)
}

/**Checks based on values in logRows for logs on which water rows to move.
 * This function is called every tick and this function calls moveLogRow.
 */
function updateLogs() {
    waterRows.forEach((y) => {
        var moveRow    = false;
        if (logRows[y].len == 1)                           { moveRow = true; }
        else if ((logRows[y].len == 2) && (tick % 2 == 1)) { moveRow = true; }
        else if (tick == 1)                                { moveRow = true; }
        if (moveRow == true) { moveLogRow(y); }
    });
}

// -- R O A D S --
/**Checks whether and which car starts to build at end of row y.
 * Is called by the function moveCarRows.
 * @param {Number} y the row to check for building a new car in.
 */
function buildCarStart(y) {
    var carStart = carRows[y].dir == -1 ? gridX : 1
    var carAtTop   = false;
    var car;
    allAtXY(carStart, y).forEach((element) => {
        if (element.classList.contains("car")){ carAtTop = true;}
    });
    if (carAtTop == true) {}
    else if (carRows[y].gap > 0) { carRows[y].gap -= 1; }
    else if (carRows[y].len != 1) {
        car = initSprite(carStart, y, "lorryPink1.PNG", ["car", "car1", "hurts"]);
        carRows[y].gap = Math.floor(4*Math.random()) + 2;
    } else {
        car = initSprite(carStart, y, "bike1.PNG", ["car", "car4", "hurts"]);
        carRows[y].gap = Math.floor(4*Math.random()) + 2;
    }
    if ((car != undefined)&&(0.5*(carRows[y].dir + 1))) { setSpriteDeg(car, 180); }
}

/**Takes the sprite for an unfinished car and develops it further.
 * Is called by the moveCar function.
 * @param {Element} car the end-most sprite of an unfinished car.
 */
function buildCarEnd(car) {
    var elY = getSpriteXY(car).y;
    var carStart = carRows[elY].dir == -1 ? gridX : 1
    var car;
    if ((car.classList.contains("car1")) && (carRows[elY].len > 2)) {
        car = initSprite(carStart, elY, "lorryPink2.PNG", ["car", "car2", "hurts"]);
    } else if (car.classList.contains("car1")) {
        car = initSprite(carStart, elY, "lorryPink3.PNG", ["car", "car3", "hurts"]);
    } else if (car.classList.contains("car2")) {
        car = initSprite(carStart, elY, "lorryPink3.PNG", ["car", "car3", "hurts"]);
        carRows[elY].gap = Math.floor(4*Math.random()) + 2;
    }
    if ((car != undefined)&&(0.5*(carRows[elY].dir + 1))) { setSpriteDeg(car, 180); }
}

/**Takes a given element with class "car" and moves it, removes it, or develops it.
 * It calls the buildCarEnd function to do the latter.
 * @param {Element} car the element to move.
 */
function moveCar(car) {
    var elY = getSpriteXY(car).y;
    var carStart = carRows[elY].dir == -1 ? gridX : 1
    if (getSpriteXY(car).x == gridX + 1 - carStart) {
        car.remove()
    } else {
        moveSprite(car, carRows[elY].dir, 0);
        var elX = getSpriteXY(car).x;
        var plX = getSpriteXY(player).x;
        var plY = getSpriteXY(player).y;
        if ((elX == plX) && (elY == plY)) { endPlayer(); }
    }
    if (elX != (carStart + carRows[elY].dir)) {}
    else { buildCarEnd(car); }
}

/**Takes a given row and calls moveLog on each to move the entire row, 
 * @param {Number} y row to move all cars within.
*/
function moveCarRow(y) {
    var carSprites = document.getElementsByClassName("car");
    var carsInRow  = [];
    for (var i = 0; i < carSprites.length; i++) {
        if (getSpriteXY(carSprites[i]).y == y){ carsInRow.push(carSprites[i]); }
    }
    carsInRow.forEach((element) => { moveCar(element); });
    buildCarStart(y)
}

/**Checks based on values in carRows for cars on which water rows to move.
 * This function is called every tick and this function calls moveCarRow.
 */
function updateCars() {
    roadRows.forEach((y) => {
        var moveRow    = false;
        if (carRows[y].len == 1)                           { moveRow = true; }
        else if ((carRows[y].len == 2) && (tick % 2 == 0)) { moveRow = true; }
        else if (tick == 3)                                { moveRow = true; }
        if (moveRow == true) { moveCarRow(y); }
    });
}

// -- R O A D S   E N D --

// --INPUT FUNCTIONS--
/**Effect of user trigger to move player up
*/
function moveUp(event) {
    var ahead = allAtXY(player.style.gridColumn, (player.style.gridRow - 1));
    setSpriteDeg(player, 0);
    if (careAhead(ahead).moveable) {
        moveSprite(player, 0, -1);
        if (careAhead(ahead).death) {   endPlayer(); }
        else if (careAhead(ahead).score) { eatFly(); }
    }
    if (player.style.gridRow == gridYinit) { stageLvl(); }
}

/**Effect of user trigger to move player up
*/
function moveDown(event) {
    var ahead = allAtXY(player.style.gridColumn, (player.style.gridRow - -1));
    setSpriteDeg(player, 180);
    if (careAhead(ahead).moveable) {
        moveSprite(player, 0, 1);
        if (careAhead(ahead).death) {  endPlayer(); }
        else if (careAhead(ahead).score) { eatFly(); }
    }
}

/**Effect of user trigger to move player light
*/
function moveLeft(event) {
    var ahead = allAtXY((player.style.gridColumn - 1), player.style.gridRow);
    setSpriteDeg(player, -90);
    if (careAhead(ahead).moveable) {
        moveSprite(player, -1, 0);
        if (careAhead(ahead).death) {  endPlayer(); }
        else if (careAhead(ahead).score) { eatFly(); }
    }
}

/**Effect of user trigger to move player right.
*/
function moveRight(event) {
    var ahead = allAtXY((player.style.gridColumn - -1), player.style.gridRow);
    setSpriteDeg(player, 90);
    if (careAhead(ahead).moveable) {
        moveSprite(player, 1, 0);
        if (careAhead(ahead).death) {  endPlayer(); }
        else if (careAhead(ahead).score) { eatFly(); }
    }
}

function buttonMove(e) {
    if ((e.code === "ArrowUp")||(e.code === "KeyW")||(e.code === "Space")) { moveUp();    }
    else if ((e.code === "ArrowDown")  || (e.code === "KeyS"))             { moveDown();  }
    else if ((e.code === "ArrowLeft")  || (e.code === "KeyA"))             { moveLeft();  }
    else if ((e.code === "ArrowRight") || (e.code === "KeyD"))             { moveRight(); }
}


/**Enables the controls for the player for starting, resuming or reseting.
 */
function enableControl() {
    upBtnEl.addEventListener("click", moveUp);
    downBtnEl.addEventListener("click", moveDown);
    leftBtnEl.addEventListener("click", moveLeft);
    rightBtnEl.addEventListener("click", moveRight);
    document.addEventListener('keyup', buttonMove);
}

/**Disables the controls for the player for dying, pausing or reseting.
 */
function disableControl() {
    upBtnEl.removeEventListener('click', moveUp);
    downBtnEl.removeEventListener('click', moveDown);
    leftBtnEl.removeEventListener('click', moveLeft);
    rightBtnEl.removeEventListener('click', moveRight);
    document.removeEventListener('keyup', buttonMove);
}

/**Runs every 500, and shuffles through tick values 1 -> 4 (1, 2, 3, 4, 1...)
*/
function delta(){
    if ((active == false) && (tick % 2 == 0)) {
        startBtnEl.innerHTML = startBtnEl.innerHTML == "" ? "START" : "";
    } else if (active == false) {
        console.log("Welcome to Frogger!");
    } else { // every activetick
        updateLogs();
        updateCars();
        toggleWater();
        toggleFly();
    }
    tick += tick == 4 ? (-3) : 1;
    setTimeout(delta, 500);
}

// --SCRIPT--
delta();