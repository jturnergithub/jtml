import ListItemTag from "./ListItemTag.js";
import Tag from "./Tag.js";

/**
An IMPORTANT SAFETY TIP follows. READ IT.

JTML tries to be stingy in creating or deleting DOM items. Whenever possible,
existing JTML items are reused; only the values that they're bound to change.
For example: suppose you have an unordered list <ul> bound to the array ["a", "c", "d"].
That list has three <li> tags inside it, each bound to a different value. Now you
insert the new value "b" at index 1. The three existing <li> tags are *** reused ***.
The one bound to "a" is unchanged; the one formerly bound to "c" is now bound to "b";
the one formerly bound to "d" is now bound to "c"; and the only new ListItemTagTag is
bound to "d".

Even replacing one array with another works this way. While the bound array instance
changes, the JTML and DOM elements simply update their bindings to show the new array's
contents.

Deleting one or more items does delete JTML and associated
DOM elements, as opposed to (say) hiding them. However, it deletes by *truncating*.
In other words, if you delete the i'th element of a bound array, the i'th JTML
child keeps right on existing; it just displays the value formerly at i + 1. Only
the last JTML child is actually removed.

The upshot of this is that a child JTML element, once created, always has the same
index.
**/

export default class ListTag extends Tag {

    constructor(ordered, attrs, factory = ListItemTag.FACTORY) {
        if (ordered) {
            super("ol", attrs);
        }
        else {
            super("ul", attrs);
        }
        this.children.factory = factory;
    }

    display(array) {
        // This creates (using the specified factory) or deletes children,
        // and calls display() on each child.
        this.children.display(array);
    }
}

ListTag.UNORDERED = false;
ListTag.ORDERED = true;
