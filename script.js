const ADMIN_PASS = "1234";
let SECRET_WORD = localStorage.getItem('customWord') || "OGURI";
let currentAttempt = 0;
let currentGuess = "";
let gameOver = false;
let isModalOpen = false;

function initBoard() {
    const board = document.getElementById('board');
    const wordLength = SECRET_WORD.length;

    // Set grid columns based on word length
    board.style.gridTemplateColumns = `repeat(${wordLength}, 1fr)`;
    board.innerHTML = ''; 

    for (let r = 0; r < 6; r++) {
        for (let c = 0; c < wordLength; c++) {
            const tile = document.createElement('div');
            tile.className = 'tile';
            tile.id = `tile-${r}-${c}`;
            
            // Shrink font for long words
            if (wordLength > 6) tile.style.fontSize = "1.5rem";
            if (wordLength > 8) tile.style.fontSize = "1.1rem";
            
            board.appendChild(tile);
        }
    }
    setupKeyboard();
}

function setupKeyboard() {
    const keys = [
        ['q','w','e','r','t','y','u','i','o','p'],
        ['a','s','d','f','g','h','j','k','l'],
        ['ENTER', 'z','x','c','v','b','n','m', 'DEL']
    ];

    document.getElementById('kb-1').innerHTML = '';
    document.getElementById('kb-2').innerHTML = '';
    document.getElementById('kb-3').innerHTML = '';

    keys.forEach((row, i) => {
        const container = document.getElementById(`kb-${i+1}`);
        row.forEach(key => {
            const btn = document.createElement('button');
            btn.className = 'key' + (key.length > 1 ? ' wide' : '');
            btn.innerText = key;
            btn.id = `key-${key.toLowerCase()}`;
            btn.onclick = (e) => {
                e.preventDefault();
                handleKey(key);
            };
            container.appendChild(btn);
        });
    });
}

function handleKey(key) {
    if (gameOver || isModalOpen) return;

    if (key === 'DEL' || key === 'Backspace') {
        currentGuess = currentGuess.slice(0, -1);
    } else if (key === 'ENTER' || key === 'Enter') {
        if (currentGuess.length === SECRET_WORD.length) submitGuess();
    } else if (currentGuess.length < SECRET_WORD.length && /^[a-zA-Z]$/.test(key) && key.length === 1) {
        currentGuess += key.toLowerCase();
    }
    updateGrid();
}

function updateGrid() {
    for (let c = 0; c < SECRET_WORD.length; c++) {
        const tile = document.getElementById(`tile-${currentAttempt}-${c}`);
        if (tile) {
            const char = currentGuess[c] || "";
            tile.innerText = char;
            tile.classList.toggle('active', char !== "");
        }
    }
}

function submitGuess() {
    const guessArr = currentGuess.toUpperCase().split('');
    const secretArr = SECRET_WORD.toUpperCase().split('');
    const rowIdx = currentAttempt;

    // First pass: Correct letters (green)
    guessArr.forEach((char, i) => {
        const tile = document.getElementById(`tile-${rowIdx}-${i}`);
        const key = document.getElementById(`key-${char.toLowerCase()}`);
        if (char === secretArr[i]) {
            tile.classList.add('correct');
            if (key) key.classList.add('correct');
            secretArr[i] = null;
        }
    });

    // Second pass: Present/Absent (yellow/gray)
    guessArr.forEach((char, i) => {
        const tile = document.getElementById(`tile-${rowIdx}-${i}`);
        if (tile.classList.contains('correct')) return;

        const key = document.getElementById(`key-${char.toLowerCase()}`);
        const secretIdx = secretArr.indexOf(char);
        if (secretIdx !== -1) {
            tile.classList.add('present');
            if (key && !key.classList.contains('correct')) key.classList.add('present');
            secretArr[secretIdx] = null;
        } else {
            tile.classList.add('absent');
            if (key && !key.classList.contains('correct') && !key.classList.contains('present')) {
                key.classList.add('absent');
            }
        }
    });

    currentAttempt++;
    currentGuess = "";

    if (guessArr.join('') === SECRET_WORD.toUpperCase()) {
        showMsg(`Splendid! Attempts: ${currentAttempt}/6`);
        gameOver = true;
    } else if (currentAttempt === 6) {
        showMsg(`Game Over. Word was: ${SECRET_WORD.toUpperCase()}`);
        gameOver = true;
    }
}

function showMsg(txt) {
    const m = document.getElementById('message');
    m.innerText = txt;
    m.style.display = 'block';
    setTimeout(() => { if(!gameOver) m.style.display = 'none'; }, 3000);
}

function toggleModal() {
    isModalOpen = !isModalOpen;
    document.getElementById('settings-modal').style.display = isModalOpen ? 'block' : 'none';
    document.getElementById('modal-overlay').style.display = isModalOpen ? 'block' : 'none';
    if(!isModalOpen) {
        document.getElementById('password-screen').style.display = 'block';
        document.getElementById('admin-controls').style.display = 'none';
        document.getElementById('admin-pass').value = '';
    }
}

function checkPassword() {
    if (document.getElementById('admin-pass').value === ADMIN_PASS) {
        document.getElementById('password-screen').style.display = 'none';
        document.getElementById('admin-controls').style.display = 'block';
        document.getElementById('new-word-input').value = SECRET_WORD;
    } else {
        alert("Wrong password!");
    }
}

function saveAndReload() {
    const word = document.getElementById('new-word-input').value.trim().toUpperCase();
    if (word.length >= 3 && word.length <= 10) {
        localStorage.setItem('customWord', word);
        location.reload();
    } else {
        alert("Please use between 3 and 10 letters.");
    }
}

window.addEventListener('keydown', (e) => {
    if (isModalOpen) return;
    if (e.key === 'Enter' || e.key === 'Backspace' || e.key.length === 1) {
        handleKey(e.key);
    }
});

initBoard();
