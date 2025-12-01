import {div, span, ul} from "../markup/markup.js";
import ContainerTag from "../markup/ContainerTag.js";
import Tag from "../markup/Tag.js";
import Chooser from "./Chooser.js";

export default class Tabs extends ContainerTag {

    constructor() {
        super("div");
        this._(
            new Chooser(
                ul()
                    .always(tab => tab.classes("jtml-tab"))
                    .classes("jtml-tab-strip jtml-layout-horizontal")
            ).bind("jtml-tabs-" + this.serialNbr).required(true),
            div().classes("jtml-tab-pane")
        )
            .classes("jtml-tabs");
    }

    get chooser() {
        return this.children.members[0];
    }

    get pane() {
        return this.children.members[1];
    }

    get tabs() {
        return this.chooser.children.members[0];
    }

    tab(label, jtml) {
        if (!(jtml instanceof Tag)) {
            jtml = span(jtml);
        }
        this.tabs._(label);
        this.pane._(jtml.visible(this.chooser.keys.binding, label));
        return this;
    }
}
