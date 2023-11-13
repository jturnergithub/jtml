import {button, div, select, text} from "../../src/jtml.js";

/**
This example demonstrates the ability to change the display by changing the array that
the select is bound to.

Here we have two parallel arrays: one for the groups, and one for the members.
Wouldn't it be nice if we could instead have a single array whose members were
objects? Like
    { act : "Fry & Laurie", members : ["Stephen Fry", "Hugh Laurie"]}
Well, we can. Stay tuned.
**/
export default function create() {

    const acts = ["The Marx Brothers", "Abbott & Costello", "Monty Python"]

    const members = [
        ["Groucho", "Chico", "Harpo", "Zeppo"],
        ["Bud Abbott", "Lou Costello"],
        ["Graham Chapman", "John Cleese", "Terry Gilliam", "Eric Idle", "Terry Jones", "Michael Palin"]
    ];

    let listIndex = 0;

    function show(tag, index) {
        index = index % acts.length;
        if (index < 0) {
            index = acts.length - 1;
        }
        tag.set("act",     acts[index]);
        tag.set("members", members[index]);
        return index;
    }

    return [
        div(text().bind("act", acts[0])).style("backgroundColor", "palegoldenrod").style("fontSize", "larger"),
        // Make a <select> with the 0th list initially visible.
        select().bind("members", members[0]).size(5),
        div(
            // Create a button with an on-click handler to change to the next list.
            button("Next List").click(tag => {
                listIndex = show(tag, listIndex + 1);
            }),
            button("Prev List").click(tag => {
                listIndex = show(tag, listIndex - 1);
            })
        ).classes("inline-block")
    ];
};
