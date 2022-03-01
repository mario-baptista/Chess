var white = "white"
var dark = "#ababab"

var boarddiv = document.getElementById("mainChessBoard")

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function allowDrop(ev) {
    ev.preventDefault();
}

function showMoves(ev) {
    var id = this.id
    var piece = board.Square[id]
    piece.moves = []
    piece.getValidMoves(piece)
}

function rightClick(ev) {
    ev.preventDefault();
    for (var i = 0; i < 64; i++) {
        var piece = board.Square[i]
        if (piece == null) continue
        for (var j = 0; j < piece.moves.length; j++) {
            document.getElementById(piece.moves[j].TargetSquare).style.backgroundColor = board.defaultColors[piece.moves[j].TargetSquare]
        }
        piece.moves = []
    }
}

function drag(ev) {
    ev.dataTransfer.setData("text", ev.target.id);
    var pos = ev.target.id.slice(0, -1)
    var piece = board.Square[pos]
    piece.moves = []
    piece.getValidMoves(piece)
}

async function drop(ev) {
    ev.preventDefault();
    // data = id da peça a ser arrastada
    // ev.target.id = id do quadrado onde quero mover a peça
    var data = ev.dataTransfer.getData("text");
    var piece = board.Square[data.slice(0, -1)]
    for (var i = 0; i < piece.moves.length; i++) {
        document.getElementById(piece.moves[i].TargetSquare).style.backgroundColor = board.defaultColors[piece.moves[i].TargetSquare]
    }
    for (var i = 0; i < piece.moves.length; i++) {
        if ((piece.moves[i].TargetSquare + "a") == ev.target.id) var greenlight = true
        else if ((piece.moves[i].TargetSquare) == ev.target.id) var greenlight = true
    }
    if (!greenlight) return
    piece.moves = []
    if (ev.target.id == data) return
    if (ev.target.nodeName !== "IMG") {
        // move piece
        var img = document.getElementById(ev.target.id + "a")
        img.src = ""
        var aux = data.slice(0, -1)
        var aux1 = ev.target.id
        board.Square[aux1] = new Piece(null, null, aux1)
        board.Square[aux1].color = board.Square[aux].color
        board.Square[aux1].type = board.Square[aux].type
        board.Square[aux].color = ""
        board.Square[aux].type = ""
        board.Square[aux].moves = []
        img.src = document.getElementById(data).src
        document.getElementById(data).src = ""
    } else {
        // eat piece
        ev.target.src = ""
        var aux = data.slice(0, -1)
        var aux1 = ev.target.id.slice(0, -1)
        board.Square[aux1].color = board.Square[aux].color
        board.Square[aux1].type = board.Square[aux].type
        board.Square[aux].color = ""
        board.Square[aux].type = ""
        board.Square[aux].moves = []
        ev.target.src = document.getElementById(data).src
        document.getElementById(data).src = ""
    }
}

class Move {
    constructor(StartSquare, TargetSquare) {
        this.StartSquare = StartSquare;
        this.TargetSquare = TargetSquare;
    }
}


class Piece {
    constructor(color, type, position) {
        this.color = color;
        this.type = type;
        this.position = position
        this.moves = []
        var pieceAsset = document.getElementsByTagName("img")[position]
        try {
            pieceAsset.src = "img/" + color + type + ".png"
        } catch {
            return
        }
    }

    get Pawn() {
        return "p"
    }

    get Knight() {
        return "n"
    }

    get Bishop() {
        return "b"
    }

    get Rook() {
        return "r"
    }

    get Queen() {
        return "q"
    }

    get King() {
        return "k"
    }

    IsColor(piece, colortomove) {
        if (piece == null) return false
        return piece.color == colortomove
    }

    IsSlidingPiece(piece) {
        return piece.type == "b" || piece.type == "r" || piece.type == "q"
    }

    IsType(piece, pieceToCompareTo) {
        return piece.type == pieceToCompareTo
    }

