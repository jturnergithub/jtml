import {button, div, h2,ul} from "../../src/jtml.js";

/**
This example demonstrates the ability to change the display by changing the array that
the list is bound to.

By creating a function instead of a variable, we can create as many instances
as we want. We can also customize any aspects of the list creation by passing
in arguments to the create() function.
**/
export default function create(header) {
    const itemLists = {
        true : ["Yes", "1", "true", "yep", "aye"],
        false : ["No", "0", "false", "nope"]
    };

    let listKey = false;

    return div(
        h2(header),
        // Make a <ul> with the "false" list initially visible.
        ul().mutable("switchableItems", itemLists.false),
        // Create a button with an on-click handler to change to the other list.
        button("Switch").click(tag => {
            // Toggle the key
            listKey = !listKey;
            // Rebind to the other list
            tag.set("switchableItems", itemLists[listKey + ""]);
        })
    );
};
