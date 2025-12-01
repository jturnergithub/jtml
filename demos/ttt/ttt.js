import {button, div, li, ol, text} from "../../jtml.js";
import Board from "./Board.js";

export default [
    div(
        div(
            "Turn ", text().bind("board.turn"),
            " - ",
            text().bind("board.player"), " to play"
        ),
        div(
            (jtml, index, key) => square(index, key)
        ).id("squares").bind("board.squares"),
        div("Winner: ", text().bind("board.winner")).visible("board.winner")
    ).id("board").set("board", new Board()),
    ol(
        board => button("Turn " + board.turn).click(jtml => jtml.set("board", board.copy()))
    ).id("history").bind("history", [new Board()])
];

function square(index, key) {
    return div(
        text().bind(key)
    )
        .classes("square")
        .classes("highlighted", "board.line", line => line?.includes(index))
        .enabled([key, "board.winner"], (symbol, winner) => !symbol && !winner)
        .click(jtml => {
            const board = jtml.get("board");
            jtml.set(key, board.player);
            board.play();
            const history = jtml.get("history");
            history.length = Math.min(history.length, board.turn);
            history.push(board.copy());
        });
}

