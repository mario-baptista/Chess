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
    if (document.getElementById(id).style.backgroundColor != white && document.getElementById(id).style.backgroundColor != dark) {
        MovePiece(board.selectedPiece, board.selectedPiece.position + "a", id)
    } else {
        for (var i = 0; i < 64; i++) {
            var piece = board.Square[i]
            if (piece == null) continue
            for (var j = 0; j < piece.moves.length; j++) {
                document.getElementById(piece.moves[j].TargetSquare).style.backgroundColor = board.defaultColors[piece.moves[j].TargetSquare]
            }
            piece.moves = []
        }
        piece = board.Square[id]
        if (piece == null) return
        piece.moves = []

        board.selectedPiece = piece
        for (var i = 0; i < piece.moves.length; i++) {
            if (piece.moves[i].TargetSquare > 63) continue
            document.getElementById(piece.moves[i].TargetSquare).style.backgroundColor = "#de3d4c"
        }
    }
}

function rightClick(ev) {
    ev.preventDefault();
    for (var i = 0; i < 64; i++) {
        var piece = board.Square[i]
        if (piece == null) continue
        for (var j = 0; j < piece.moves.length; j++) {
            document.getElementById(piece.moves[j].TargetSquare).style.backgroundColor = board.defaultColors[piece.moves[j].TargetSquare]
        }
        // piece.moves = []
    }
}

function drag(ev) {
    ev.dataTransfer.setData("text", ev.target.id);
    var pos = ev.target.id.slice(0, -1)
    var piece = board.Square[pos]
    if (!piece.IsColor(piece, board.colorToMove)) return

    for (var i = 0; i < piece.moves.length; i++) {
        if (piece.moves[i].TargetSquare > 63) continue
        document.getElementById(piece.moves[i].TargetSquare).style.backgroundColor = "#de3d4c"
    }
    //piece.getValidMoves(piece)
}

async function drop(ev) {
    ev.preventDefault();
    // data = id da peça a ser arrastada
    // ev.target.id = id do quadrado onde quero mover a peça
    var data = ev.dataTransfer.getData("text");
    var piece = board.Square[data.slice(0, -1)]
    for (var i = 0; i < 64; i++) {
        document.getElementById(i).style.backgroundColor = board.defaultColors[i]
    }
    var boo = MovePiece(piece, data, ev.target.id)
    if (!boo) {
        piece.moves = []
        piece.getValidMoves(piece)
    }
}

async function askPromote(piece, targetSquare) {
    if (await confirm("Queen?")) {
        Promote(piece, "q")
    } else {
        let promotion = await prompt("q - Queen | r - Rook | b - Bishop | n - knight:", "q");
        if (promotion == null || promotion == "" || (promotion != "q" && promotion != "r" && promotion != "b" && promotion != "n")) {
            Promote(piece, "q")
        } else {
            Promote(piece, promotion)
        }
    }
}

function Promote(piece, pieceToPromoteTo) {
    piece.type = pieceToPromoteTo
    document.getElementById(piece.position + "a").src = "img/" + piece.color + pieceToPromoteTo + ".png"
}

