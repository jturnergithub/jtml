import {button, div, scope, textField, ul} from "../../jtml.js";

export default () => {
    
    const toDoList = div(
        div(
            textField().attr("placeholder", "add a to-do").bind("new-to-do"),
            button("Add To-Do").click(jtml => jtml.push("to-dos", jtml.get("new-to-do")))
        ),
        ul().bind("to-dos", ["Find R2-D2", "Hire pilot", "Escape Tattooine"])
    );

    return toDoList;
}

