//  DECLARATIONS
//  TOOLING DECLARATIONS
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
const imgRoot    = "/frogger/assets/images/";
let playerImg    = "frog1.PNG";
let player;
//  FROGGER DECLARATIONS
let active = false;
let tick   = 0;
let score  = 0;
let fly;

//  TOOLING FUNCTIONS
/**Returns the element on or closest ahead of a given co-ordinate on the grid.
 * @param {Number} x coordinate in grid with left as 1
 * @param {Number} y coordinate in grid with top as 1
*/
function nearestInDOM(x,y) {
    var element;
    for (let i = 0; i <= grid.childElementCount; i++) {
        var head = document.querySelector(`#gameDisplayEl :nth-child(${i})`);
        if (head != undefined) {
            var headX = head.style.gridColumn;
            var headY = head.style.gridRow;
            if (((headX >= x)&&(headY == y))||(headY > y)) {
                element = head;
                break;
            }
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
        if (head != undefined) {
            var headX = head.style.gridColumn;
            var headY = head.style.gridRow;
            if ((headX == x)&&(headY == y)) {
                elements.push(head);
            }
        }
    }
    return elements;
}

/**Creats linebreaks between rows in grid and spaces (<small>" "</small>) between cells
 * for non-CSS functionality
 */
function gridHTML() {
    for (let i = (gridYinit + 1); i <= gridY; i++) {
        var neighbor = nearestInDOM(gridXinit,i);
        if (neighbor != undefined) {
            var br = document.createElement('br');
            neighbor.insertAdjacentElement("beforebegin", br);
        }
    }
    for (let j = gridYinit; j <= gridY; j++) {
        for (let i = (gridXinit + 1); i <= gridX; i++) {
            var neighbor = nearestInDOM(i,j);
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
    var neighbor = nearestInDOM(x,y);
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
    var neighbor = nearestInDOM(x,y);
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
    var neighbor = nearestInDOM(element.style.gridColumn - -x,element.style.gridRow - -y);
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
            if (element.id == "player")               { plySprt  = true;  }
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
    setSpriteXY(player, Math.floor(gridX/2), gridY)
    upBtnEl.addEventListener("click", moveUp);
    downBtnEl.addEventListener("click", moveDown);
    leftBtnEl.addEventListener("click", moveLeft);
    rightBtnEl.addEventListener("click", moveRight);
    player.src = imgRoot + playerImg;
}

function killPlayer() {
    upBtnEl.removeEventListener('click', moveUp);
    downBtnEl.removeEventListener('click', moveDown);
    leftBtnEl.removeEventListener('click', moveLeft);
    rightBtnEl.removeEventListener('click', moveRight);
    console.log("player death")
    player.src = imgRoot + "frog3.PNG";
    let life = document.querySelector(".life");
    console.log("life:", life);
    if (life) { 
        life.remove();
        setTimeout(setPlayer, 1000);
    } else { setTimeout(endGame, 1000); }
}

//FROGGER TILING FUNCTIONS

/**Initializes appropriate road tile art on all rows specified by an array for level generation with initLevel.
 * @param {Array} y the rows where tiles will be generated
 */
function initRoadRows(y) {
    y.forEach((element) => {
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
}

/**Initializes water tiles on the row specified for level generation with initLevel.
 * @param {Array} y the row where tiles will be generated
 */
function initWaterRow(y) {
    y.forEach((element) => {
        for (let i = gridXinit; i <= gridX; i++) {
            if ((i + (gridX-1)*element) % 2 == 0) {
                initSprite(i, element, "water1.PNG", ["tile", "water", "hurts"]);
            } else {
                initSprite(i, element, "water2.PNG", ["tile", "water", "hurts"]);
            }
            
        }
    });
}

/**Initializes grass tiles on the row specified for level generation with initLevel.
 * @param {Number} y the row where tiles will be generated
 */
function initGrassRow(y) {
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

//FROGGER LEVEL FUNCTIONS
/**Initializes level by randomly allocating certain
 * types of tiles to certain rows, then initializing them.
 */
function initLevel() {
    var roadRows = []
    var waterRows = []
    var grassRows = []
    for (let i = gridXinit; i <= gridX; i++) {
        initSprite(i, gridYinit, "grass4.PNG", ["tile"]);
    }
    for (let y = (gridYinit + 1); y < gridY; y++) {
        var roadRow  = 9 - roadRows.length;
        var waterRow = 9 - (document.querySelectorAll('#gameDisplayEl .water').length)/gridX;
        var grassRow = 9 - (document.querySelectorAll('#gameDisplayEl .water').length)/gridX;
        var totalRow = roadRow + waterRow + grassRow;
        if (totalRow * Math.random() <= roadRow) {
            roadRows.push(y);
        } else if (totalRow * Math.random() <= roadRow + waterRow) {
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
    initWaterRow(waterRows);
    initGrassRow(grassRows);
    for (let i = gridXinit; i <= gridX; i++) {
        initSprite(i, gridY, "grass3.PNG", ["tile"]);
    }
    gridHTML()
}

/**Deletes all tile elements, pagebreaks and cell spaces.
 */
function clearLvl() {
    document.querySelectorAll(".tile").forEach((element) => {
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

function stageLvl() {
    upBtnEl.removeEventListener('click', moveUp);
    downBtnEl.removeEventListener('click', moveDown);
    leftBtnEl.removeEventListener('click', moveLeft);
    rightBtnEl.removeEventListener('click', moveRight);
    clearLvl();
    addScore(1000);
    setTimeout(initLevel, 1000);
    setTimeout(setPlayer, 1000);
}

function addScore(x) {
    score += x
    var scoreTxt = "";
    for (let i = 1; i <= (6 - Math.floor(Math.log10(score)+1)); i++) { scoreTxt += "0"; }
    scoreTxt += score;
    document.getElementById("scoreEl").innerHTML = scoreTxt;
    console.log(x, "Points! Score:", scoreTxt);
}

function eatFly() {
    addScore(250);
    initSprite(fly.style.gridColumn, fly.style.gridRow, "grass2.PNG", ["tile"]);
    fly.remove();
}

//INPUT FUNCTIONS
/**Effect of user trigger to move player up
*/
function moveUp(event) {
    var ahead = allAtXY(player.style.gridColumn, (player.style.gridRow - 1));
    setSpriteDeg(player, 0);
    if (careAhead(ahead).moveable) {
        moveSprite(player, 0, -1);
        if (careAhead(ahead).death) {  killPlayer(); }
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
        if (careAhead(ahead).death) {  killPlayer(); }
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
        if (careAhead(ahead).death) {  killPlayer(); }
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
        if (careAhead(ahead).death) {  killPlayer(); }
        else if (careAhead(ahead).score) { eatFly(); }
    }
}

// --TOOLING SCRIPT--
/**Initializes Game
 */
function startUp() {
    if (active == false) {
        active = true;
        startBtnEl.style.display = "none";
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

function endGame() {
    player.remove();
    clearLvl();
    active = false;
    document.getElementById("scoreEl").remove();
    startBtnEl.style.display = "inline";
}

/**Repeats commands distributed in half and quarters.
*/
function delta(){
    if (active == true) {
        if (tick % 2 == 1) {
            toggleWater();
            if (tick == 1) {
            } else { // 3
            }
        } else {
            toggleFly()
            if (tick == 2) {
            } else { // 4
            }
        }
    } else {
        if (tick == 1) {
            startBtnEl.innerHTML = startBtnEl.innerHTML == "" ? "START" : "";
        }      
    }
    tick += tick == 4 ? (-3) : 1;
    setTimeout(delta, 250);
}

delta();