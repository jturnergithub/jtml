import {button, checkbox, div, factory, formEntry, h3, option, select, span, textField} from "../../src/jtml.js";
import data from "./data.js";

class Employee {

    constructor(data = Employee.default) {
        Object.assign(this, data);
    }

    get name() {
        return this.firstName + " " + this.lastName;
    }

}

Employee.default = {
    sex : "X",
    current : true
}

export default function create() {

    let list = div(
        h3("Employees"),
        select().attr("size", "12").factory(employee => option(employee.name, employee.id)),
        div(
            button("Add"),
            button("Edit"),
            button("Remove")
        )
    ).classes("inline-block").id("employees");

    let editor = div(
        h3("Details"),
        div(
            formEntry("First Name",  textField()),
            formEntry("Middle Name", textField()),
            formEntry("Last Name",   textField()),
            formEntry("Sex",         select(
                option("Female", "F"),
                option("Male",   "M"),
                option("Other",  "X")
            )),
            formEntry("Status", span(checkbox().bind("current"), "Currently employed")),
            formEntry("Separation Year", select("2017", "2018", "2019", "2020", "2021", "2022").disabled("current"))
        ).id("employee-details"),
        div(
            button("Save").classes("default"),
            button("Revert"),
            button("Cancel")
        )
    ).classes("inline-block").bind("employees-selection");

    return [list, editor];
}