async function MovePiece(piece, startSquare, targetSquare, force = false) {
    if (piece.color != board.colorToMove) return false
        // Remover a cor dos moves possiveis
    for (var i = 0; i < piece.moves.length; i++) {
        document.getElementById(piece.moves[i].TargetSquare).style.backgroundColor = board.defaultColors[piece.moves[i].TargetSquare]
    }
    // Verificar se o move é possível
    for (var i = 0; i < piece.moves.length; i++) {
        if ((piece.moves[i].TargetSquare + "a") == targetSquare) var greenlight = true
        else if ((piece.moves[i].TargetSquare) == targetSquare) var greenlight = true
    }
    // Se n for baza
    if (!greenlight && !force) return false
    piece.moves = []
    if (targetSquare == startSquare) return false
    if (document.getElementById(targetSquare).tagName !== "IMG") {
        // Mover peça
        var img = document.getElementById(targetSquare + "a")
        img.src = ""
        var aux = startSquare.slice(0, -1)
        var aux1 = targetSquare
        var color = board.Square[aux].color
        var type = board.Square[aux].type
        board.Square[aux1] = new Piece(color, type, aux1)
        board.Square[aux] = null
        img.src = document.getElementById(startSquare).src
        document.getElementById(startSquare).src = ""
        if (targetSquare == board.enPassant) {
            var aux2 = board.colorToMove == "w" ? parseInt(targetSquare) + 8 : parseInt(targetSquare) - 8
            board.Square[aux2] = null
            document.getElementById(aux2 + "a").src = ""
        }
        // Promover peao
        if ((aux1 <= 7 || aux1 >= 56) && board.Square[aux1].IsType(board.Square[aux1], board.Square[aux1].Pawn)) {
            // askPromote(board.Square[aux1], targetSquare)
            Promote(board.Square[aux1], "q")
        }

        // EnPassant
        board.enPassant = null
        if (board.Square[aux1].IsType(board.Square[aux1], piece.Pawn)) {
            if (Math.abs(parseInt(aux) - parseInt(aux1)) == 16) {
                board.enPassant = board.colorToMove == "w" ? parseInt(targetSquare) + 8 : parseInt(targetSquare) - 8
            }
        }

        // Castle

        if (piece.IsType(piece, piece.King) && Math.abs(parseInt(aux) - parseInt(aux1)) == 2) {
            var color = board.colorToMove
            if (color == "w" && aux - aux1 == 2) {
                // White Queenside Catle
                board.castleString.search("Q")
                board.castleString = board.castleString.replace('Q', '');
                MovePiece(board.Square[56], 56 + "a", 59 + "", true)
            } else if (color == "w" && aux - aux1 == -2) {
                // White Kingside Castle
                board.castleString.search("K")
                board.castleString = board.castleString.replace('K', '');
                MovePiece(board.Square[63], 63 + "a", 61 + "", true)
            } else if (color == "b" && aux - aux1 == 2) {
                // Black Queenside Catle
                board.castleString.search("q")
                board.castleString = board.castleString.replace('q', '');
                MovePiece(board.Square[0], 0 + "a", 3 + "", true)
            } else if (color == "b" && aux - aux1 == -2) {
                // Black Kingside Catle
                board.castleString.search("k")
                board.castleString = board.castleString.replace('k', '');
                MovePiece(board.Square[7], 7 + "a", 5 + "", true)
            }
            board.colorToMove = InvertColor(board.colorToMove)
        }

    } else {
        // Take peça       
        var aux = startSquare.slice(0, -1)
        var aux1 = targetSquare.slice(0, -1)
        board.Square[aux1].color = board.Square[aux].color
        board.Square[aux1].type = board.Square[aux].type
        board.Square[aux] = null
        document.getElementById(targetSquare).src = document.getElementById(startSquare).src
        document.getElementById(startSquare).src = ""

        // Promover peao
        if ((aux1 <= 7 || aux1 >= 56) && board.Square[aux1].IsType(board.Square[aux1], board.Square[aux1].Pawn)) {
            // askPromote(board.Square[aux1], targetSquare)
            Promote(board.Square[aux1], "q")
        }
        board.enPassant = null
    }
    var auxPiece = new Piece(board.colorToMove, null, null)
    board.blockCheck = []
    board.isInCheck = false
    board.resetMoves()
    auxPiece.getValidMoves(piece)
    board.colorToMove = InvertColor(board.colorToMove)
    piece.moves = []
    piece.getValidMoves(piece)
}

function InvertColor(color) {
    return color == "w" ? "b" : "w"
}

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

var board = new Board()
var StartingPosition = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"
board.LoadPosition(StartingPosition)


function importFENString() {
    board.ClearBoard()
    var FEN = document.getElementById("FENstring").value
    board.LoadPosition(FEN)
}