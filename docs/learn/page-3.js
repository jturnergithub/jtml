import {div, h2, p, pre, scope, span} from "../../jtml.js";
import {sideBySide} from "../common/components.js"
import {code, codeBlock, highlighted, keyword, term} from "../common/format.js";
import {assemble} from "../common/util.js";
import toDoList from "./to-do-3.js"

export default div(
    h2("Usability improvements"),
    p(...assemble`
        That still leaves the text in the text field unchanged after the button click. Instead of using
        ${code("jtml.get()")} in the button's callback, we can use ${code("jtml.replace()")} to both get the
        value and replace it with an empty string:
    `),
    codeBlock(...assemble`jtml => jtml.push("to-dos", ${highlighted('jtml.replace("new-to-do", ""))')}`),
    p(`
        Also, the button should be disabled unless the user has actually typed something. To do that,
        we throw in a call to `, code("button.enabled()"), `, which also makes use of the "new-to-do" binding:
    `),
    codeBlock(...assemble`
        button("Add To-Do")
            .click(jtml => jtml.push("to-dos", jtml.replace("new-to-do")))
            ${highlighted('.enabled("new-to-do")')}
    `),
    p(`
        That tells JTML that the button should be enabled if the value of the "new-to-do" binding is
        truthy. Since the empty string is falsy, clicking the button also disables it until something
        new is typed.
    `),
    p(`
        While we're at it, let's add another button to clear the to-do list entirely:
    `),
    codeBlock(`button("Clear To-Dos").click(jtml => jtml.set("to-dos.length", 0))`),
    div(
        `See what I did there? We didn't have to explicitly create a binding for "to-dos.length", because we've already
        bound "to-dos" to an array. Knowing that the key "to-dos" has the value of the `, code("toDos"), ` array, JTML 
        knows that "to-dos.length" is the same as `, code("toDos.length"), `, "to-dos[1]" is the same as `, code("toDos[1]"),
        `, and so forth. JTML, in other words, lets you refer to object properties either via the binding key or via the 
        bound object. In this case, for example, we could equally well write `,
        code('jtml.get("to-dos").length = 0'), "."
    ).classes("note"),
    scope().independent(
        sideBySide(toDoList, 1, -2)
    )
);