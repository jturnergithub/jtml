import Binder from "../bind/Binder.js";
import Tag from "./Tag.js";

export default class ChoiceTag extends Tag {

    constructor(name, attrs) {
        super(name, attrs);
        this.keys.selected = "jtml-selected";
        this.my.behavior   = ChoiceTag.Behavior.RETAIN;
        this.my.index      = -1;
        // ChoiceTags come in two flavors. Some, like radio buttons and selects,
        // are intrinsically choosery and don't need to do anything special when
        // clicked. Others, like lists and divs and table rows, are artificial,
        // and may need to notify their parent.
        this.click(self => self.choose());
        this.classes("jtml-selected", this.keys.selected);
    }

    /**
    Specifies what to do if someone clicks on this thing while it's already
    selected. ChoiceTag.Behavior.RETAIN leaves it selected; TOGGLE deselects it.
    (Clicking on a non-selected ChoiceTag automatically selects it.)
    **/
    behavior(behavior) {
        if (behavior === undefined) {
            return this.my.behavior;
        }
        else {
            this.my.behavior = behavior;
            return this;
        }
    }

    /**
    Extends base class method by setting this item's index
    **/
    appendTo(domNode) {
        this.index(domNode.children.length);
        super.appendTo(domNode);
    }

    /**
    Method specified in ValueTag.
    **/
    evaluate() {
        if (this.my.value !== undefined) {
            return this.my.value;
        }
        else if (this.keys.binding) {
            return this.get(this.keys.binding);
        }
    }

    /**
    The index DOES NOT CHANGE. Contents may change, but once a choice is created
    it stays pupt.
    **/
    index(index) {
        if (index === undefined) {
            return this.my.index;
        }
        else {
            this.my.index = index;
            this.classes(index % 2 ? "jtml-odd" : "jtml-even");
            return this;
        }
    }

    setBinder(binder) {
        // Every ChoiceTag has its own binder, which inherits bindings from
        // its outer scope.
        super.setBinder(new Binder(binder));
    }

    /**
    Without arguments, returns true if this list item is selected.

    With only a single boolean flag, selects or unselects the list item immediately.
    With a flag plus a condition, selects or unselects the list item when the
    condition is achieved.
    **/
    selected(flag, when) {
        if (flag === undefined) {
            return this.isSelected();
        }
        else {
            // This doesn't do anything directly, even when the callback
            // occurs. Instead, it sets the bound
            // value "jtml-selected". Monitors of that value are responsible
            // for doing the dirty work, such as changing the visual appearance
            // of the LI element.
            return this.resolve(flag, when, selected => this.setSelected(selected));
        }
    }

    choose() {
        let selected = this.behavior() === ChoiceTag.Behavior.RETAIN || !this.selected();
        if (selected) {
            // this.set("jtml-add-selection", this.toSelection());
        }
        // Let the parent ChooserTag know what's going on
        return this;
    }

    isSelected() {
        return this.get(this.keys.selected);
    }

    setSelected(selected) {
        this.set(this.keys.selected, selected);
    }

    move(amount) {
        this.parent.move(this.index(), amount);
        return this;
    }

    remove() {
        if (this.selected()) {
            this.selected(false);
        }
        this.parent.remove(this.index());
        return this;
    }

    toSelection() {
        return {
            index    : this.index(),
            value    : this.text(),
            tag      : this,
            toString : function() {
                return this.text;
            },
            equals   : function(that) {
                if (this.value.equals) {
                    return this.value.equals(that.value);
                }
                else {
                    return this.value === that.value;
                }
            }
        }
    }
}

ChoiceTag.Behavior = {
    RETAIN : "retain",
    TOGGLE : "toggle"
}
