import ChooserTag from "../markup/ChooserTag.js";

/**
A Chooser wraps a <div> around another tag, where the wrapped tag is something that
innately lacks the chooser nature. For example
* A <ul> used as a menu
* A <table> where the user can click on a <tr> to select it
* A <div> whose children are selectable <div>s with formatted info
* A palette of <img> tags

And so forth. It's not intended for things that are intrinsically choosable (selects, options,
radio buttons).

The upshot is that the Chooser has to do stuff that a <select>, for example,
does for itself. 
**/
export default class Chooser extends ChooserTag {

    #mode;

    constructor(tag, mode) {
        super("div", mode);
        this._(tag);
        this.event = "click";
        this.classes("jtml-chooser");
        tag.classes("jtml-chooser-content");
    }

    get tag() {
        return this.children.members[0];
    }

    bind(key, initial) {
        this.bindChoices(key);
        super.bind(key, initial);
        return this;
    }
    
    bindValues(key = this.tag.children.keys.binding) {
        this.tag.always((jtml, index) => {
            // When any selectable item has its bound value changed out from under it,
            // explicitly get hold of the new value, so it can be used to decide
            // what's selected.
            jtml.monitor(`${key}[${index}]`, value => jtml.value(value));
            // Also notify the chooser itself, so that its display() method is called;
            // otherwise any selection change won't be shown.
            this.monitor(`${key}[${index}]`);
        });
        return this;
    }

    bindChoices(key) {
        this.tag.always((jtml, index) => this.bindChoice(jtml, index, key));
    }

    bindChoice(jtml, index, key) {
        // jtml.keys.binding = jtml.keys.binding || `${key}[${index}]`;
        jtml.keys.selected = `jtml-selected-${key}[${index}]`;
        jtml.classes("jtml-selected", jtml.keys.selected);
        jtml.click(() => this.clickOn(jtml));
    }

    /**
     * Callback function for when the user clicks on any selectable item in the Chooser.
     * In single-select mode, sets the bound value to be equal to the selectable's value if selecting,
     * or to undefined if deselecting. If a selection is required, then this is always considered
     * to be selecting.
     * In multi-select mode, adds the selectable's value to the bound array if selecting, or removes
     * it if deselecting.
     * 
     * @param {Tag} jtml The item that the user clicked
     */
    clickOn(jtml) {
        if (!this.disabled() && !jtml.disabled()) {
            if (this.mode() === Chooser.Mode.SINGLE) {
                const selecting = this.required() || !this.selected(jtml);
                this.set(this.keys.binding, selecting ? jtml.evaluate() : undefined)
            }
            else {
                const selections = this.get(this.keys.binding) || this.set(this.keys.binding, []).get(this.keys.binding);
                const index      = selections.indexOf(jtml.evaluate());
                if (index === -1) {
                    selections.push(jtml.evaluate());
                }
                else {
                    selections.splice(index, 1);
                }
            }
        }
    }

    /**
     * Returns an array of JTML Tags that can be selected. By default, these are the
     * direct children of this Chooser.
     * 
     * @returns The selectable descendants
     */
    selectables() {
        return this.tag.children.members;
    }

    /**
     * Marks a specific selectable thing as selected or not selected.
     * 
     * @param {JTML Tag} selectable 
     * @param {boolean} selected 
     * @returns 
     */
    selected(selectable, selected) {
        selectable.set(selectable.keys.selected, !!selected);
        return super.selected(selectable, selected);
    }
}