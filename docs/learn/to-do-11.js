import {JTML, button, checkbox, chooser, div, li, scope, span, strong, text, textArea, textField, ul} from "../../jtml.js";

export default () => {

    const counter = text().bind("completed-ct");

    function newToDoItem(item, index) {
        // This is just to make the code more readable
        const keys = {
            completed : "to-dos[" + index + "].completed",
            text      : "to-dos[" + index + "].text"
        };
        // Update the counter whenever the checkbox is clicked.
        counter.monitor(
            keys.completed, 
            () => counter.set("completed-ct", counter.get("to-dos").filter(toDo => toDo.completed).length)
        );
        return li(
            checkbox().bind(keys.completed),
            ...scope().child(
                span(
                    text().bind(keys.text),
                    button("Edit").click(jtml => jtml.set("editing", jtml.get(keys.text))),
                    button("Remove").click(jtml => jtml.get("to-dos").splice(index, 1))
                )
                    .classes("strikethrough", keys.completed)
                    .hidden("editing"), 
                span(
                    textField().bind("editing"),
                    button("OK").click(jtml => jtml.set(keys.text, jtml.replace("editing"))),
                    button("Cancel").click(jtml => jtml.set("editing"))
                ).visible("editing"),
            ),
        ).hidden(["hide-completed", keys.completed], JTML.Operator.ALL);
    };

    const toDos = [
        { text : "Find R2-D2", completed : true }, 
        { text : "Hire pilot", completed : false }, 
        { text : "Escape Tattooine", completed : false }
    ];

    const toDoList =
        div(
            div(
                textField().attr("placeholder", "add a to-do").bind("new-to-do"),
                button("Add To-Do")
                    .click(jtml => jtml.push("to-dos", { text : jtml.replace("new-to-do"), completed : false }))
                    .enabled("new-to-do")
            ),
            chooser(
                ul(newToDoItem).bind("to-dos", toDos),
            ).bind("selected-to-do"),
            div("Notes for ", strong(text().bind("selected-to-do.text"))),
            textArea(5, 40).bind("selected-to-do.notes").visible("selected-to-do"),
            div("Completed ", counter," of ", text().bind("to-dos.length"), " items"),
            div(checkbox().bind("hide-completed"), "Hide completed items"),
            button("Clear To-Dos").click(jtml => jtml.set("to-dos.length", 0)).visible("to-dos.length")
        );

    return toDoList;
}