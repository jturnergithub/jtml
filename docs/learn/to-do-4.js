import {button, checkbox, div, li, textField, ul} from "../../jtml.js";

export default () => { 

    function newToDoItem(toDo, index) {
        return li(
            checkbox(),
            toDo, 
            button("Remove").click(jtml => jtml.get("to-dos").splice(index, 1))
        )
    };

    const toDoList = 
        div(
            div(
                textField().attr("placeholder", "add a to-do").bind("new-to-do"),
                button("Add To-Do")
                    .click(jtml => jtml.push("to-dos", jtml.replace("new-to-do")))
                    .enabled("new-to-do")
            ),
            ul(newToDoItem).bind("to-dos", ["Find R2-D2", "Hire pilot", "Escape Tattooine"]),
            button("Clear To-Dos").click(jtml => jtml.set("to-dos.length", 0))
        );

        return toDoList;
}