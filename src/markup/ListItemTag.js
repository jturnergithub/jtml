import Tag from "./Tag.js";
import JTMLComponentFactory from "../core/JTMLComponentFactory.js";
import JTMLNode from "../core/JTMLNode.js";
import JTMLText from "../core/JTMLText.js";

export default class ListItemTag extends Tag {

    constructor(attrs) {
        super("li", attrs);
    }

    display(value) {
        super.display(value) || this.text(value);
    }

    evaluate() {
        return super.evaluate() || this.text();
    }

    /**
    This works fine in the simple case, where the <li> contains text and nothing but text.
    **/
    text(text) {
        if (text === undefined) {
            return this.my.text;
        }
        else if (text instanceof JTMLNode) {
            this.my.text = text.evaluate();
            this._(text);
        }
        else if (this.my.text) {
            this.my.text.display(text);
        }
        else if (!this.children.members.length) {
            this.my.text = new JTMLText(text);
            this._(this.my.text);
        }
        else {
            this.text(this.children.first(child => child.text));
        }
        return this;
    }

    toString() {
        if (this.viewers.length) {
            return super.toString() + this.viewers[0].display();
        }
        else {
            return super.toString();
        }
    }



}

ListItemTag.FACTORY = text => JTMLComponentFactory.INSTANCE(text) || new ListItemTag().text(text);
ListItemTag.KEY     = "jtml-selected";
