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
    img.src = img.src != null ? src : null;
    img.id  = img.id  != null ? id  : null;
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
    if (img.id != null) {
        console.log('initSprite(): "#'+id, "created before", neighbor, "at", headX, headY+'"')
    }
}

function startUp() {
    if (active == false) {
        active = true;
        startBtn.style.display = "none";
        grid.style.backgroundColor = "black"
            // remove startBtn
            // remove any button press event listener

        initSprite(6, 12, frog, ["entity"], "player");
    }
}

timer();