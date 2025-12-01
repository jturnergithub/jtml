import {div, h2, p, pre, scope, ul} from "../../jtml.js";
import {sideBySide} from "../common/components.js"
import {code, codeBlock, highlighted, keyword, note, term} from "../common/format.js";
import {assemble} from "../common/util.js";
import toDoList from "./to-do-8.js"

export default div(
    h2("Multiple binding keys"),
    p(`But wait! There's still more! For example, how about a checkbox to hide completed items?`),
    codeBlock(`checkbox().bind("hide-completed")`),
    p(`
        At first sight, that seems a little iffy, because each item has to be concerned about two
        separate bindings:
    `),
    ul(
        `The "hide-completed" binding`,
        `Its own individual checkbox binding, such as "to-dos[3].completed"`
    ),
    p(`
        Have no fear! JTML allows you to use an array of keys, rather than a single key, as the first argument
        to  `, code("hidden()"), `. You just need to supply an appropriate function as the second argument, to
        interpret the bound values and pass back a boolean. In this case, we want an AND: hide the list item if
        it's completed AND the hide-completed checkbox is checked. Write your own, or use `, code("JTML.Operator.ALL"), `:
    `),
    pre(codeBlock(...assemble`
return li(
    . . .
).${highlighted('hidden(["hide-completed", keys.completed], operator.all)')}
    `)),

    scope().independent(
        sideBySide(toDoList, 2, -2)
    )

);