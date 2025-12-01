import Tag from "./Tag.js";

export default class Button extends Tag {

    constructor() {
        super("button");
        this.attr("type", "button");
    }

    /**
     * Called when a button's bound value changes. This is only important if
     * you want the button to say different things at different times, which is
     * not unknown, but it's maybe not the best behavior for buttons.
     * 
     * A button, if bound, should be bound to a string value; changing the
     * bound value changes the button's text. If the button contains an
     * image instead of text, don't bind the button; bind the Image tag
     * inside it. 
     * 
     * @param {string} text 
     */
    display(text) {
        this.domNode.textContent = text;
    }

}