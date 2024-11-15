//DECLARATIONS
const startBtnEl = document.getElementById("startBtnEl");
const upBtnEl    = document.getElementById("btnUpEl");
const leftBtnEl  = document.getElementById("btnLeftEl");
const rightBtnEl = document.getElementById("btnRightEl");
const grid       = document.getElementById("gameDisplayEl");
const gridX      = 12;
const gridY      = 11;
let frog   = "frog1.PNG";
let active = false;
let tick   = 0;
let player;
let playerX;
let playerY;

//SPRITE FUNCTIONS

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

/**Creates an image with src, id and class 
 * at a specified location on the grid, and
 * appropriate position in the DOM
 * @param {Number} x       column position of image in grid
 * @param {Number} y       row position of image in grid
 * @param {String} src     src of image (in "/frogger/assets/images/")
 * @param {Array}  classes Array of strings; classes for image to assume
 * @param {String} id      id for image to assume
*/
function initSprite(x, y, src, classes, id) {
    var img = document.createElement('img');
    var neighbor = nearestInDOM(x,y);
    img.classList.add("sprite");
    img.alt = " ";
    img.style.gridColumn = x;
    img.style.gridRow    = y;
    if (src != undefined) { 
        src = "/frogger/assets/images/".concat(src);
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
}

/**Sets the co-ordiated of a given element on the grid.
 * @param {Element} element the target HTML element
 * @param {Number}  x       row position of element in grid
 * @param {Number}  y       column position of element in grid
*/
function setSpriteXY(element, x, y) {
    var neighbor = nearestInDOM(x,y);
    if (neighbor != undefined) { neighbor.after(element); }
    element.style.gridColumn = x;
    element.style.gridRow = y;
}

/**Moves a given element on the grid a specified distance.
 * @param {Element} element the target HTML element
 * @param {Number}  x       row distance where positive is right
 * @param {Number}  y       column distance where posititve is down
*/
function moveSprite(element, x, y) {
    var neighbor = nearestInDOM(element.style.gridColumn - -x,element.style.gridRow - -y);
    if (neighbor != undefined) { neighbor.after(element); }
    element.style.gridColumn -= -x;
    element.style.gridRow -= -y;
}

/**Rotates a given element a specified angle in degrees.
 * @param {Element} element the target HTML element
 * @param {Number}  deg     orientation to set element where 0 is up
*/
function setSpriteDeg(element, deg) {
    element.style.transform = `rotate(${deg}deg)`;
}

//TILE FUNCTIONS
/**Initializes road tiles on all rows specified by an array.
 * @param {Array} y the rows where tiles will be generated
 */
function initRoadRows(y) {
    y.forEach((element) => {
        if (y.includes(element-1)) {
            if (y.includes(element+1)) {
                for (let i = 1; i <= 12; i++) {
                    initSprite(i, element, "road4.PNG", ["tile", "road"]);
                }
            } else {
                for (let i = 1; i <= 12; i++) {
                    initSprite(i, element, "road3.PNG", ["tile", "road"]);
                }
            }
        } else if (y.includes(element+1)) {
            for (let i = 1; i <= 12; i++) {
                initSprite(i, element, "road2.PNG", ["tile", "road"]);
            }
        } else {
            for (let i = 1; i <= 12; i++) {
                initSprite(i, element, "road1.PNG", ["tile", "road"]);
            }
        }
    })
}

/**Initializes water tiles on the row specified.
 * @param {Number} y the row where tiles will be generated
 */
function initWaterRow(y) {
    for (let i = 1; i <= 12; i++) {
        initSprite(i, y, "water1.PNG", ["tile", "water"]);
    }
}

/**Initializes water tiles on the row specified.
 * @param {Number} y the row where tiles will be generated
 */
function initGrassRow(y) {
    for (let i = 1; i <= 12; i++) {
        initSprite(i, y, "grass1.PNG", ["tile", "grass"]);
    }
}

//LEVEL FUNCTIONS

/**Initializes level by randomly allocating certain
 * types of tiles to certain rows, then initializing them.
 */
function initLevel() {
    var roadRows = []
    for (let i = 1; i <= 12; i++) {
        initSprite(i, 1, "grass4.PNG", ["tile"]);
    }
    console.log("1: end");
    for (let y = 2; y < 11; y++) {
        var roadRow  = 9 - roadRows.length;
        var waterRow = 9 - (document.querySelectorAll('#gameDisplayEl .water').length)/12;
        var grassRow = 9 - (document.querySelectorAll('#gameDisplayEl .water').length)/12;
        var totalRow = roadRow + waterRow + grassRow;
        if (totalRow * Math.random() <= roadRow) {
            roadRows.push(y);
            console.log(y + ": ROAD");
        } else if (totalRow * Math.random() <= roadRow + waterRow) {
            initWaterRow(y);
            console.log(y + ": WATER");
        } else {
            initGrassRow(y);
            console.log(y + ": GRASS");
        }
    }
    initRoadRows(roadRows);
    for (let i = 1; i <= 12; i++) {
        initSprite(i, 11, "grass3.PNG", ["tile"]);
    }
    console.log("11: start");
    setPlayer();
}

function clearLvl() {
    document.querySelectorAll(".tile").forEach((element) => {
        element.remove();
    });
    console.log("----CLEARED----")
}

function stageLvl() {
    upBtnEl.removeEventListener('click', moveUp)
    leftBtnEl.removeEventListener('click', moveLeft)
    rightBtnEl.removeEventListener('click', moveRight)
    clearLvl();
    setTimeout(initLevel, 1000);
    setPlayer;
}

//GAME FUNCTIONS
function initPlayer() {
    initSprite(1, 1, frog, ["entity"], "player");
    player = document.getElementById("player");
}

function setPlayer() {
    setSpriteXY(player, 6, 11)
    upBtnEl.addEventListener("click", moveUp);
    leftBtnEl.addEventListener("click", moveLeft);
    rightBtnEl.addEventListener("click", moveRight);
}

/** Initializes Frogger and enables controls
 */
function startUp() {
    if (active == false) {
        active = true;
        startBtnEl.style.display = "none";
        initPlayer();
        initLevel();
    }
}

/**Effect of user trigger to move player up.*/
function moveUp(event) {
    if (player.style.gridRow != 1) { moveSprite(player, 0, -1) }
    setSpriteDeg(player, 0);
    if (player.style.gridRow == 1) { stageLvl(); }
}

/**Effect of user trigger to move player light.*/
function moveLeft(event) {
    if (player.style.gridColumn != 1) { moveSprite(player, -1, 0) }
    setSpriteDeg(player, -90);
}

/**Effect of user trigger to move player right.*/
function moveRight(event) {
    if (player.style.gridColumn != 12) { moveSprite(player, 1, 0) }
    setSpriteDeg(player, 90);
}

//DELTA
/**Repeats commands distributed in half and quarters.*/
function delta(){
    if (tick % 2 == 1) {
        if (tick == 1) {
            startBtnEl.innerHTML = startBtnEl.innerHTML == "" ? "START" : "";

        } else { // 3

        }
    } else {
        if (tick == 2) {

        } else { // 4
        
        }
    }
    tick += tick == 4 ? (-3) : 1;
    setTimeout(delta, 250);
}
delta();