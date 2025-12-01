import {table, td, th, tr} from "../../jtml.js";

export default table(
    tr(
        th(""), th("A"), th("B"), th("C"),
    ),
    tr(th(1), "A1", "B1", "C1"),
    tr(th(2), "A2", "B2", "C2"),
    tr(th(3), "A3", td("B3").classes("orange"), "C3"),
    tr(th(4), "A4", "B4", "C4"),
    tr(th(5), "A5", "B5", "C5")
).classes("banded");