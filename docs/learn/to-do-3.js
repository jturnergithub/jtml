import {button, div, scope, textField, ul} from "../../jtml.js";

export default () => {
    const toDoList = div(
        div(
            textField().attr("placeholder", "add a to-do").bind("new-to-do"),
            button("Add To-Do")
                .click(jtml => jtml.push("to-dos", jtml.replace("new-to-do")))
                .enabled("new-to-do")
        ),
        ul().bind("to-dos", ["Find R2-D2", "Hire pilot", "Escape Tattooine"]),
        button("Clear To-Dos").click(jtml => jtml.set("to-dos.length", 0))
    );
    return toDoList;
}