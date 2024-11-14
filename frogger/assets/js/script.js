//DECLARATIONS
const startBtnEl = document.getElementById("startBtnEl");
const upBtnEl    = document.getElementById("btnUpEl");
const leftBtnEl  = document.getElementById("btnLeftEl");
const rightBtnEl = document.getElementById("btnRightEl");
const downBtnEl  = document.getElementById("btnDownEl");
const grid       = document.getElementById("gameDisplayEl");
let frog   = "frog1.PNG";
let active = false;
let tick   = 0;
let player;
let playerX;
let playerY;

//INITIALIZATIONS
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
    var neighbor;
    for (let i = 0; i <= grid.childElementCount; i++) {
        var head = document.querySelector(`#gameDisplayEl :nth-child(${i})`);
        if (head != undefined) {
            var headX = head.style.gridColumn;
            var headY = head.style.gridRow;
            if (((headX >= x)&&(headY == y))||(headY > y)) {
                neighbor = head;
                break;
            }
        }
    }
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
        console.log('initSprite(): "#'+id, "created before", neighbor, "at", headX, headY+'"');
    }
}

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

/**Initializes level by randomly allocating certain
 * types of tiles to certain rows, then initializing them.
 */
function initLevel() {
    if (player) {
        player.gridColumn = 6;
        player.gridColumn = 11;
    }
    var roadRows = []
    for (let i = 1; i <= 12; i++) {
        initSprite(i, 11, "grass3.PNG", ["tile"]);
    }
    for (let i = 1; i <= 12; i++) {
        initSprite(i, 1, "grass4.PNG", ["tile"]);
    }
    for (let y = 2; y < 11; y++) {
        var roadRow  = 9 - roadRows.length;
        var waterRow = 9 - (document.querySelectorAll('#gameDisplayEl .water').length)/12;
        var grassRow = 9 - (document.querySelectorAll('#gameDisplayEl .water').length)/12;
        var totalRow = roadRow + waterRow + grassRow;
        if (totalRow * Math.random() <= roadRow) {
            roadRows.push(y);
            console.log("ROAD");
        } else if (totalRow * Math.random() <= roadRow + waterRow) {
            initWaterRow(y);
            console.log("WATER");
        } else {
            initGrassRow(y);
            console.log("GRASS");
        }
    }
    initRoadRows(roadRows);
}

//INTERACTIONS
/**Repeats commands distributed in half and quarters
 */
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
/** Initializes Frogger and enables controls
 */
function startUp() {
    if (active == false) {
        active = true;
        startBtnEl.style.display = "none";
        initLevel();
        initSprite(1, 1, frog, ["entity"], "player");
        player = document.getElementById("player");
        player.style.gridColumn = 6;
        player.style.gridRow = 11;
        console.log("player:", player)
    }
}

delta();
upBtnEl.addEventListener("click", () => {
    console.log("Up!", typeof(playerY));
    player.style.gridRow -= 1; // :)
})