import {div, p, pre, span} from "../../jtml.js";

export function code(...contents) {
    return span(...contents).classes("code")
}

export function codeBlock(...contents) {
    return pre(
        p(
            ...contents
        ).classes("code")
    );
}

export function highlighted(text) {
    return span(text).classes("highlighted");
}

export function keyword(text) {
    return span(text).classes("keyword");
}

export function note(...contents) {
    return div(...contents).classes("note");
}

export function qna(question, ...answers) {
    return [
        p(question).classes("question"),
        ...answers.map(answer => typeof answer === "string" ? p(answer).classes("answer") : answer)
    ]
}

export function term(text) {
    return span(text).classes("term")
}