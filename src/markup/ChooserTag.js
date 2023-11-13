import ChoiceTag from "./ChoiceTag.js";
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

    constructor(name, attrs, factory) {
        super(name, attrs);
        this.children.factory = factory;
        this.event            = "change";
        // The equality operator is used to determine whether two item values are the
        // same. By default it's just identity.
        this.my.equality      = (v0, v1) => v0 === v1;
        this.my.mode          = ChooserTag.Mode.SINGLE;
    }

    /**
    This chooser's definition of what it means for a selectable item to
    be "equal to" some value. By default, it's good old ===.
    **/
    equality(equality) {
        if (equality === undefined) {
            return this.my.equality;
        }
        else {
            this.my.equality = equality;
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

    // id(id) {
    //     if (id && !this.keys.selection) {
    //         this.keys.selection = id + "-selection";
    //     }
    //     return super.id(id);
    // }

    mode(mode) {
        if (mode === undefined) {
            return this.my.mode;
        }
        else {
            this.my.mode = mode;
            // Temporarily assume that single selection always retains the selection,
            // and multiple select always toggles the selection.
            // TODO: single/optional select mode, where there's only a single
            // selection but clicking on it toggles it off (leaving nothing
            // selected).
            let behavior =
                mode === ChooserTag.SelectionMode.SINGLE
                    ? ChoiceTag.Behavior.RETAIN
                    : ChoiceTag.Behavior.TOGGLE;
            // Every choice has to be given a behavior for when it's clicked, based
            // on the settings of the parent chooser. It also must be bound to the
            // correct index. For example, if the chooser is bound to the array "foo",
            // then the children need to be bound to "foo[0]", "foo[1]", etc.
            this.children.distribute((choice, index) => choice.behavior(behavior));
            return this;
        }
    }

    /**
    Gets or sets the selectables that are actually, you know, selected.
    This function is meant for internal use. Users of the chooser object
    should set its value to the selected item(s) with the display() or
    value() methods.
    **/
    choices(choices) {
        if (choices === undefined) {
            // return existing choices
            return this.selectables().filter(selectable => selectable.selected());
        }
        else {
            // set new choices, unset stale choices, leave everything else alone
            let existing = this.choices();
            let self     = this;
            for (let selectable of this.selectables()) {
                let test = s => self.equality()(selectable, s);
                if (existing.some(test) && !choices.some(test)) {
                    // Deselect
                    selectable.selected(false);
                }
                else if (!existing.some(test) && choices.some(test)) {
                    // Select
                    selectable.selected(true);
                }
            }
            return this;
        }
    }

    /**
    This binds the ChooserTag to a selection. The value of the chooser tag is the
    selected thing, or things.

    This method does not bind the chooser tag to an array of values.
    **/
    bind(key, initial, callback) {
        if (initial === undefined && this.children.members.length) {
            initial = this.children.members[0].evaluate();
        }
        this.event = this.event || "click";
        return super.bind(key, initial, callback);
    }

    /**
    Makes some choices selected. Each managed object that is "equal to" one
    of the values becomes part of the selection.

    Implements the method specified in ValueTag.
    **/
    display(values = []) {
        // TODO: Check selection mode
        if (!Array.isArray(values)) {
            values = [values];
        }
        let equality = this.equality();
        // The filter function passes any child object whose evaluate() function yields
        // something that's equal to *any* value in the values array.
        let filter   = selectable => values.some(value => equality(selectable.evaluate(), value));
        // Reset the selection to be exactly those items that pass the filter
        this.choices(this.selectables().filter(filter));
        return this;
    }

    /**
    Finds the selected components and evaluates each one of them. If this is a single-
    select, returns the first such (if any). If it's a multi-select, returns all of them.

    Implements the method specified in ValueTag.
    **/
    evaluate() {
        let choices = this.choices().map(choice => choice.evaluate());
        if (this.mode() === ChooserTag.Mode.SINGLE) {
            return choices[0];
        }
        else {
            return choices;
        }
    }

    /**
    Gets or sets the list of selections. Operates on Selection objects. This
    is called when we display() a value; its job is to ensure that that value
    is selected, and nothing else is.

    For single selects, that's trivial. For multiselects, there are three cases:
    1. Things that WERE selected and ARE selected should be left alone.
    2. Things that WERE selected and ARE NOT selected should be deselected.
    3. Things that WERE NOT selected and ARE selected should be selected.
    **/
    selections(selections) {
        if (selections === undefined) {
            // return existing selections
            return this.children.members
                .filter(child => child.selected())
                .map(child => child.toSelection());
        }
        else {
            // set new selections, unset stale selections, leave everything else alone
            let prev = this.selections().map(selection => selection.value);
            let curr = selections.map(selection => selection.value);
            for (let child of this.children) {
                let value = child.evaluate();
                let test = element => this.comparator()(value, element);
                if (prev.some(test) && !curr.some(test)) {
                    child.selected(false);
                }
                else if (!prev.some(test) && curr.some(test)) {
                    child.selected(true);
                }
            }
        }
    }

    // move(from, amount) {
    //     // Hint: this array is actually an array proxy--thank you, Binder object--
    //     // and modifying it will notify all the monitors.
    //     let array = this.get(this.keys.items);
    //     let to = from + amount;
    //     if (to >= 0 && to < array.length) {
    //         // delete at from and remember value
    //         let item = array.splice(from, 1)[0];
    //         // reinsert at to
    //         array.splice(to, 0, item);
    //         // rejigger selection if needed
    //         let selection = this.selection();
    //         if (selection) {
    //             if (selection.index === from) {
    //                 // A selected item has moved up or down.
    //                 // this.select(this.children.members[to], true);
    //             }
    //             else {
    //                 let lower = Math.min(from, to);
    //                 let upper = Math.max(from, to);
    //                 if (selection.index >= lower && selection.index <= upper) {
    //                     this.select(this.children.members[selection.index - Math.sign(amount)], true);
    //                 }
    //             }
    //         }
    //     }
    //     return this;
    // }
    //
    // doStuff(from, distance) {
    //     let to         = from + distance;
    //     let lower      = Math.min(from, to);
    //     let upper      = Math.max(from, to);
    //     let selections = this.selection();
    //     if (!Array.isArray(selections)) {
    //         selections = [selections];
    //     }
    //     for (let selection of selections) {
    //         if (selection.index === from) {
    //             selection.index = to;
    //         }
    //         else if (selection.index >= lower && selection.index <= upper) {
    //             selection.index -= Math.sign(distance);
    //         }
    //     }
    //     // update the value, which causes a display refresh
    //     this.set(this.keys.selection, selections);
    // }
    //
    // remove(index) {
    //     let array = this.get(this.keys.items);
    //     // Remove the item. This triggers the binding for ListTag.display(),
    //     // and indirectly triggers the binding for the ChoiceTag bound to the
    //     // removed index.
    //     array.splice(index, 1);
    //     let selection = this.selection();
    //     if (selection) {
    //         let children = this.children.members;
    //         if (!children.length) {
    //             this.unsetSelection();
    //         }
    //         else if (selection.index === index) {
    //             this.select(children[Math.min(index, children.length - 1)], true);
    //         }
    //         else if (selection.index > index) {
    //             this.select(children[selection.index - 1], true);
    //         }
    //     }
    // }

}

ChooserTag.Mode = {
    SINGLE   : "single",
    MULTIPLE : "multiple"
}
