const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
];

export default class Board {

    constructor(squares = Array(9), player = "X") {
        this.squares = squares
        this.player = player;
        this.turn = 0;
    }

    play() {
        this.check();
        this.player = this.player === "X" ? "O" : "X";
        this.turn = this.turn + 1;
    }

    check() {
        for (const line of lines) {
            const [a, b, c] = line;
            if (this.squares[a] && this.squares[a] === this.squares[b] && this.squares[b] === this.squares[c]) {
                this.winner = this.squares[a];
                this.line = line;
                return;
            }
        }
        if (this.turn === 8) {
            this.winner = "draw";
        }
    }

    copy() {
        const board = new Board([...this.squares], this.player);
        board.winner = this.winner;
        board.line = this.line;
        board.turn = this.turn;
        return board;
    }
}