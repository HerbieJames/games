// DECLARATIONS
// --TOOLING DECLARATIONS--
const startBtnEl = document.getElementById("startBtnEl");
const grid       = document.getElementById("gameDisplayEl");
const gridX      = 12; // *
const gridY      = 12; // *
const gridXinit  = 1;  // *
const gridYinit  = 1;  // *
const spawnXinit = 1;  // *
const spawnYinit = 1;  // *
const imgRoot    = ""; // *
const DeathImg   = ""; // *
let playerImg = "";    // *
let player;

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
function setPlayer(x, y) {
    active = true;
    setSpriteXY(player, x, y);
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
        player.src = imgRoot + DeathImg;
        allAtXY(gridX + 1 - lives, 1).forEach((element) => {
            if (element.classList.contains("life")) { life = element; }
        });
        console.log("lives:", lives);
        if (lives != 0) { 
            life.remove();
            lives -= 1
            console.log("life lost:", life, lives, "left")
            setTimeout(function() { setPlayer(spawnXinit, spawnYinit);}, 1000);
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
        setPlayer(spawnXinit, spawnYinit);
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

// --LEVEL FUNCTIONS--

function initLevel() {
    // *
    gridHTML()
}

function clearLvl() {
    //*
    grid.querySelectorAll("br").forEach((element) => {
        element.remove();
    });
    grid.querySelectorAll("small").forEach((element) => {
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
    addScore(0); //*
    setTimeout(initLevel, 1000);
    setTimeout(function() { setPlayer(spawnXinit, spawnYinit); }, 1000);
}

// --INPUT FUNCTIONS--

function buttonMove(e) {
    if      ((e.code === "ArrowUp")    || (e.code === "KeyW")) { /* // * */   }
    else if ((e.code === "ArrowDown")  || (e.code === "KeyS")) { /* // * */   }
    else if ((e.code === "ArrowLeft")  || (e.code === "KeyA")) { /* // * */   }
    else if ((e.code === "ArrowRight") || (e.code === "KeyD")) { /* // * */   }
}


/**Enables the controls for the player for starting, resuming or reseting.
 */
function enableControl() {
    // *
}

/**Disables the controls for the player for dying, pausing or reseting.
 */
function disableControl() {
    // *
}

/**Runs every 500 //*, and shuffles through tick values 1 -> 4 (1, 2, 3, 4, 1...)
*/
function delta(){
    if ((active == false) && (tick % 2 == 0)) {
        startBtnEl.innerHTML = startBtnEl.innerHTML == "" ? "START" : "";
    } else if (active == false) {} 
    else {
        // *
    }
    tick += tick == 4 ? (-3) : 1;
    setTimeout(delta, 500); //*
}

// SCRIPT
window.addEventListener("keydown", function(e) {
    if(["Space","ArrowUp","ArrowDown","ArrowLeft","ArrowRight"].indexOf(e.code) > -1) {
        e.preventDefault();
    }
}, false);

delta();