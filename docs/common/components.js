import {JTML, collapsible, div, h2, h3, img, pre} from "../../jtml.js";
import {toCodeString} from "./util.js";

export function collapsibleSection(title, ...contents) {
    if (typeof title === "string") {
        title = h2(title);
    }
    return collapsible(
        title.classes("inline-block"),
        div(...contents)
    ).direction(JTML.Direction.RIGHT_TO_LEFT).classes("collapsible-section")
}

export function sideBySide(funcs, from, to) {
    if (!Array.isArray(funcs)) {
        funcs = [funcs];
    }
    const last = funcs.pop();
    return div(
        div(
            h3("Code"), 
            pre(
                ...funcs.map(func => toCodeString(func) + "\r\n\r\n"),
                toCodeString(last, from, to)
            ).classes("code")
        ).classes("left"),
        div(h3("Result"), div(last()).classes("right"))
    ).classes("side-by-side")
}