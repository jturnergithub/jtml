import {binder, button, checkbox, div, em, h2, li, p, pre, scope, span, text, textField, ul} from "../../jtml.js";
import {sideBySide} from "../common/components.js"
import {code, codeBlock, highlighted, keyword, note, term} from "../common/format.js";
import {assemble} from "../common/util.js";
import toDoList from "./to-do-11.js"

export default div(
    h2("Choosers"),
    p(`
        There's obviously more things that can be associated with a to-do. For example, how about a "Notes" section?
        Let's let the user select a to-do by clicking on it, then give them a spot for free-form text entry.
    `),
    p(`
        Of course, previously we used a click on an item to enable renaming it. We'll make "Rename" into a button.
        By now you should have a pretty good idea of what to do.
    `),
    p(`
        That taken care of, we'll need the ability to select one to-do from the list. JTML provides the `, term("chooser"), ` 
        element for just this purpose. A chooser is a wrapper around another element--a list, in this case. Clicking
        on any list item causes the chooser to select it. 
    `),
    note(`
        To this point, we've concentrated on JTML objects as peers to HTML tags. A chooser is an example of a more
        complex thing: a JTML construct that composes several other JTML constructs into a useful whole.
    `),
    p(`
        To use a chooser, just bind it as you would any other JTML element.
    `),
    note(`
        Be clear about the distinction between binding the chooser and binding the ul. Binding the ul works the same
        way it always has: the ul's "value" is an array, with each array giving rise to one list
        item. The chooser is bound to the selection from that array.
    `),
    scope().independent(
        sideBySide(toDoList, 2, -2)
    )
);