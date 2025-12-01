import {button, div, select, text} from "../../jtml.js";

/**
This example demonstrates the ability to change the display by changing the array that
the select is bound to.

Here we have two parallel arrays: one for the groups, and one for the members.
Wouldn't it be nice if we could instead have a single array whose members were
objects? Like
    { act : "Fry & Laurie", members : ["Stephen Fry", "Hugh Laurie"]}
Well, we can. Stay tuned.
**/

const acts = ["The Marx Brothers", "Abbott & Costello", "Monty Python"];

const members = [
    ["Groucho", "Chico", "Harpo", "Zeppo"],
    ["Bud Abbott", "Lou Costello"],
    ["Graham Chapman", "John Cleese", "Terry Gilliam", "Eric Idle", "Terry Jones", "Michael Palin"]
];

let listIndex = 0;

function show(jtml, index) {
    index = index % acts.length;
    if (index < 0) {
        index = acts.length - 1;
    }
    jtml.set("act",     acts[index]);
    jtml.set("members", members[index]);
    return index;
}

export default [
    div(
        // Switch to the previous act
        button("<").click(jtml => listIndex = show(jtml, listIndex - 1)),
        // Name of the current act
        text().bind("act", acts[listIndex]),
        // Switch to the next act
        button(">").click(jtml => listIndex = show(jtml, listIndex + 1))
    ).id("act"),
    // Make a <select> with the 0th list initially visible.
    select().bindValues("members", members[listIndex]).size(5),
    
];
