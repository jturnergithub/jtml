import FormEntry from "./FormEntry.js";
import Chooser from "./Chooser.js";
import Radio from "./Radio.js";
import Tag from "../markup/Tag.js";
import {text} from "../core/core.js";
import {div, span} from "../markup/markup.js";

export function formEntry(label, widget) {
    return Tag.builder()
        .type(FormEntry, label, widget)
        .build();
}

export function chooser(tag, mode, equality) {
    return new Chooser(tag, mode, equality);
}

export function radio(name, attrs, ...contents) {
    return Tag.builder()
        .type(Radio, name)
        .attrs(attrs)
        .contents(...contents)
        .build();
}

export function textDiv(string, attrs) {
    return textTag("div", attrs, string)
}

export function textSpan(string, attrs) {
    return textTag("span", attrs, string);
}

export function textTag(name, attrs, string = "") {
    return Tag.builder()
        .name(name)
        .attrs(attrs)
        .contents(text(string))
        .textTag(true)
        .build();
}
