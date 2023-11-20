// Variables del tablero
let board;  // Elemento canvas donde se dibujará el juego
const boardWidth = 360;  // Ancho del tablero
const boardHeight = 640;  // Alto del tablero
let context;  // Contexto 2D del tablero

// Variables del pájaro (bird)
const birdWidth = 40;  // Ancho del pájaro
const birdHeight = 40;  // Alto del pájaro
const birdX = boardWidth / 8;  // Posición inicial X del pájaro
const birdY = boardHeight / 2;  // Posición inicial Y del pájaro
let birdImg;  // Imagen del pájaro

// Objeto que representa las propiedades del pájaro
const bird = {
    x: birdX,  // Posición X del pájaro
    y: birdY,  // Posición Y del pájaro
    width: birdWidth,  // Ancho del pájaro
    height: birdHeight  // Alto del pájaro
};

// Variables de los obstáculos (pipes)
var pipeArray = [];  // Arreglo que almacena los obstáculos
const pipeWidth = 64;  // Ancho de los obstáculos (tubos)
const pipeHeight = 512;  // Alto de los obstáculos (tubos)
const pipeX = boardWidth;  // Posición inicial X de los obstáculos
const pipeY = 0;  // Posición inicial Y de los obstáculos

let topPipeImg;  // Imagen del obstáculo superior
let bottomPipeImg;  // Imagen del obstáculo inferior

// Variables de la física del juego
let velocityX = -2;  // Velocidad horizontal del pájaro
let velocityY = 0;  // Velocidad vertical del pájaro
const gravity = 0.4;  // Aceleración debida a la gravedad

let gameOver = false;  // Estado del juego
let score = 0;  // Puntuación

// Función que se ejecuta cuando la ventana se carga completamente
window.onload = function () {
    // Obtener el elemento canvas y configurar sus dimensiones
    board = document.getElementById("board");
    board.height = boardHeight;
    board.width = boardWidth;
    context = board.getContext("2d");

    // Cargar la imagen del pájaro
    birdImg = new Image();
    birdImg.src = "../assets/flappybird.png";
    birdImg.onload = function () {
        context.drawImage(birdImg, bird.x, bird.y, bird.width, bird.height);
    };

    // Cargar las imágenes de los obstáculos
    topPipeImg = new Image();
    topPipeImg.src = "../assets/toppipe.png";

    bottomPipeImg = new Image();
    bottomPipeImg.src = "../assets/bottompipe.png";

    // Iniciar la animación del juego
    requestAnimationFrame(update);

    // Generar obstáculos periódicamente
    setInterval(placePipes, 1500);

    // Escuchar eventos de teclado para mover el pájaro
    document.addEventListener("keydown", moveBird);
};

// Función que actualiza y renderiza el juego en cada fotograma
function update() {
    requestAnimationFrame(update);

    // Si el juego ha terminado, no hacer nada
    if (gameOver) {
        return;
    }

    // Borrar el tablero
    context.clearRect(0, 0, board.width, board.height);

    // Aplicar la gravedad al pájaro
    velocityY += gravity;
    bird.y = Math.max(bird.y + velocityY, 0);

    // Dibujar el pájaro
    context.drawImage(birdImg, bird.x, bird.y, bird.width, bird.height);

    // Verificar si el pájaro ha caído fuera del tablero
    if (bird.y > board.height) {
        gameOver = true;
    }

    // Recorrer el arreglo de obstáculos y actualizar su posición
    for (let i = 0; i < pipeArray.length; i++) {
        const pipe = pipeArray[i];
        pipe.x += velocityX;
        context.drawImage(pipe.img, pipe.x, pipe.y, pipe.width, pipe.height);

        // Incrementar la puntuación cuando el pájaro pasa un obstáculo
        if (!pipe.passed && bird.x > pipe.x + pipe.width) {
            score += 0.5;
            pipe.passed = true;
        }

        // Verificar colisión entre el pájaro y el obstáculo
        if (detectCollision(bird, pipe)) {
            gameOver = true;
        }
    }

    // Eliminar obstáculos fuera del tablero
    while (pipeArray.length > 0 && pipeArray[0].x < -pipeWidth) {
        pipeArray.shift();
    }

    // Mostrar la puntuación en el tablero
    context.fillStyle = "white";
    context.font = "45px sans-serif";
    context.fillText(score, 150, 45);

    // Mostrar "GAME OVER" si el juego ha terminado
    if (gameOver) {
        context.fillText("PERDISTE", 80, 350);
    }
}

// Función para generar obstáculos (tubos)
function placePipes() {
    // Si el juego ha terminado, no hacer nada
    if (gameOver) {
        return;
    }

    // Generar una posición vertical aleatoria para el obstáculo superior
    const randomPipeY = pipeY - pipeHeight / 4 - Math.random() * (pipeHeight / 2);
    const openingSpace = board.height / 4;

    // Crear el obstáculo superior
    const topPipe = {
        img: topPipeImg,
        x: pipeX,
        y: randomPipeY,
        width: pipeWidth,
        height: pipeHeight,
        passed: false
    };

    // Agregar el obstáculo superior al arreglo
    pipeArray.push(topPipe);

    // Crear el obstáculo inferior
    const bottomPipe = {
        img: bottomPipeImg,
        x: pipeX,
        y: randomPipeY + pipeHeight + openingSpace,
        width: pipeWidth,
        height: pipeHeight,
        passed: false
    };

    // Agregar el obstáculo inferior al arreglo
    pipeArray.push(bottomPipe);
}

// Función para mover el pájaro al presionar la barra espaciadora u otras teclas
function moveBird(e) {
    if (e.code == "Space" || e.code == "ArrowUp" || e.code == "KeyX") {
        // Aplicar una velocidad hacia arriba al pájaro
        velocityY = -6;

        // Reiniciar el juego si está en estado "GAME OVER"
        if (gameOver) {
            bird.y = birdY;
            pipeArray = [];
            score = 0;
            gameOver = false;
        }
    }
}

// Función para detectar colisión entre dos objetos rectangulares
function detectCollision(a, b) {
    return a.x < b.x + b.width &&
        a.x + a.width > b.x &&
        a.y < b.y + b.height &&
        a.y + a.height > b.y;
}