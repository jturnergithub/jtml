import ChooserTag from "../markup/ChooserTag.js";
/**
A Chooser wraps a ChooserTag around something that does not
intrinsically have the chooser nature. For example:
* A <ul> used as a menu
* A <table> where the user can click on a <tr> to select it
* A <div> whose children are selectable <div>s with formatted info
* A palette of <img> or <span> tags

And so forth.

The upshot is that the Chooser has to do stuff that a <select>, for example,
does for itself. Specifically, it has to:
* Manage its own mode (single or multiple selection)
* Maintain a list of selectable elements
* Take a value and select it
** If in single-select mode, and there was something else selected, deselect that
** If in multiple-select mode, make all the correct transitions

**/
export default class Chooser extends ChooserTag {

    constructor(tag, mode = ChooserTag.Mode.SINGLE, equality = (v0, v1) => v0 === v1) {
        super("div", {}, child => child);
        this
            ._(tag)
            .classes("jtml-chooser")
            .mode(mode)
            .equality(equality);
        this.my.selectables = [];
        // When the tag adds a new child--e.g., a new item is added to a <ul>--we need to
        // know about it, so that we can add a peer to the child that handles its selection
        // state.
        let self = this;
        let prev = undefined;
        tag.children.distribute(child => {
            let behavior = self.mode() === ChooserTag.Mode.SINGLE ? Selectable.ClickBehavior.SELECT : Selectable.ClickBehavior.TOGGLE;
            let selectable = new Selectable(child, behavior);
            child.multiple(true);
            child.classes("jtml-chooser-selectable");
            child.monitor(Selectable.SELECTED_KEY, selected => {
                if (selected && self.mode() === ChooserTag.Mode.SINGLE) {
                    if (prev) {
                        prev.selected(false);
                    }
                    prev = selectable;
                }
                if (self.keys.binding) {
                    self.set(self.keys.binding, self.evaluate());
                }
            });
            this.selectables().push(selectable);
        });
    }

    mode(mode) {
        if (mode === undefined) {
            return this.my.mode;
        }
        else {
            this.my.mode = mode;
            return this;
        }
    }

    selectables() {
        return this.my.selectables;
    }

    /**
    Makes some choices selected. Each managed object that is "equal to" one
    of the values becomes part of the selection.
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
};

/**
Peer to a tag that worries about its selection state.
**/
class Selectable {

    constructor(tag, behavior = Selectable.ClickBehavior.SELECT) {
        this.tag      = tag;
        this.behavior = behavior
        // When the bound value "jtml-selected" is set to true, then the tag
        // has the class ".jtml-selected".
        this.tag.classes(Selectable.SELECTED_CLASSES, Selectable.SELECTED_KEY);
        let self = this;
        this.tag.click(() => {
            if (self.behavior === Selectable.ClickBehavior.TOGGLE) {
                self.selected(!self.selected());
            }
            else if (self.behavior === Selectable.ClickBehavior.SELECT && !self.selected()) {
                self.selected(true);
            }
        });
    }

    evaluate() {
        return this.tag.evaluate();
    }

    selected(selected) {
        if (selected === undefined) {
            return this.tag.get(Selectable.SELECTED_KEY);
        }
        else {
            this.tag.set(Selectable.SELECTED_KEY, selected);
        }
    }

};

Selectable.SELECTED_KEY = "jtml-selected";
Selectable.SELECTED_CLASSES = "jtml-selected";
Selectable.ClickBehavior = {
    IGNORE : "ignore",
    TOGGLE : "toggle",
    SELECT : "select"
}
