import ArrayUtil from "../../../common/util/ArrayUtil.js";
import Guess from "./Guess.js";

export default class Game {

    constructor(width = 4, duplicates = false) {
        this.width = width;
        this.duplicates = duplicates;
        this.done = true;
        this.difficulty = "easy";
    }

    start() {
        this.done = false;
        this.solution = [];
        if (this.duplicates) {
            for (let i = 0; i < this.width; i++) {
                this.solution.push(Math.floor(10 * Math.random()));
            }
        }
        else {
            const digits = [ 0, 1, 2, 3, 4, 5, 6, 7, 8, 9 ];
            ArrayUtil.shuffle(digits);
            for (let i = 0; i < this.width; i++) {
                this.solution.push(digits.pop())
            }
        }
        this.guesses = [];
        this.guesses.push(new Guess(this.width));
    }

    push(digit) {
        if (this.duplicates || !this.guesses[this.guesses.length - 1].includes(digit)) {
            this.guesses[this.guesses.length - 1].push(digit);
        }
    }

    pop() {
        this.guesses[this.guesses.length - 1].pop();
    }

    check() {
        const guess = this.guesses[this.guesses.length - 1];
        if (guess.complete){
            guess.check(this.solution);
            this.done = guess.bullCt === this.width;
            if (!this.done) {
                this.guesses.push(new Guess(this.width));
            }
        }
    }

    clear() {
        this.guesses[this.guesses.length - 1] = new Guess(this.width);
    }
}