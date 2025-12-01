import {binder, button, checkbox, div, em, h2, li, p, pre, scope, span, text, textField, ul} from "../../jtml.js";
import {sideBySide} from "../common/components.js"
import {code, codeBlock, highlighted, keyword, note, term} from "../common/format.js";
import {assemble} from "../common/util.js";
import toDoList from "./to-do-10.js"

export default div(
    h2("Scopes"),
    p(`
        If you're a purist, you might notice something a little bit questionable about the implementation of
        the "editing" key. When we create a binding to, for example, "to-dos[1].editing", we're actually `,
        em("modifying"), ` the object `, code("toDos[1]"), `, by giving it a new boolean property named "editing"!
    `),
    p(`
        Okay, maybe this isn't the worst thing in the world, but it's not ideal. If someeone else creates or 
        maintains or modifies the definition of a toDo object, we can end up with a conflict. Class instances,
        in particular, probably shouldn't be arbitrarily modified by the client.
    `),
    p(`
        One simple solution to this would be to create a parallel array, but parallel arrays have their own
        problems. A more sophisticated approach would be to put each pair of spans into their own `, keyword("scope"),`.
        A scope is a namespace for bindings: two scopes can use the same binding key for different values and
        not interfere with each other. `, keyword("Child scopes"), ` inherit bindings from a progenitor;`,
        keyword("independent scopes"), ` don't. Since we're using some existing bindings, we need a child scope:
    `),
    codeBlock(...assemble`
        return li(
            checkbox().bind(keys.completed),
            ${highlighted("...scope().child(")}
                span(
                    text().bind(keys.text),
                    button("Remove").click(jtml => jtml.get("to-dos").splice(index, 1))
                )
                    .classes("strikethrough", keys.completed)
                    .hidden(${highlighted('"editing"')})
                    .click(jtml => jtml.set(${highlighted('"editing"')}, jtml.get(keys.text))
                ), 
                span(
                    textField().bind("editing"),
                    button("OK").click(jtml => jtml.set(keys.text, jtml.replace(${highlighted('"editing"')}))),
                    button("Cancel").click(jtml => jtml.set(${highlighted('"editing"')}))
                ).visible("editing"),
            ${highlighted(")")},
        ).hidden(["hide-completed", keys.completed], JTML.Operator.ALL);
    `),
    p(`
        In this version, within every list item there's a child scope. The child scope has the same bindings as
        the list item, and one more, named "editing". Within that scope are the two spans, which make use of
        the "editing" binding.
    `),
    scope().independent(
        sideBySide(toDoList, 2, -2)
    ),
    note(`
        Scopes can be tricky. In this particular case, I'd probably avoid using one
        if I didn't have a stronger reason. That said, sometimes scopes are essential. They're used all through
        this tutorial, for example! That's how I can get away with using the same binding keys over and over:
        each example sits in its own scope.
    `)
);