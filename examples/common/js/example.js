import {div, h2} from "../../../jtml.js";

export default function example(header, ...contents) {
    return div(
        h2(header),
        ...contents
    ).classes("example");
}
