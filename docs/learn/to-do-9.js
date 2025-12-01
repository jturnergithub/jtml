import {JTML, button, checkbox, div, li, span, text, textField, ul} from "../../jtml.js";

export default () => {
    
    const counter = text().bind("completed-ct");

    const toDos = [
        { text : "Find R2-D2", completed : true }, 
        { text : "Hire pilot", completed : false }, 
        { text : "Escape Tattooine", completed : false }
    ];

    function newToDoItem(item, index) {
        // This is just to make the code more readable
        const keys = {
            completed : "to-dos[" + index + "].completed",
            text      : "to-dos[" + index + "].text",
            editing   : "to-dos[" + index + "].editing"
        };
        // Update the counter whenever the checkbox is clicked.
        counter.monitor(
            keys.completed, 
            () => counter.set("completed-ct", counter.get("to-dos").filter(toDo => toDo.completed).length)
        );
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
    }

    const toDoList =
        div(
            div(
                textField().attr("placeholder", "add a to-do").bind("new-to-do"),
                button("Add To-Do")
                    .click(jtml => jtml.push("to-dos", { text : jtml.replace("new-to-do"), completed : false }))
                    .enabled("new-to-do")
            ),
            ul(newToDoItem).bind("to-dos", toDos),
            div("Completed ", counter," of ", text().bind("to-dos.length"), " items"),
            div(checkbox().bind("hide-completed"), "Hide completed items"),
            button("Clear To-Dos").click(jtml => jtml.set("to-dos.length", 0)).visible("to-dos.length")
        );

    return toDoList;
}