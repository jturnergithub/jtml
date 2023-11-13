import {div, h2} from "../../../src/jtml.js";

export default function exampleDiv(header, ...contents) {
    return div(
        h2(header),
        ...contents
    ).classes("example");
}
