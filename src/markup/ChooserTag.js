import {deproxify} from "../bind/Binding.js";
import ValueTag from "./ValueTag.js";

/**
ChooserTags come in two families.

The intrinsic family is implemented by HTML. We're talking about radio button
groups and selects, basically. For these, selection behavior is automatic.
User clicks on/selects thing, widget now has new value.

The artificial family is things like lists, divs, and tables that are *used as*
choosers. When the user clicks on a sub-item, that item is "selected", but
HTML doesn't handle it. We have to register the click and change the value of
the ChooserTag.

The distinction really comes out when we're talking about the
*children* of a ChooserTag. Options and radio buttons don't have to do anything
other than exist; their selection behavior is automatic. List items and divs
and images and table rows that can be selected have to add in a layer of
functionality on top of what the DOM provides.
**/
export default class ChooserTag extends ValueTag {

    #mode;
    #required;

    constructor(name, mode = ChooserTag.Mode.SINGLE) {
        super(name);
        this.mode(mode);
        this.always((jtml, index) => jtml.classes(index % 2 ? "jtml-odd" : "jtml-even"));
        this.callbacks = {
            select : [],
            deselect : []
        }
    }

    /**
     * Gets or sets the selection mode--single or multiple. Subclasses may override this.
     *
     * @param {Mode.SINGLE|Mode.MULTIPLE} mode 
     * @returns 
     */
    mode(mode) {
        if (mode === undefined) {
            return this.#mode;
        }
        else {
            this.#mode = mode;
            return this
        }
    }

    /**
     * Sets the selection to required or not-required. This has no effect if in multiple-select
     * mode. In single-select mode, setting required = true means that clicking on a selected
     * item doesn't deselect it, and that the first item is selected by default.
     * 
     * @param {boolean} required 
     */
    required(required) {
        if (required === undefined) {
            return this.#required;
        }
        else {
            this.#required = required;
            return this;
        }
    }

    /**
    Gets or sets the factory object used to manufacture child items. The default
    typically converts an object to an item-type tag with the object's toString() as its
    text. In a more sophisticated case, a ChooserTag may be bound to a list of objects
    rather than strings, and it may need to display those objects in a format unrelated
    to their toString() method. The caller of the ChooserTag constructor is
    responsible for setting an appropriate factory object to do this conversion.
    Any list items added before the custom factory is set will, by definition, use
    the default factory.
    **/
    factory(factory) {
        if (factory === undefined) {
            return this.children.factory;
        }
        else {
            this.children.factory = factory;
            return this;
        }
    }

    /**
     * Binds the ChooserTag to a selection. The value of the chooser tag is the
    selected thing, or things.

    This method does not bind the chooser tag to an array of values!
    **/
    bind(key, initial) {
        if (initial === undefined) {
            switch (this.mode()) {
                case ChooserTag.Mode.MULTIPLE:
                    initial = [];
                    break;
                case ChooserTag.Mode.SINGLE:
                default:
                    initial = this.required() ? this.selectables()[0]?.evaluate() : undefined;
            }
        }
        this.keys.binding = key;
        this.keys.index   = `jtml-${key}-index`;
        this.event        = this.event || "click";
        return super.bind(key, initial);
    }

    /**
     * Sets the "selected" value to true for those selectable elements whose
     * value equals a member of the values array. This method is called when any
     * code sets the value of the ChooserTag's binding.
     * 
     * Implements the method specified in ValueTag.
     * 
     * @param {[*]} values The values of the selected items, or a single value if in single-
     * select mode.
     */
    display(selections = []) {
        if (!Array.isArray(selections)) {
            // For single-select choosers, selections is a lone value. To simplify the code in
            // this method, convert to a one-item array.
            selections = [selections];
        }
        // HACK. If the selections array is full of proxies, then using indexOf() on it
        // is unreliable. Replace with array of raw values.
        selections = selections.map(selection => deproxify(selection));
        // We're going to want a record of all the selected indices. That's not the same
        // the index *among the selections*; we want the index *among the selectables*.
        const indices = [];
        let i = 0;
        for (const selectable of this.selectables()) {
            const value = deproxify(selectable.evaluate());
            const selected = selections.indexOf(value) !== -1;
            // Check if state is different
            const changed = selected !== this.selected(selectable);
            // Mark the child as selected if its value is anywhere in the selections array.
            this.selected(selectable, selected);
            // Keep the index if it's meaningful
            if (selected) {
                // Here i is the index of the selectable among its siblings.
                indices.push(i);
            }
            if (changed) {
                const callbacks = this.callbacks[selected ? "select" : "deselect"];
                for (const callback of callbacks) {
                    callback(selectable.evaluate(), i, `${this.keys.binding}[${i}]`);
                }
            }
            i++;
        }
        if (this.mode() === ChooserTag.Mode.SINGLE) {
            // Set bound value
            this.set(this.keys.index, indices[0]);
        }
        else {
            // Set bound array value
            this.set(this.keys.index, indices.sort((a, b) => a - b));
        }
        return this;
    }
    
    select(callback) {
        this.callbacks.select.push(callback);
        return this;
    }

    deselect(callback) {
        this.callbacks.deselect.push(callback);
        return this;
    }
      
    selectables() {
        return this.children.members;
    }

    /**
     * If called with one argument, determines whether a potentially-selectable choice 
     * is, in fact, selected. If given a boolean second argument, selects or deselects
     * the choice. By default, asks the selectable item if it's selected. (The default 
     * for that, in turn, is to check the value of the #selected private member. )
     * 
     * Subclasses may override this.
     * 
     * @param {tag} selectable 
     * @param {boolean} selected 
     * @returns 
     */
    selected(selectable, selected) {
        return selectable.selected(selected);
    }

    selections() {
        return this.selectables().filter(selectable => this.selected(selectable));
    }
    
    /**
     * This method is called when the user clicks on an item. For a single select,
     * it returns the value of the (hopefully) one selected child, or undefined if
     * no child is selected. For a multiple select, it returns the values of all
     * selected children in an array.
     */
    inspect() {
        const selections = this.selections().map(selection => selection.evaluate());
        if (this.mode() === ChooserTag.Mode.SINGLE) {
            return selections[0];
        }
        else {
            return selections;
        }
    }

}

ChooserTag.Mode = {
    SINGLE   : "single",
    MULTIPLE : "multiple"
}
