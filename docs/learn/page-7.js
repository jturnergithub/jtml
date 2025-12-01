import {binder, button, checkbox, div, h2, li, ol, p, pre, scope, span, text, textField, ul} from "../../jtml.js";
import {sideBySide} from "../common/components.js"
import {code, codeBlock, highlighted, keyword, note, term} from "../common/format.js";
import {assemble} from "../common/util.js";
import toDoList from "./to-do-7.js";

export default div(
    h2("Monitors"),
    p(`
        We're a long way from exhausting what JTML can do. Let's add some optional extras to our to-do list. One thing that's
        dead easy is to show how many items are in the list. We can just add a text element bound to "to-dos.length":
    `),
    codeBlock(`text().bind("to-dos.length"), " items"`),
    p(`
        What if we want to also show how many items are completed? That's a little trickier, because there's no simple
        binding that shows how many checkboxes are checked. There are several ways to do this; here's one of them.
    `),
    ol(
        li(...assemble`
            Create a text node with a binding. Put it in a variable so that we can access it later: 
            ${codeBlock('const counter = text().bind("completed-ct");')}
        `),
        li(...assemble`
            We have to update "completed-ct" whenever a checkbox is checked, or unchecked. That means we need a function that
            gets called when a checkbox's bound value changes. JTML provides the ${code("monitor(key, function)")} method for just such
            an occasion.`,
            codeBlock(pre(...assemble`
function newToDoItem(item, index) {
    ${highlighted(`counter.monitor(
        "to-dos[" + index + "].completed", 
        () => ????? /* Do something when the checkbox is clicked */
    )`)}
    . . .
            `)),
            note(
                `Behind the scenes, it's `, code(".monitor()"), ` all the way down. That `, code(".bind(key)"), ` method? It's
                actually doing `, code("this.monitor(key, value => this.update(value))"), `. Something very similar is true for methods like `,
                code("visible()"), ` and `, code("classes()"), " and whatnot."
            ),
        ),
        li(
            `The callback function has to set the value bound to "completed-ct", so we know right away that it's going to start `,
            codeBlock(pre(...assemble`
counter.monitor(
    "to-dos[" + index + "].completed", 
    ${highlighted(`() => counter.set("completed-ct", ?????) /* Set "completed-ct" to # of completed items  */)`)}
            `))
        ),
        li(
            `So how do we get "# of completed items"? Well, how about we retrieve the list of to-do objects, filter out the ones that aren't 
            completed, and grab the length of what's left? Like`,
            codeBlock(...assemble`counter.set("completed-ct", ${highlighted('counter.get("to-dos").filter(toDo => toDo.completed).length)')}`)
        )
    ),
    note(`
        Good housekeeping time. There are three separate places where we're assembling the same string: `,
        code('"to-dos[" + index + "].completed"'), `. That's irritating, verbose, error-prone, and inefficient.
        From now on, let's do it just once:`,
        pre(codeBlock(`
const keys = {
    completed : "to-dos[" + index + "].completed",
    text      : "to-dos[" + index + "].text"
};
        `))
    ),
    p(`Now we can just add the counter to the to-do generator: `, codeBlock(`"Completed ", counter, " of ", text().bind("to-dos.length"), " items"`)),
    scope().independent(
        sideBySide(toDoList, 2, -2)
    ) 
);