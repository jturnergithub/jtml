import RadioItem from "./RadioItem.js";
import ChooserTag from "../markup/ChooserTag.js";

/**
 * A concrete manifestation of the awkwardly-named "radio button group".
 * 
 * A Radio can be bound to an array, although doing so yields whimsical
 * UI behavior; such a binding lets items be added to or removed
 * from the radio, and that's not often seen. More commonly, Radios
 * (a.k.a "radio button groups") are fixed, with the buttons never changing.
 * There are probably some edge cases out there where the buttons have to
 * be generated dynamically, though.
 */
export default class Radio extends ChooserTag {

    #layout;

    constructor(factory = item => this.itemFactory(item)) {
        super("div", ChooserTag.Mode.SINGLE);
        this.children.factory = factory;
        this.classes("jtml-ui jtml-radio")
        this.layout(Radio.Layout.VERTICAL);
    }

    itemFactory(item) {
        if (item instanceof RadioItem) {
            return item;
        }
        else {
            return new RadioItem(`jtml-radio-${this.serialNbr}`, item)
        }
    }

    layout(layout) {
        if (layout === undefined) {
            return this.#layout;
        }
        else {
            this.#layout = layout;
            this.removeClasses(layout === Radio.Layout.HORIZONTAL ? "jtml-layout-vertical" : "jtml-layout-horizontal");
            this.addClasses("jtml-layout-" + layout);
            return this;
        }
    }

    /**
     * Enables/disables the radio items. Same logic as in ContainerTag, but Radio isn't a ContainerTag!
     * 
     * @param {boolean} disabled 
     */
    setDisabled(disabled) {
        for (const child of this.children.members) {
            // Filter out text children and other anomalies
            if (child.setDisabled) {
                child.setDisabled(disabled);
            }
        }
    }
}

Radio.Layout = {
    HORIZONTAL : "horizontal",
    VERTICAL   : "vertical"
}