    getValidMoves(piece) {

        function GenerateKnightMoves(startSquare, piece, friendlyColor) {
            var DirectionOffsets = [-17, -15, -6, 10, 17, 15, 6, -10]
            for (var i = 1; i < 8; i++) {
                if (i * 8 > startSquare) {
                    var file = i - 1
                    var rank = startSquare - file * 8
                    break
                }
            }
            if (file < 2) DirectionOffsets = [-6, 10, 17, 15, 6, -10]
            else if (file < 1) DirectionOffsets = [10, 17, 15, 6]
            else if (file > 5) DirectionOffsets = [-17, -15, -6, 10, 6, -10]
            else if (file > 6) DirectionOffsets = [-17, -15, -6, -10]
            if (rank < 2) DirectionOffsets = [-17, -15, -6, 10, 17, 15]
            else if (rank < 1) DirectionOffsets = [-6, 10, 17, 15]
            else if (rank > 5) DirectionOffsets = [-17, -15, 17, 15, 6, -10]
            else if (rank > 6) DirectionOffsets = [-17, -15, 6, -10]
        }


        function GenerateSlidingMoves(startSquare, piece, friendlyColor) {

            var DirectionOffsets = [8, 1, -1, -8, 7, -7, 9, -9]
            var numSquaresToEdge = [
                []
            ]
            for (var file = 0; file < 8; file++) {
                for (var rank = 0; rank < 8; rank++) {

                    var numEast = 7 - rank
                    var numWest = rank
                    var numNorth = file
                    var numSouth = 7 - file

                    var squareIndex = file * 8 + rank
                    numSquaresToEdge[squareIndex] = [
                        numSouth,
                        numEast,
                        numWest,
                        numNorth,
                        numWest < numSouth ? numWest : numSouth,
                        numEast < numNorth ? numEast : numNorth,
                        numEast < numSouth ? numEast : numSouth,
                        numWest < numNorth ? numWest : numNorth
                    ]
                }
            }
            var startDirIndex = (piece.IsType(piece, piece.Bishop)) ? 4 : 0
            var endDirIndex = (piece.IsType(piece, piece.Rook)) ? 4 : 8

            for (var directionIndex = startDirIndex; directionIndex < endDirIndex; directionIndex++) {
                for (var n = 0; n < numSquaresToEdge[startSquare][directionIndex]; n++) {
                    var targetSquare = startSquare + DirectionOffsets[directionIndex] * (n + 1)
                    var pieceOnTargetSquare = board.Square[targetSquare]

                    var opponentColor = friendlyColor == "w" ? "b" : "w"

                    // Blocked by friendly piece (cant move further in this direction)
                    if (piece === null) continue
                    if (piece.IsColor(pieceOnTargetSquare, friendlyColor)) {
                        break
                    }

                    piece.moves.push(new Move(startSquare, targetSquare))

                    // Can´t move any further in this direction after capturing opponent's piece
                    if (piece.IsColor(pieceOnTargetSquare, opponentColor)) {
                        break
                    }
                }
            }
        }

        function generateAllMoves(colorToMove) {
            for (var startSquare = 0; startSquare < 64; startSquare++) {
                var piece = parseInt(board.Square[startSquare])
                if (piece == null) continue
                if (piece.IsColor(piece, colorToMove)) {
                    if (piece.IsSlidingPiece(piece)) {
                        GenerateSlidingMoves(startSquare, piece, colorToMove)
                    }
                }
            }
        }

        function GenerateMovesForPiece(piece) {
            if (piece == null) return
            var startSquare = parseInt(piece.position)
            if (piece.IsColor(piece, board.colorToMove)) {
                if (piece.IsSlidingPiece(piece)) {
                    GenerateSlidingMoves(startSquare, piece, board.colorToMove)
                } else if (piece.IsType(piece, piece.Knight)) {
                    GenerateKnightMoves(startSquare, piece, board.colorToMove)
                }
            }
            for (var i = 0; i < piece.moves.length; i++) {
                if (piece.moves[i].TargetSquare > 63) continue
                document.getElementById(piece.moves[i].TargetSquare).style.backgroundColor = "#de3d4c"
            }
        }



        // generateAllMoves(board.colorToMove)
        GenerateMovesForPiece(piece)
    }
}

class Board {
    constructor() {
        this.colorToMove = "w";
        this.position = "";
        this.Square = []
        this.castleString = "";
        this.enPassant = "";
        this.defaultColors = []
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

    async LoadPosition(FEN) {
        this.position = FEN
            // Recebe uma string com a posição do tabuleiro e poe as peças no sitio
        var count = 0
        var position = 0;
        var type = "",
            color = ""
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
                    position++
                } else {
                    // White Pieces
                    type = char.toLowerCase()
                    color = "w"
                    this.Square[position] = new Piece(color, type, position)
                    position++
                }
            }
        }
    }

    ClearBoard() {
        for (var i = 0; i < 64; i++) {
            this.Square[i] = null
            try {
                document.getElementsByTagName("img")[i].src = ""
            } catch {}
        }
    }
}

var board = new Board()
var StartingPosition = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"
board.LoadPosition(StartingPosition)


function importFENString() {
    board.ClearBoard()
    var FEN = document.getElementById("FENstring").value
    board.LoadPosition(FEN)
}