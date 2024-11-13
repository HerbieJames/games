let active = false;
let startBtn = document.getElementById("startBtn");
let grid = document.getElementById("game-display");
let tick = 0
let frog = "/frogger/assets/images/frog1.PNG"

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

function createImg(id, src, x, y) {
    var img = document.createElement('img');
    if ( id != null ) img.id = id;
    img.src = src;
    img.style.gridColumn = x;
    img.style.gridRow = y;
    img.classList.add("sprite");
    img.alt = "";
    grid.appendChild(img);
}

function startUp() {
    if (active == false) {
        active = true;
        startBtn.style.display = "none";
        grid.style.backgroundColor = "black"
            // remove startBtn
            // remove any button press event listener

        createImg("player", frog, 6, 12);
    }
}

timer();

//event listener for any button press to trigger startUp