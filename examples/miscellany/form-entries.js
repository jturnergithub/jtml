import {checkbox, div, formEntry, radio, span, textField} from "../../jtml.js";

export default div(
    formEntry("Name", textField()),
    formEntry("Age", span(checkbox(), "Over 18")),
    formEntry("Sex", radio("Male", "Female", "Other").layout("horizontal"))
)