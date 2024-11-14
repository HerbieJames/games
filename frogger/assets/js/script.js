let active = false;
let startBtn = document.getElementById("startBtn");
let grid = document.getElementById("game-display");
let tick = 0
let frog = "frog1.PNG"

function timer(){
    if (tick == 1) {
        // console.log(tick)
        if (active == false){
            startBtn.innerHTML = startBtn.innerHTML == "" ? "START" : "";
        }
    }
    tick += tick == 4 ? (-3) : 1
    setTimeout(timer, 250);
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
    img.classList.add("sprite");
    img.alt = "";
    img.style.imageRendering = "pixelated";
    img.style.gridColumn = x;
    img.style.gridRow    = y;
    src = "/frogger/assets/images/".concat(src);
    img.src = img.src !== undefined ? src : undefined; // doesn't work
    img.id  = img.id  !== undefined ? id  : undefined; // doesn't work
    var neighbor;
    for (let i = 0; i <= grid.childElementCount; i++) {
        var head = document.querySelector(`#game-display :nth-child(${i})`);
        if (head != null) {
            var headX = head.style.gridColumn
            var headY = head.style.gridRow
            if (((headX >= x)&&(headY == y))||(headY > y)) {
                neighbor = head;
                break;
            }
        }
    }
    if (classes != null) { 
        classes.forEach((element) => {
            img.classList.add(element);
        });
    }
    if (neighbor != null) {
        neighbor.insertAdjacentElement("beforebegin", img)
    } else {
        grid.appendChild(img);
    }
    if (id  !== undefined) {
        console.log('initSprite(): "#'+id, "created before", neighbor, "at", headX, headY+'"')
    }
}

function initRoadRows(y) {
    console.log("y: ", y)
    y.forEach((element) => {
        if (y.includes(element-1)) {
            if (y.includes(element+1)) {
                for (let i = 0; i < 12; i++) {
                    initSprite(i, element, "road4.PNG", ["tile", "road"]);
                }
            } else {
                for (let i = 0; i < 12; i++) {
                    initSprite(i, element, "road3.PNG", ["tile", "road"]);
                }
            }
        } else if (y.includes(element+1)) {
            for (let i = 0; i < 12; i++) {
                initSprite(i, element, "road2.PNG", ["tile", "road"]);
            }
        } else {
            for (let i = 0; i < 12; i++) {
                initSprite(i, element, "road1.PNG", ["tile", "road"]);
            }
        }
    })
}

function initWaterRow(y) {
    for (let i = 0; i < 12; i++) {
        initSprite(i, y, "water1.PNG", ["tile", "water"]);
    }
}

function initGrassRow(y) {
    for (let i = 0; i < 12; i++) {
        initSprite(i, y, "grass1.PNG", ["tile", "grass"]);
    }
}

function initLevel(y) {
    var roadRows = []
    for (let i = 0; i < 12; i++) {
        initSprite(i, 11, "grass3.PNG", ["tile"]);
    }
    for (let i = 0; i < 12; i++) {
        initSprite(i, 1, "grass4.PNG", ["tile"]);
    }
    for (let y = 2; y < 11; y++) {
        var roadRow  = 9 - roadRows.length;
        var waterRow = 9 - (document.querySelectorAll('#game-display .water').length)/12;
        var grassRow = 9 - (document.querySelectorAll('#game-display .water').length)/12;
        var totalRow = roadRow + waterRow + grassRow
        if (totalRow * Math.random() <= roadRow) {
            roadRows.push(y)
            console.log("ROAD");
        } else if (totalRow * Math.random() <= roadRow + waterRow) {
            initWaterRow(y);
            console.log("WATER");
        } else {
            initGrassRow(y);
            console.log("GRASS");
        }
    }
    initRoadRows(roadRows)
}

function startUp() {
    if (active == false) {
        active = true;
        startBtn.style.display = "none";
        grid.style.backgroundColor = "black"
            // remove startBtn
            // remove any button press event listener

        initSprite(6, 11, frog, ["entity"], "player");
        initLevel();
    }
}

timer();