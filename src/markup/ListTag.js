import ListItem from "./ListItem.js";
import ContainerTag from "./ContainerTag.js";

/**
An IMPORTANT SAFETY TIP follows. READ IT.

JTML tries to be stingy in creating or deleting DOM items. Whenever possible,
existing JTML items are reused; only the values that they're bound to change.
For example: suppose you have an unordered list <ul> bound to the array ["a", "c", "d"].
That list has three <li> tags inside it, each bound to a different value. Now you
insert the new value "b" at index 1. The three existing <li> tags are *** reused ***.
The one bound to "a" is unchanged; the one formerly bound to "c" is now bound to "b";
the one formerly bound to "d" is now bound to "c"; and the only new Tag is
bound to "d".

Even replacing one array with another works this way. While the bound array instance
changes, the JTML and DOM elements simply update their bindings to show the new array's
contents.

Deleting one or more items does delete JTML and associated
DOM elements, as opposed to (say) hiding them. However, it deletes by *truncating*.
In other words, if you delete the third element of a bound six-element array, the third JTML
child keeps right on existing; it just displays the value formerly at array[4]. Only
the last JTML child is actually removed.

The upshot of this is that a child JTML element, once created, always has the same
index.
**/

export default class ListTag extends ContainerTag {

    constructor(ordered, factory) {
        if (ordered) {
            super("ol");
        }
        else {
            super("ul");
        }
        this.children.factory = ListItem.factory(factory);
    }

    bind(key, initial) {
        super.bind(key, initial);
        this.always((li, index) => li.bind(`${key}[${index}]`));
        return this;
    }

    display(array) {
        this.children.display(array);
    }
}

ListTag.UNORDERED = false;
ListTag.ORDERED = true;
