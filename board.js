var white = "white"
var dark = "#ababab"


class Board {
    constructor() {
        this.colorToMove = "w";
        this.position = "";
        this.Square = []
        this.castleString = "";
        this.enPassant = "";
        this.defaultColors = []
        this.selectedPiece
        this.whiteKing = 60
        this.blackKing = 4
        this.blockCheck = []
        this.isInCheck = false
        this.checkFile = -1
        this.checkRank = -1
        this.kingCantMoveHere = []
        this.isBeingAttacked = []
        this.pinnedPieces = []
        this.coords = [
                []
            ]
            //Cria o Tabuleiro
        for (var file = 0; file < 8; file++) {
            for (var rank = 0; rank < 8; rank++) {
                //Escolhe a cor do quadrado
                var isLightSquare = (file + rank) % 2 != 0;

                var squareColor = (isLightSquare) ? dark : white;

                this.defaultColors[file * 8 + rank] = squareColor

                // Cria o quadrado
                var newSquare = document.createElement("div")
                var pieceAsset = document.createElement("img")
                boarddiv.appendChild(newSquare).style.backgroundColor = squareColor
                newSquare.id = (file * 8 + rank).toString()
                newSquare.ondrop = drop
                newSquare.ondragover = allowDrop
                newSquare.onclick = showMoves
                newSquare.oncontextmenu = rightClick
                pieceAsset.id = (file * 8 + rank).toString() + "a"
                pieceAsset.src = ""
                pieceAsset.style.height = "100%"
                pieceAsset.draggable = true
                pieceAsset.ondragstart = drag
                newSquare.appendChild(pieceAsset)
            }
        }
    }

    resetMoves() {

        // ter array so com as peças sff

        for (var i = 0; i < 64; i++) {
            if (board.Square[i] != null) board.Square[i].moves = []
        }
    }

    getCoordsArray() {
        var count = 0
        for (var i = 0; i < 8; i++) {
            for (var j = 0; j < 8; j++) {
                this.coords[count] = [i, j]
                count++
            }
        }
    }

    PositionToCoords(position) {
        if (this.coords.length == 1) board.getCoordsArray()
        return this.coords[position]
    }

    CoordsToPosition(coords) {
        return coords[0] * 8 + coords[1]
    }

    async LoadPosition(FEN) {
        board.castleString = ""
        this.position = FEN
            // Recebe uma string com a posição do tabuleiro e poe as peças no sitio
        var count = 0
        var position = 0;
        var type = "",
            color = ""
        var piece = new Piece(InvertColor(board.colorToMove), null, null)
        for (var i = 0; i < FEN.length; i++) {
            //await sleep(50);
            var char = FEN.charAt(i)
                // Pass empty spaces
            if (char >= '0' && char <= '9') {
                position = position + parseInt(char)
            } else if (char == "/") {
                // muda de linha
            } else if (char == " ") {
                // Turn
                if (count == 0) {
                    i++
                    this.move = FEN.charAt(i)
                    count++
                } else if (count == 1) {
                    // Castle
                    i++
                    while (FEN.charAt(i) != " ") {
                        this.castleString += FEN.charAt(i)
                        i++
                    }
                    count++
                } else if (count == 2) {
                    // EnPassant
                    i++
                    while (FEN.charAt(i) != " ") {
                        this.enPassant += FEN.charAt(i)
                        i++
                    }
                    count++
                }
            } else {
                // Black Pieces
                if (char >= 'a' && char <= 'z') {
                    type = char
                    color = "b"
                    this.Square[position] = new Piece(color, type, position)
                    if (type == "k") this.blackKing = position
                    position++
                } else {
                    // White Pieces
                    type = char.toLowerCase()
                    color = "w"
                    this.Square[position] = new Piece(color, type, position)
                    if (type == "k") this.whiteKing = position
                    position++
                }
            }
        }
        board.colorToMove = InvertColor(board.colorToMove)
        piece.getValidMoves(piece)
        board.colorToMove = InvertColor(board.colorToMove)
        piece = new Piece(board.colorToMove, null, null)
        piece.getValidMoves(piece)
    }

    ClearBoard() {
        for (var i = 0; i < 64; i++) {
            this.Square[i] = null
            try {
                document.getElementsByTagName("img")[i].src = ""
            } catch {}
        }
    }

    GenerateAllMovesTest() {
        var piece = new Piece(board.colorToMove, null, null)
        piece.getValidMoves(piece)
        piece.color == InvertColor(piece.color)
    }
}