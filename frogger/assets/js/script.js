let active = false;
let startBtn = document.getElementById("startBtn");
let grid = document.getElementById("game-display");
let tick = 0
let frog = "frogger/assets/images/frog1.PNG"

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

function createImg(x, y, src, id, classes) {
    var img = document.createElement('img');
    var neighbor;
    var i = 0
    while ((valid = false) && (i < grid.childElementCount)) {
        var head = document.querySelector(`#game-display :nth-child(${i})`);
        if (head != null) {
            if ((head.style.gridColumn == x)&&(head.style.gridrow == y)) {
                neighbor = head;
                valid = true;
            }
        }
        i += 1
    }
    console.log(i);
    console.log(valid);
    i = 0
    img.classList.add("sprite");
    img.alt = "";
    img.style.imageRendering = "pixelated";
    img.style.gridColumn = x;
    img.style.gridRow    = y;
    img.src = img.src != null ? src : null;
    img.id  = img.id  != null ? id  : null;
    if (classes != null) { 
        classes.forEach((element) => {
            img.classList.add(element);
        });
    }
    console.log(`<!--${id}'s Neighbor-->`)
    console.log(neighbor)
    if (neighbor != null) {
        neighbor.insertAdjacentElement("beforebegin", img)
    } else {
        grid.appendChild(img);
    }
}

function startUp() {
    if (active == false) {
        active = true;
        startBtn.style.display = "none";
        grid.style.backgroundColor = "black"
            // remove startBtn
            // remove any button press event listener

        createImg(6, 12, frog, "player", ["entity"]);
        createImg(4, 12, frog, "player2", ["entity"]);
        createImg(8, 12, frog, "player3", ["entity"]);
        createImg(6, 12, "frogger/assets/images/log1.PNG")
    }
}

timer();

//event listener for any button press to trigger startUp