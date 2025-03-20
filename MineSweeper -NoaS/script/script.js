let board = [];
let rows = 8;
let columns = 8;

let minesCount = 10;
let minesLocation = [];

let tilesClicked = 0;
let flagEnabled = false;
let gameOver = false;

// Coins door localStorage
let score = parseInt(localStorage.getItem("score")) || 0;
window.onload = function () {
    updateScoreDisplay();
    startGame();
    createRulesButton(); 
};

// Functie bepalen bordformaat (op basis van aantal mines)
function adjustBoardSize() {
    minesCount = parseInt(document.getElementById("bombs-select").value);

    if (minesCount <= 2) {
        rows = 4;
        columns = 4;
    } else if (minesCount <= 6) {
        rows = 6;
        columns = 6;
    } else {
        rows = 8;
        columns = 8;
    }

    const board = document.getElementById("board");
    board.style.width = `${columns * 50}px`;
    board.style.height = `${rows * 50}px`;
}

// Start spel functie
function startGame() {
    board = [];
    minesLocation = [];
    tilesClicked = 0;
    gameOver = false;

    adjustBoardSize();
    document.getElementById("mines-count").innerText = minesCount;

    document.getElementById("flag-button").addEventListener("click", setFlag);

    document.getElementById("bombs-select").addEventListener("change", (e) => {
        if (parseInt(e.target.value) !== minesCount) {
            resetGame();
        }
    });

    document.getElementById("board").innerHTML = "";

    setMines();

    for (let r = 0; r < rows; r++) {
        let row = [];
        for (let c = 0; c < columns; c++) {
            let tile = document.createElement("div");
            tile.id = r.toString() + "-" + c.toString();
            tile.addEventListener("click", clickTile);
            document.getElementById("board").append(tile);
            row.push(tile);
        }
        board.push(row);
    }
}

// Set mines functie
function setMines() {
    let minesLeft = minesCount;
    while (minesLeft > 0) {
        let r = Math.floor(Math.random() * rows);
        let c = Math.floor(Math.random() * columns);
        let id = `${r}-${c}`;
        if (!minesLocation.includes(id)) {
            minesLocation.push(id);
            minesLeft -= 1;
        }
    }
}

// Functie voor markeren
function setFlag() {
    flagEnabled = !flagEnabled;
    document.getElementById("flag-button").style.backgroundColor = flagEnabled ? "darkgray" : "lightgray";
}

// Spel reset functie
function resetGame() {
    startGame();
}

// Functie om een vakje aan te klikken
function clickTile() {
    if (gameOver || this.classList.contains("tile-clicked")) return;

    let tile = this;

    if (flagEnabled) {
        if (tile.innerText === "") {
            tile.innerText = "✖️";
        } else if (tile.innerText === "✖️") {
            tile.innerText = "";
        }
        return;
    }

    if (minesLocation.includes(tile.id)) {
        gameOver = true;
        revealMines();
        return;
    }

    let [r, c] = tile.id.split("-").map(Number);
    checkMine(r, c);
}

function revealMines() {
    const explosionSound = document.getElementById("explosion-sound");
    explosionSound.play();
    explosionSound.volume = 0.18;

    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < columns; c++) {
            let tile = board[r][c];
            if (minesLocation.includes(tile.id)) {
                tile.innerText = "💣";
                tile.style.backgroundColor = "red";
            }
        }
    }
    showPopup("Helaas, je hebt verloren! ");
}

function checkMine(r, c) {
    if (r < 0 || r >= rows || c < 0 || c >= columns) {
        return;
    }
    if (board[r][c].classList.contains("tile-clicked")) {
        return;
    }

    board[r][c].classList.add("tile-clicked");
    tilesClicked += 1;

    let minesFound = 0;

    for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
            if (dr === 0 && dc === 0) continue;
            minesFound += checkTile(r + dr, c + dc);
        }
    }

    if (minesFound > 0) {
        board[r][c].innerText = minesFound;
        board[r][c].classList.add("x" + minesFound.toString());
    } else {
        for (let dr = -1; dr <= 1; dr++) {
            for (let dc = -1; dc <= 1; dc++) {
                if (dr === 0 && dc === 0) continue;
                checkMine(r + dr, c + dc);
            }
        }
    }

    if (tilesClicked === rows * columns - minesCount) {
        gameOver = true;
        document.getElementById("mines-count").innerText = "Cleared";

        // Voeg coins toe: 10 + (bommen * 2)
        score += 10 + (minesCount * 2);
        localStorage.setItem("score", score);
        updateScoreDisplay();

        showPopup(" Gefeliciteerd, je hebt gewonnen!");
    }
}

// Pop-up Functie
function showPopup(message) {
    const popup = document.getElementById("popup");
    const popupMessage = document.getElementById("popup-message");
    popupMessage.innerText = message;
    popup.classList.remove("hidden");

    document.getElementById("popup-reset").addEventListener("click", () => {
        popup.classList.add("hidden");
        resetGame();
    });
}

// Functie om te checken of een vakje een mijn is
function checkTile(r, c) {
    if (r < 0 || r >= rows || c < 0 || c >= columns) return 0;
    return minesLocation.includes(`${r}-${c}`) ? 1 : 0;
}

// Score updaten in de UI
function updateScoreDisplay() {
    if (!document.getElementById("score-display")) {
        const scoreDisplay = document.createElement("h2");
        scoreDisplay.id = "score-display";
        scoreDisplay.innerHTML = `Coins: <span id="score">${score}</span>`;
        document.body.insertBefore(scoreDisplay, document.getElementById("board"));
    }
    document.getElementById("score").innerText = score;
}

// Spelregels tonen
function createRulesButton() {
    document.getElementById("rules-button").addEventListener("click", showRulesPopup);
}

function showRulesPopup() {
    document.getElementById("rules-popup").classList.remove("hidden");
    document.getElementById("close-rules").addEventListener("click", () => {
        document.getElementById("rules-popup").classList.add("hidden");
    });
}