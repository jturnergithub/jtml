import {div, h2, p, pre, scope, span} from "../../jtml.js";
import {sideBySide} from "../common/components.js"
import {code, codeBlock, highlighted, keyword, note, term} from "../common/format.js";
import {assemble, toCodeString} from "../common/util.js";
import toDoList from "./to-do-4.js";

export default div(
    h2("Factories"),
    p(`
        To make the list really useful, it needs to have the ability to remove items as well as to
        add them. It'd be nice if we could check off items as they're completed, too. To do that,
        the list items can't just be text; we need a checkbox, the item text, and a "Remove" button.
    `),
    p(...assemble`
        We can do this by giving the ${keyword("ul")} object a ${term("factory")} function. (Actually,
        it already has one.) The factory's job is to take in something that may not already be a list
        item and turn it into an ${keyword("li")} instance. The default version works on strings, and produces list 
        items that consist of a single text node. What we want is a function that takes in a string and produces
        a list item consisting of a checkbox, text, and a button:
    `),
    codeBlock(...assemble`
        function newToDoItem(text, index) {
            return li(
                checkbox(),
                text, 
                button("Remove")
            )
        }
    `),
    p(`Provide the factory when creating the`, keyword("ul"), ":"),
    codeBlock("ul(", highlighted("newToDoItem"), `).bind("to-dos", ["Find R2-D2", "Hire pilot", "Escape Tattooine"]`),
    p(...assemble`
        We also need to make the "Remove" button do something. By now you should have a good idea of how to do that:
        give the button a ${code('click()')} function and have it modify the bound list. The only tricky
        part is that we have multiple buttons, so button #2 has to remove item #2 and so forth. Happily, the factory
        function has an ${code("index")} argument for just this purpose:
    `),
    codeBlock(...assemble`button("Remove")${highlighted('.click(jtml => jtml.get("to-dos").splice(index, 1))')}`),
    scope().independent(
        sideBySide(toDoList, 2, -2)
    ),
    note("Notice anything not working quite right?").classes("centered-text")
);