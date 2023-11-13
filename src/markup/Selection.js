export default class Selection(index, value) {

    constructor(index, value, text = value + "") {
        this.index = index;
        this.value = value;
        this.text  = text;
    }

    equals(that) {
        return this.index === that.index;
    }

}
