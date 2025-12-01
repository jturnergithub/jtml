import {button, checkbox, div, li, span, text, textField, ul} from "../../jtml.js";

export default () => {

    const toDos = [
        { text : "Find R2-D2", completed : true }, 
        { text : "Hire pilot", completed : false }, 
        { text : "Escape Tattooine", completed : false }
    ];
    
    function newToDoItem(toDo, index) {
        return li(
            checkbox().bind("to-dos[" + index + "].completed"),
            span(text().bind("to-dos[" + index + "].text")).classes("strikethrough", "to-dos[" + index + "].completed"), 
            button("Remove").click(jtml => jtml.get("to-dos").splice(index, 1))
        )
    };
    
    const toDoList = 
        div(
            div(
                textField().attr("placeholder", "add a to-do").bind("new-to-do"),
                button("Add To-Do")
                    .click(jtml => jtml.push("to-dos", { text : jtml.replace("new-to-do"), completed : false }))
                    .enabled("new-to-do")
            ),
            ul(newToDoItem).bind("to-dos", toDos),
            button("Clear To-Dos").click(jtml => jtml.set("to-dos.length", 0)).visible("to-dos.length")
        );
    
    return toDoList;
}