import {div, h2, h3, img, p, scope, ul} from "../../jtml.js";
import {collapsibleSection, sideBySide} from "../common/components.js"
import {code, codeBlock, highlighted, keyword, note, term} from "../common/format.js";
import {assemble} from "../common/util.js";
import toDoList from "./to-do-9.js"

export default div(
    h2("Extra credit"),
    p(`
        Another neat thing would be to edit an item's text. Of course, we could just use a bound `, keyword("textField"),
        `in place of the item text, but where's the fun in that? Let's instead do the thing where clicking on an item
        makes it editable. You already have the required knowledge to implement this; take a stab at it.
    `),
    collapsibleSection(
        h3("One approach"),
        p(`
            We'll create two separate `, keyword("span"), `s, only one of which is visible at a time, and
            toggle between them with a click.
        `),
        ul(
            `When not editing, the visible span contains the item text and the "Remove" button. Clicking the name switches
            to editing.`,
            `When editing, the visible span contains a text field, an "OK" button, and a "Cancel" button. Clicking either
            button switches to not editing.`
        ),
        p(`Create a new named key for each list item:`),
        codeBlock(...assemble`
            const keys = {
                completed : "to-dos[" + index + "].completed",
                text      : "to-dos[" + index + "].text",
                ${highlighted('editing   : "to-dos[" + index + "].editing"')}
            };
        `),
        p(`Each span uses the same item, but in an opposite sense:`),
        codeBlock(...assemble`
            return li(
                checkbox().bind(keys.completed),
                span(
                    text().bind(keys.text),
                    button("Remove").click(jtml => jtml.get("to-dos").splice(index, 1))
                )
                    .classes("strikethrough", keys.completed)
                    .click(jtml => jtml.overwrite(keys.editing, keys.text))
                    .hidden(keys.editing),
                span(
                    textField().bind(keys.editing),
                    button("OK").click(jtml => jtml.set(keys.text, jtml.replace(keys.editing))),
                    button("Cancel").click(jtml => jtml.set(keys.editing))
                ).visible(keys.editing),
            ).hidden(["hide-completed", keys.completed], JTML.Operator.ALL);
        `),
        scope().independent(
            sideBySide(toDoList, 2, -2)
        )
    )
    
)