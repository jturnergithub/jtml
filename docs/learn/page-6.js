import {div, h2, li, p, scope, span, ul} from "../../jtml.js";
import {sideBySide} from "../common/components.js"
import {codeBlock, highlighted, keyword, term} from "../common/format.js";
import {assemble} from "../common/util.js";
import toDoList from "./to-do-6.js";

export default div(
    h2("Controlling presentation"),
    p(`
        We've already seen how to enable/disable a JTML object based on a binding. It's just as easy
        to show/hide an object, or change its classes. For instance, suppose we want to hide the "Clear
        To-Dos" button if the list is empty:
    `),
    codeBlock(span('button("Clear To-Dos").click(jtml => jtml.set("to-dos.length", 0))', highlighted('.visible("to-dos.length")'))),
    div(
        "The ", span("visible()").classes("code"), " method and its relatives support multiple signatures. For example:",
        ul(
            li(
                span("visible(key)").classes("code"), 
                " makes the JTML visible if the key's bound value is truthy."
            ),
            li(
                span("visible(key, value)").classes("code"), 
                " makes the JTML visible if the key's bound value equals ", 
                span("value").classes("code")
            ),
            li(
                span("visible(key, function)").classes("code"), 
                " passes the key's bound value as the argument to ", 
                span("function").classes("code"), ". The JTML is visible if the return value is truthy."
            )
        ),
        "You can also call ", span("hidden()").classes("code"), " in the same ways to reverse the logic. Similarly, ",
        span("disabled()").classes("code"), " is the inverse of ", span("enabled()").classes("code"), "."
    ).classes("note"),
    p(`
        Classes work the same way. To give each to-do item the "strikethrough" class when the corresponding checkbox is 
        checked, we first have to put the text into a span, because text nodes can't get CSS styles. Then we have to link
        the class to the checkbox's binding:
    `),
    span(
        highlighted('span('), 
        'text().bind("to-dos[" + index + "].text")',
        highlighted(').classes("strikethrough", "to-dos[" + index + "].completed")')
    ).classes("code"),
    p(
        "Remember, you can also call ", span("classes(names)").classes("code"), " without a binding key, to add the classes unconditionally. ",
        "You can supply the names as an array or as a space-separated single string, a la HTML."
    ),
    div(
        "WARNING: ", span("classes(names, key)").classes("code"), " is an if-and-only-if thing. ",
        "If the bound value doesn't evaluate to true, the named classes will be removed, even if you explicitly added them."
    ).classes("note"),
    scope().independent(
        sideBySide(toDoList, 2, -2)
    )
)