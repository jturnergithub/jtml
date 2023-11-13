import {div, option, span, text, viewer} from "../../src/jtml.js";
import SelectTag from "../../src/markup/SelectTag.js";
import data from "./data.js";

export default function create() {

    let viewer = {
        lastNameTxt  : text(),
        firstNameTxt : text(),
        rankTxt      : text(),
        positionTxt  : text(),
        display      : function(selection) {
            if (selection) {
                this.lastNameTxt.display(selection.model.lastName);
                this.firstNameTxt.display(selection.model.firstName);
                this.rankTxt.display(selection.model.rank);
                this.positionTxt.display(selection.model.position);
            }
        }
    };

    function toOption(crewMember) {
        let o = option(crewMember.lastName + ", " + (crewMember.firstName || "N/A"))
        o.model = crewMember;
        return o;
    };

    function formField(label, tag) {
        if (!label.endsWith(":")) {
            label += ":";
        }
        return div(
            div(label).classes("label"),
            tag
        );
    };

    return [
        new SelectTag({}, toOption)._(...data.crew).id("crew"),
        div(
            formField("Last Name", viewer.lastNameTxt),
            formField("First Name", viewer.firstNameTxt),
            formField("Rank", viewer.rankTxt),
            formField("Position", viewer.positionTxt)
        ).viewer(viewer).bind("crew-selection")
    ];
}
