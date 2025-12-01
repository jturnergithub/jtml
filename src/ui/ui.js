import {scope} from "../bind/bind.js";
import {div, img, table, toArgs} from "../markup/markup.js";
import CheckListItem from "./CheckListItem.js";
import Collapsible from "./Collapsible.js";
import ChooserTag from "../markup/ChooserTag.js";
import Chooser from "./Chooser.js";
import FormEntry from "./FormEntry.js";
import Palette from "./Palette.js";
import Radio from "./Radio.js";
import Tabs from "./Tabs.js";

export function collapsible(title, content, image = "../../images/chevron-down.gif") {
    if (typeof title === "string") {
        title = div(title);
    }
    if (typeof image === "string") {
        image = img(image);
    }
    return new Collapsible(
        image,
        title,
        content
    )
}

export function checklist(factory, ...items) {
    if (typeof factory !== "function") {
        items.unshift(factory);
        factory = label => label
    }
    return new ChooserTag("div", ChooserTag.Mode.MULTIPLE)
        .factory(CheckListItem.metafactory(factory))
        .classes("jtml-ui jtml-check-list")
        ._(...items);
}

export function checklistItem(...contents) {
    return new CheckListItem(...contents);
}

export function chooser(tag, mode) {
    return new Chooser(tag, mode);
}

export function formEntry(label, separator, jtml) {
    return new FormEntry(label, separator, jtml);
}

export function palette(tag, mode) {
    if (typeof tag === "string") {
        mode = tag;
        tag = table();
    }
    return new Palette(tag, mode);
}

export function radio(factory, ...contents) {
    [factory, contents] = toArgs(factory, contents);
    return new Radio(factory)._(...contents);
}

export function tabs(...contents) {
    const tabs = new Tabs();
    for (const item of contents) {
        tabs.tab(item[0], item[1]);
    }
    tabs.set(tabs.chooser.keys.binding, contents[0][0]);
    return tabs;
}

export function textDiv(string) {
    return textTag("div", string)
}

// export function textSpan(string) {
//     return textTag("span", string);
// }

// export function textTag(name, string = "") {
//     return Tag.builder()
//         .name(name)
//         .contents(text(string))
//         .textTag(true)
//         .build();
// }
