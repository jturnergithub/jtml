import Tag from "./Tag.js";
import JTMLComponentFactory from "../core/JTMLComponentFactory.js";
import JTMLText from "../core/JTMLText.js";

export default class ListItem extends Tag {

    // #text;

    constructor() {
        super("li");
    }

    textNodes() {
        return this.find(child => child instanceof JTMLText, false);
    }
    
    text(text) {
        if (text === undefined) {
            return this.textNodes()[0]?.inspect();
        }
        else {
            this.textNodes()[0]?.display(text);
            return this;
        }
    }

    display(value) {
        this.text(value);
        return this;
    }

    inspect() {
         return this.text();
    }

    evaluate() {
        return super.evaluate() || this.text(); 
    }

    // /**
    // This works fine in the simple case, where the <li> contains text and nothing but text.
    // **/
    // text(text) {
    //     if (text === undefined) {
    //         return this.#text;
    //     }
    //     else if (text instanceof JTMLNode) {
    //         this.#text = text.evaluate();
    //         this._(text);
    //     }
    //     else if (this.#text) {
    //         this.#text.display(text);
    //     }
    //     else if (!this.children.members.length) {
    //         this.#text = new JTMLText(text);
    //         this._(this.#text);
    //     }
    //     else {
    //         this.text(this.children.first(child => child instanceof JTMLText));
    //     }
    //     return this;
    // }

    toString() {
        if (this.viewers.length) {
            return super.toString() + this.viewers[0].display();
        }
        else {
            return super.toString();
        }
    }

}

ListItem.factory = function(transform = value => value) {
    return (value, index, key) => {
        const li = transform(value, index, key);
        if (li instanceof ListItem) {
            return li;
        }
        else if (Array.isArray(li)) {
            return new ListItem()._(...li)
        }
        else {
            return new ListItem()._(li);
        }
    }

}

ListItem.FACTORY = text => JTMLComponentFactory.INSTANCE(text) || new ListItem().text(text);
ListItem.KEY     = "jtml-selected";
