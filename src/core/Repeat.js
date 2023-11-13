/**
A pseudo-tag that repeats another tag. A Repeat is not a ValueTag, although
it's often inside a ValueTag. The ValueTag's value is one of the items within
the repeat, and that's what it's bound to. The Repeat itself can be bound to an
array; that lets the contents of the container change in response to changes
in the backing array. The Repeat's contents can be bound to the array elements,
so that they will also change in response to display changes.
**/
export default class Repeat {

    constructor(tag, n) {
        this.tag = tag;
        this.n = n || 0;
    }

    appendTo(parent) {
        for (let i = 0; i < n; i++) {
            let clone = this.tag.clone();
            // ?? anything to do here?
            clone.appendTo(parent);
        }
        return this;
    }

    /**
    Change the display when EITHER the bound array changes to a different array,
    OR the bound array gets modified in place.
    **/
    bind(key, initial) {
        let self = this;
        // Let's always have an initial value. If the caller doesn't provide one,
        // make it an empty array.
        initial = new Proxy(initial || [], {
            set: function(array, index, value) {
                array[index] = value;
                // Redisplay the indexed copy of the tag
                self.display(value, index);
                // Must return true to accept the changes
                return true;
            }
        });
        super.bind(key, initial);
    }

    display(array) {
        this.domNode.replaceChildren();
        this.children = [];
        if (array) {
            for (let item of array) {
                this.add(item);

            }
            for (let tag of this.children) {
                tag.appendTo(this);
            }

        }
    }
}
