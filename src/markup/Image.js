import Tag from "./Tag.js";

export default class Image extends Tag {

    constructor(src) {
        super("img");
        if (src) {
            this.attr("src", src)
        }
    }

    alt(alt) {
        if (alt === undefined) {
            return this.attr("alt");
        }
        else {
            this.attr("alt", alt);
            return this;
        }
    }

    height(height) {
        if (height === undefined) {
            return this.attr("height");
        }
        else {
            this.attr("height", height);
            return this;
        }
    }

    width(width) {
        if (width === undefined) {
            return this.attr("width");
        }
        else {
            this.attr("width", width);
            return this;
        }
    }

    size(width, height) {
        return this.width(width).height(height);
    }

    display(src) {
        this.domNode.src = src;
        return this;
    }
}