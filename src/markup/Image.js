import Tag from "./Tag.js";

export default class Image extends Tag {

    constructor(attrs) {
        super("img", attrs);
    }

    display(src) {
        this.domNode.src = src;
        return this;
    }
}