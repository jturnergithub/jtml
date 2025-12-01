import {button, checkbox, div, h2, li, p, pre, scope, text, textField, ul} from "../../jtml.js";
import {sideBySide} from "../common/components.js"
import {code, codeBlock, highlighted, keyword, term} from "../common/format.js";
import {assemble, toCodeString} from "../common/util.js";
import toDoList from "./to-do-5.js";

export default div(
    h2("Binding to objects"),
    p(`
        Uh-oh. The pieces of our to-do list don't play nicely together. Check "Hire pilot" (item #2), then remove
        "Find R2-D2" (item #1). Now "Escape Tattooine" (the new #2) is checked.
    `),
    p(...assemble`
        Why, you ask? Because bindings. The ${keyword("li")} text is bound to whatever's at the corresponding position in
        the bound array. Delete an array element and everything after it slides back a notch. The ${keyword("checkbox")} isn't bound 
        at all; it just sits there being a DOM element, in whatever state you left it in.
    `),
    p(...assemble`
        The fix is to bind the checkbox as well. We could do that by creating a parallel bound array, so that (e.g.)
        ${code("todos[1]")} would correspond to ${code("completed[1]")}, and so forth. That's not ideal, though. What if we find ourselves
        wanting to associate other properties--priority, date, category, whatever--with ${code("todos[1]")}? Do we need another
        array binding for each? And how sure can we be that all these arrays will ultimately stay in sync?
    `),
    p(...assemble`
        A better approach is to bind the ${keyword("ul")}, not to an array of strings, but to an array of objects. Let's take the
        initial item list, give it its own array constant, and make it an array of objects:
    `),
    codeBlock(...assemble`
        const toDos = [
            { text : "Find R2-D2", completed : true}, 
            { text : "Hire pilot", completed : false}, 
            { text : "Escape Tattooine", completed : false}
        ];

        ul(newToDoItem).bind("to-dos", ${highlighted("toDos")})
    `),
    p(`Just to see how it works, we've initialized the first item as completed.`),
    p(`
        Now the ul is displaying objects, not strings, so the factory function has to change to take an object. That means
        that the checkbox and text that it creates should be bound to properties of that object:
    `),
    codeBlock(...assemble`
        function newToDoItem(${highlighted("item")}, index) {
            return li(
                checkbox()${highlighted('.bind("to-dos[" + index + "].completed"')}),
                text()${highlighted('.bind("to-dos[" + index + "].text"')}), 
                button("Remove").click(jtml => jtml.get("to-dos").splice(index, 1))
            )
        };
    `),
    p(`Finally, the "Add To-Do" button can't just create a string any longer; it has to create an object:`),
    codeBlock(...assemble`
        button("Add To-Do")
            .click(jtml => jtml.push("to-dos", ${highlighted('{ text : jtml.replace("new-to-do"), completed : false }')}))
            .enabled("new-to-do")
    `),
    scope().independent(
        sideBySide(toDoList, 2, -2)
    )
)