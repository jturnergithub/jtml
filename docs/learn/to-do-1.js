import {button, div, textField, ul} from "../../jtml.js";

export default () => {

    const toDoList = div(
        div(
            textField().attr("placeholder", "add a to-do"),
            button("Add To-Do")
        ),
        ul("Find R2-D2", "Hire pilot", "Escape Tattooine")
    );

    return toDoList;
}
