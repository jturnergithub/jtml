import {button, div, em, h2, li, ol, p, scope, span, textField, ul} from "../../jtml.js";
import {sideBySide} from "../common/components.js"
import {code, codeBlock, highlighted, keyword, term} from "../common/format.js";
import {assemble} from "../common/util.js";
import toDoLst from "./to-do-2.js";

export default div(
    h2("Bindings"),
    p(...assemble`
        Obviously, that's not very useful; the list items are fixed, and the button doesn't do
        anything. To change that, we need to connect the ${keyword("ul")} tag to an array, using a ${term("binding")}. 
    `),
    codeBlock(...assemble`ul()${highlighted('.bind("to-dos", ["Find R2-D2", "Hire pilot", "Escape Tattooine"])')}`),
    p(...assemble`
        A binding consists of a key ("to-dos") and a value (the array); the value defaults to ${code("undefined")}. 
        When anything changes the value, every JTML object that's registered an interest in the key is notified,
        and updates itself appropriately.
        A ${keyword("ul")}, as in this case, updates itself by changing its items to correspond to the bound array.
    `),
    p(...assemble`
        So the "Add To-Do" button logic needs to (1) get the content of the text
        field, and (2) push it onto the end of the array. (1) is straightforward, because ${keyword("textField")}
        implements ${term("two-way bindings")}. Altering the bound value updates the text field, but--in addition--typing in the
        text field changes the bound value.
    `),
    codeBlock(...assemble`textField().attr("placeholder", "add a to-do")${highlighted('.bind("new-to-do")')}`),
    p(`
        For (2), the button has to look up the value of the "new-to-do" binding and use it to modify
        the "to-dos" binding:
    `),
    codeBlock(`button("Add To-Do")`, highlighted(`.click(jtml => jtml.push("to-dos", jtml.get("new-to-do")))`)),
    p("Unpacking that:"),
    ol(
        li(...assemble`The ${keyword("button")} gets a ${span("click()").classes("code")} function that takes a JTML object--the ${keyword("button")} itself, in fact--as its argument.`),
        `The function looks up the key "new-to-do", which is bound to the text field.`,
        "Then it pushes that value onto the array associated with the key " + '"to-dos".'
    ),
    p("And modifying the bound array magically updates the ", keyword("ul"), "contents!"),
    scope().independent(
        sideBySide(toDoLst, 2, -2)
    )
);