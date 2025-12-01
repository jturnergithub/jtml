export default class Guess {

    constructor(width) {
        this.width = width;
        this.elements = [{ digit : "" }];
        this.complete = false;
    }

    push(digit) {
        this.elements[this.elements.length - 1].digit = digit;
        this.complete = this.elements.length === this.width;
        if (!this.complete) {
            this.elements.push({ digit : "" });
        }
    }

    pop() {
        if (this.elements.length > 1) {
            this.elements.pop();
            this.elements.pop();
            this.elements.push({ digit : "" });
        }
    }

    includes(digit) {
        return !!this.elements.filter(element => element.digit === digit).length;
    }

    check(solution) {
        if (this.complete) {
            const unmatched = this.checkBulls(solution);
            if (unmatched.length === 0) {
                this.cowCt = 0;
            }
            else {
                this.checkCows(unmatched);
            }
        }
    }

    checkBulls(solution) {
        const unmatched = [];
        for (let i = 0; i < solution.length; i++) {
            if (solution[i] === this.elements[i].digit) {
                this.elements[i].result = "bull";
            }
            else {
                unmatched.push(solution[i]);
            }
        }
        this.bullCt = solution.length - unmatched.length;
        return unmatched;
    }

    checkCows(unmatched) {
        let cowCt = 0;
        for (const element of this.elements) {
            const index = unmatched.indexOf(element.digit);
            if (index != -1) {
                element.result = "cow";
                cowCt++;
                unmatched.splice(index, 1);
            }
        }
        this.cowCt = cowCt;
    }
}