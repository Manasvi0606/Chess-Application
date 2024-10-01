//<---------------------FRONTEND------------------>
//by this line mera jo front end hai wo connected h server se realitime pe
const socket = io();
const chess = new Chess();
const boardElement = document.querySelector(".chessboard");

let draggedPiece = null;
let sourceSqaure = null;
let playerRole = null;

const renderBoard = () => {
    const board = chess.board();
    boardElement.innerHTML = "";
    //board m for each row
    board.forEach((row, rowindex) => {
        //board mai for each column(square) of particular row
        row.forEach((square, squareindex) => {
            const sqaureElement = document.createElement("div");

            // (rowindex + squareindex)%2 === 0? "light" : "dark" ---> logic to give square a class according to different row and col
            sqaureElement.classList.add("square", 
                (rowindex + squareindex)%2 === 0? "light" : "dark"
            );

            sqaureElement.dataset.row = rowindex;
            sqaureElement.dataset.col = squareindex;
            
            if(square){
                const pieceElement = document.createElement("div");
                pieceElement.classList.add("piece", square.color === 'w' ? "white" : "black");
                pieceElement.innerText = getPieceUnicode(square);
                pieceElement.draggable = playerRole === square.color;

                pieceElement.addEventListener("dragstart", (e) => {
                    if(pieceElement.draggable){
                        draggedPiece = pieceElement;
                        sourceSqaure = {row: rowindex, col: squareindex}; 

                        //e.data..... this is necessity to write to avoid any problem in drag 
                        // console.log("Dragging piece:", getPieceUnicode(square), "from square:", sourceSqaure); // Debugging
                        e.dataTransfer.setData("text/plain", "");
                    }

                });

                pieceElement.addEventListener("dragend", (e) => {
                    draggedPiece = null;
                    sourceSqaure = null;
                });


                //particular square p wo element(bishop, rook ...) attach krdia
                sqaureElement.append(pieceElement);
            }

            sqaureElement.addEventListener("dragover", function (e) {
                e.preventDefault();
            });   
            
            //drag krke jidhar drop kia uski functionality
            sqaureElement.addEventListener("drop", function (e) {
                e.preventDefault();
                //finding row and col of position where a draggedpiece is dropped
                if(draggedPiece){
                    const targetSource = {
                        row: parseInt( sqaureElement.dataset.row),
                        col: parseInt(sqaureElement.dataset.col),
                    };

                    //handleMove se piece ko source se target p chala rhe hai
                    // console.log("Dropping piece on square:", targetSource); // Debugging
                    handleMove(sourceSqaure, targetSource);
                }
            });
            boardElement.appendChild(sqaureElement);
        });
        
    });
    
    if(playerRole === 'b'){
        boardElement.classList.add("flipped");
    }else{
        boardElement.classList.remove("flipped");
    }

};

const handleMove = (source, target) => {
    const move = {
        from: `${String.fromCharCode(97 + source.col)}${8 - source.row}`,
        to: `${String.fromCharCode(97 + target.col)}${8 - target.row}`,
        promotion: "q",
    };

    //<------------ERROR----------------->
    socket.emit("move", move);
    renderBoard();



    //<--------------------ERROR--------------->
};

const getPieceUnicode = (piece) => {
    const unicodePieces = {
        p: "♙",
        r: "♜",
        n: "♞",
        b: "♝",
        q: "♛",
        k: "♚",
        P: "♙",
        R: "♖",
        N: "♘",
        B: "♗",
        Q: "♕",
        K: "♔",
    };
    return unicodePieces[piece.type] ||  "";
};

socket.on("playerRole", function (role) {
    playerRole = role;
    renderBoard();
});

socket.on("spectatorRole", function(){
    playerRole = null;
    renderBoard();
});

socket.on("boardState", function(fen){
    chess.load(fen);
    renderBoard();
});

socket.on("move", function(move){
    chess.move(move);
    renderBoard();
});

renderBoard();
// handleMove();




