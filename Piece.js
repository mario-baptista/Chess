var blockCheckColor = "#f66f2e"
var pinnedPieceColor = "#d4b000"

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

            var DirectionOffsets = [
                [-2, 1],
                [-1, 2],
                [1, 2],
                [2, 1],
                [2, -1],
                [1, -2],
                [-1, -2],
                [-2, -1]
            ]

            for (var index = 0; index < DirectionOffsets.length; index++) {
                var coordsStartSquare = board.PositionToCoords(startSquare)
                if (coordsStartSquare[0] + DirectionOffsets[index][0] >= 0 && coordsStartSquare[0] + DirectionOffsets[index][0] < 8 && coordsStartSquare[1] + DirectionOffsets[index][1] >= 0 && coordsStartSquare[1] + DirectionOffsets[index][1] < 8) {

                    var targetSquare = board.CoordsToPosition([coordsStartSquare[0] + DirectionOffsets[index][0], coordsStartSquare[1] + DirectionOffsets[index][1]])
                    var pieceOnTargetSquare = board.Square[targetSquare]

                    // Blocked by friendly piece
                    if (piece.IsColor(pieceOnTargetSquare, friendlyColor)) {
                        continue
                    }

                    // So adiciona se bloquear o check
                    if (board.isInCheck) {
                        if (board.blockCheck.includes(targetSquare)) {
                            piece.moves.push(new Move(startSquare, targetSquare))
                            board.isBeingAttacked[targetSquare] = true
                        } else {
                            continue
                        }
                    }

                    piece.moves.push(new Move(startSquare, targetSquare))
                    board.isBeingAttacked[targetSquare] = true

                    var opponentColor = InvertColor(friendlyColor)

                    if (piece.IsColor(pieceOnTargetSquare, opponentColor)) {
                        var kingSquare = targetSquare
                        var blockCheckSquare = startSquare
                        if (pieceOnTargetSquare.IsType(pieceOnTargetSquare, piece.King)) {
                            board.blockCheck.push(startSquare)
                            board.isInCheck = true
                            document.getElementById(blockCheckSquare).style.backgroundColor = blockCheckColor
                        }
                    }
                }
            }
        }

        function GenerateKingMoves(startSquare, piece, friendlyColor) {

            var DirectionOffsets = [8, 1, -1, -8, 7, -7, 9, -9]

            // Castle

            if (friendlyColor == "w" && board.castleString.includes("Q")) DirectionOffsets.push(-2)
            if (friendlyColor == "w" && board.castleString.includes("K")) DirectionOffsets.push(2)
            if (friendlyColor == "b" && board.castleString.includes("q")) DirectionOffsets.push(-2)
            if (friendlyColor == "b" && board.castleString.includes("k")) DirectionOffsets.push(2)

            var canKingSideCastle = true,
                canQueenSideCastle = true

            for (var i = 1; i < 3; i++) {
                if (board.Square[startSquare + i] != null) canKingSideCastle = false
            }

            for (var i = 1; i < 4; i++) {
                if (board.Square[startSquare - i] != null) canQueenSideCastle = false
            }


            for (var directionIndex = 0; directionIndex < DirectionOffsets.length; directionIndex++) {

                var targetSquare = startSquare + DirectionOffsets[directionIndex]
                if (board.isBeingAttacked[targetSquare]) continue
                if (board.kingCantMoveHere.includes(targetSquare)) continue
                if (targetSquare < 0 || targetSquare > 63) continue

                var pieceOnTargetSquare = board.Square[targetSquare]

                // Blocked by friendly piece (cant move further in this direction)
                if (piece.IsColor(pieceOnTargetSquare, friendlyColor)) {
                    continue
                }

                var Kingcoords = board.PositionToCoords(targetSquare)

                if (board.isInCheck) {
                    if (Kingcoords[0] == board.checkRank || Kingcoords[1] == board.checkFile) continue
                    if (board.blockCheck.includes(targetSquare)) continue
                }

                if (board.blockCheck.includes(targetSquare) && board.Square[targetSquare] == null) continue
                if (DirectionOffsets[directionIndex] == -2 && !canQueenSideCastle) continue
                if (DirectionOffsets[directionIndex] == 2 && !canKingSideCastle) continue

                piece.moves.push(new Move(startSquare, targetSquare))
                board.isBeingAttacked[targetSquare] = true

            }
        }

        function GeneratePawnMoves(startSquare, piece, friendlyColor) {
            var DirectionOffsets = friendlyColor == "b" ? [8, 7, 9] : [-8, -7, -9]

            var firstMove = false

            if (startSquare <= 15 && friendlyColor == "b" || startSquare >= 48 && friendlyColor == "w") firstMove = true

            // So adiciona se bloquear o check
            if (board.isInCheck) {
                if (board.blockCheck.includes(targetSquare)) {
                    piece.moves.push(new Move(startSquare, targetSquare))
                    board.isBeingAttacked[targetSquare] = true
                } else {
                    return
                }
            }


            if (firstMove) {
                targetSquare = startSquare + 2 * DirectionOffsets[0]
                pieceOnTargetSquare = board.Square[targetSquare]

                if (pieceOnTargetSquare == null) {
                    piece.moves.push(new Move(startSquare, targetSquare));
                    board.isBeingAttacked[targetSquare] = true
                }
            }

            for (var i = 0; i < DirectionOffsets.length; i++) {
                var targetSquare = startSquare + DirectionOffsets[i]
                var pieceOnTargetSquare = board.Square[targetSquare]

                if (pieceOnTargetSquare == null && i == 0) {
                    piece.moves.push(new Move(startSquare, targetSquare))
                    board.isBeingAttacked[targetSquare] = true
                }
                if (pieceOnTargetSquare != null && i != 0 && pieceOnTargetSquare.color != friendlyColor) {
                    piece.moves.push(new Move(startSquare, targetSquare))
                    board.isBeingAttacked[targetSquare] = true
                    if (pieceOnTargetSquare.IsType(pieceOnTargetSquare, piece.King)) {
                        board.blockCheck.push(startSquare)
                        board.isInCheck = true
                        document.getElementById(startSquare).style.backgroundColor = blockCheckColor
                    }
                }
                if (i != 0 && targetSquare.toString() == board.enPassant) {
                    piece.moves.push(new Move(startSquare, targetSquare))
                    board.isBeingAttacked[targetSquare] = true
                }
            }

        }


        function GenerateSlidingMoves(startSquare, piece, friendlyColor) {

            var DirectionOffsets = [8, 1, -1, -8, 7, -7, 9, -9]

            var startDirIndex = (piece.IsType(piece, piece.Bishop)) ? 4 : 0
            var endDirIndex = (piece.IsType(piece, piece.Rook)) ? 4 : 8

            var opponentColor = InvertColor(friendlyColor)

            var numEnemyPiecesBlocking = 0

            var maybepinned = -1

            for (var directionIndex = startDirIndex; directionIndex < endDirIndex; directionIndex++) {
                for (var n = 0; n < numSquaresToEdge[startSquare][directionIndex]; n++) {
                    var targetSquare = startSquare + DirectionOffsets[directionIndex] * (n + 1)
                    var pieceOnTargetSquare = board.Square[targetSquare]

                    // Blocked by friendly piece (cant move further in this direction)
                    if (piece === null) continue
                    if (piece.IsColor(pieceOnTargetSquare, friendlyColor)) {
                        break
                    }

                    // So adiciona se bloquear o check
                    if (board.isInCheck) {
                        if (board.blockCheck.includes(targetSquare)) {
                            piece.moves.push(new Move(startSquare, targetSquare))
                            board.isBeingAttacked[targetSquare] = true
                        } else {
                            continue
                        }
                    }
                    piece.moves.push(new Move(startSquare, targetSquare))
                    board.isBeingAttacked[targetSquare] = true

                    // Can´t move any further in this direction after capturing opponent's piece
                    if (piece.IsColor(pieceOnTargetSquare, opponentColor)) {
                        var kingSquare = -1
                        var blockCheckSquare
                        if (pieceOnTargetSquare.IsType(pieceOnTargetSquare, piece.King)) {
                            if (numEnemyPiecesBlocking == 1) {
                                board.pinnedPieces.push(maybepinned)
                                document.getElementById(targetSquare).style.backgroundColor = pinnedPieceColor
                            }
                            kingSquare = targetSquare
                            for (var i = 0; i < numSquaresToEdge[startSquare][directionIndex]; i++) {
                                blockCheckSquare = kingSquare - DirectionOffsets[directionIndex] * (i + 1)
                                board.blockCheck.push(blockCheckSquare)
                                document.getElementById(blockCheckSquare).style.backgroundColor = blockCheckColor
                                if (blockCheckSquare == startSquare) break
                            }

                            board.isInCheck = true
                            var aux = board.PositionToCoords(startSquare)
                            if (piece.IsType(piece, piece.Bishop)) {
                                for (var directionIndex = 4; directionIndex < 8; directionIndex++) {
                                    for (var n = 0; n < numSquaresToEdge[startSquare][directionIndex]; n++) {
                                        board.kingCantMoveHere.push(startSquare + DirectionOffsets[directionIndex] * (n + 1))
                                    }
                                }
                            } else {
                                board.checkRank = aux[0]
                                board.checkFile = aux[1]
                            }

                        } else {
                            numEnemyPiecesBlocking++
                            if (targetSquare == 53) console.log(piece)
                            if (numEnemyPiecesBlocking == 2) break
                            else {
                                maybepinned = targetSquare
                                break
                            }
                        }
                        // if (numEnemyPiecesBlocking == 2 && kingSquare == targetSquare) {
                        //     board.pinnedPieces.push(maybepinned)
                        //     document.getElementById(targetSquare).style.backgroundColor = pinnedPieceColor
                        // }
                    }
                    numEnemyPiecesBlocking = 0;
                }
            }
        }

        function generateAllMoves(colorToMove) {
            for (var startSquare = 0; startSquare < 64; startSquare++) {
                var piece = board.Square[startSquare]
                if (piece == null || piece == NaN) continue
                if (piece.IsColor(piece, colorToMove)) {
                    if (piece.IsSlidingPiece(piece)) {
                        GenerateSlidingMoves(startSquare, piece, colorToMove)
                    } else if (piece.IsType(piece, piece.Knight)) {
                        GenerateKnightMoves(startSquare, piece, board.colorToMove)
                    } else if (piece.IsType(piece, piece.King)) {
                        GenerateKingMoves(startSquare, piece, board.colorToMove)
                    } else if (piece.IsType(piece, piece.Pawn)) {
                        GeneratePawnMoves(startSquare, piece, board.colorToMove)
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
                } else if (piece.IsType(piece, piece.King)) {
                    GenerateKingMoves(startSquare, piece, board.colorToMove)
                } else if (piece.IsType(piece, piece.Pawn)) {
                    GeneratePawnMoves(startSquare, piece, board.colorToMove)
                }
            }
            for (var i = 0; i < piece.moves.length; i++) {
                if (piece.moves[i].TargetSquare > 63) continue
                document.getElementById(piece.moves[i].TargetSquare).style.backgroundColor = "#de3d4c"
            }
        }



        generateAllMoves(board.colorToMove)
            // GenerateMovesForPiece(piece)
    }
}