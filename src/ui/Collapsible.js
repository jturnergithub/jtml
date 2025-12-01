import {JTML, div} from "../../jtml.js";
import ContainerTag from "../markup/ContainerTag.js";

export default class Collapsible extends ContainerTag {

    #rotation = 180;

    constructor(image, title, content) {
        super("div")._(
            div(image, title),
            content
        );
        this.keys.collapsed = `jtml-collapsed-${this.serialNbr}`
        this.keys.direction = `jtml-direction-${this.serialNbr}`;
        image.classes("jtml-collapsible-image");
        title.classes("jtml-collapsible-title");
        content.hidden(this.keys.collapsed);
        this
            .imageSize(24, 24)
            .set(this.keys.direction, JTML.Direction.LEFT_TO_RIGHT)
            .classes("jtml-collapsible")
            .classes("jtml-collapsed", this.keys.collapsed)
            .collapsed(true);
        this.header
            .classes("jtml-collapsible-header")
            .classes("right-to-left", this.keys.direction, JTML.Direction.RIGHT_TO_LEFT)
            .click(() => {
                this.toggle(this.keys.collapsed);
                this.image.style(
                    "transform", 
                    "rotate(" + this.rotation() + "deg)",
                    !this.get(this.keys.collapsed)
                );

            });
        this.content.classes("jtml-collapsible-content");
    }

    get content() {
        return this.children.members[1];
    }

    get header() {
        return this.children.members[0];
    
    }
    get image() {
        return this.header.children.members[0];
    }

    get title() {
        return this.header.children.members[1];
    }

    direction(direction) {
        if (direction === undefined) {
            return this.get(this.keys.direction);
        }
        else {
            this.set(this.keys.direction, direction);
            return this;
        }
    }

    imageSrc(src) {
        if (src === undefined) {
            return this.image.attr("src");
        }
        else {
            this.image.attr("src", src);
            return this;
        }
    }

    imageSize(width, height) {
        if (width === undefined) {
            return [this.image.attr("width"), this.arrow.attr("height")];
        }
        else {
            this.image.width(width).height(height);
            return this;
        }
    }

    rotation(degrees) {
        if (degrees === undefined) {
            return this.#rotation;
        }
        else {
            this.#rotation = degrees;
            return this;
        }
    }

    collapsed(collapsed) {
        if (collapsed === undefined) {
            return this.get(!!this.keys.collapsed);
        }
        else {
            this.set(this.keys.collapsed, collapsed);
        }
    }
}