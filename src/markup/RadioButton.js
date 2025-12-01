import InputTag from "./InputTag.js";

/**
 * An input of type "radio". 
 * 
 */
export default class RadioButton extends InputTag {

    constructor(name, value) {
        super("input", "radio");
        this.attr("name", name);
        this.attr("value", value);
        this.classes("jtml-radio-button");
    }

    /**
     * If a RadioButton is bound, it should be bound to a boolean--even though
     * its nominal value is probably *not* a boolean. That's because changing
     * the bound value should change the button's state/appearance, not its
     * name or its value if checked.
     * 
     * @param {string} key 
     * @param {*} initial 
     * @param {*} callback 
     * @returns this
     */
    bind(key, initial) {
        return super.bind(key, !!initial);
    }

    /**
     * Called by any code that changes the radio button's bound value.
     * 
     * @param {boolean} selected 
     */
    display(selected) {
        this.domNode.checked = selected;
    }

    /**
     * Called when the user clicks this radio button so that the binding
     * can get updated with the result of the click.
     * 
     * @returns boolean: selected or not selected
     */
    inspect() {
        return this.domNode.checked;
    }
}
