import {button, checkbox, div, h1, label, li, ol, repeat, radio, select, text} from "../../jtml.js";
import Game from "./Game.js";

const digits = "0123456789";
let game = new Game();

function keyUp(k) {
    if (digits.includes(k)) {
        game.push(Number(k));
    }
    else if (k === "Backspace") {
        game.pop();
    }
    else if (k === "Enter") {
        game.check();
    }
}

function digitFactory(key) {
    return div(text().bind(`${key}.digit`))
        .classes("digit")
        .classes(game.difficulty)
        .bindClass(`${key}.result`);
}

function guessFactory(guess, index, key) {
    return li(
        div(
            ...repeat(6, i => 
                digitFactory(`${key}.elements[${i}]`).visible("game.solution.length", length => i < length)
            )
        ).classes("digits"),
        div(
            button("Clear").disabled(`${key}.elements.length`, 1).click(() => game.clear()),
            button("Check").enabled(`${key}.complete`).click(() => game.check())
        ).visible(["game.done", "game.guesses.length"], (done, length) => !done && length === index + 1),
        div(
            div(text().bind(`${key}.bullCt`)).classes("sum bull"),
            div(text().bind(`${key}.cowCt`)).classes("sum cow")
        ).classes("summary").visible(["game.difficulty", "game.guesses.length"], (difficulty, length) => difficulty === "hard" && length > index + 1)
    )
        .classes("guess")
        .attr("tabindex", -1)
        .focus(`game.guesses.length`, length => length === index + 1)
        .type((jtml, event) => keyUp(event.key));
}

const board = div(
    h1("Bulls and Cows"),
    div(
        div(label("How many digits?", select(3, 4, 5, 6).bind("game.width"))),
        div(checkbox().bind("game.duplicates"), "Allow duplicates"),
        div(label(
            "Difficulty: ",
            radio("easy", "hard")
                .layout("horizontal")
                .bind("game.difficulty")
                .enabled("game.done")
        )),
        div(button("Play").click(() => game.start()))
    ).id("settings").enabled("game.done"),
    div(
        div(
            (digit, index, key) => div(text().bind(key)).classes("digit").classes("bull", "game.done")
        ).id("solution").bind("game.solution"),
        button("Reveal").hidden("game.done").click(() => game.done = true)
    ),
    ol(guessFactory).bind("game.guesses").hidden("game.done")
).id("board").set("game", game);

game  = board.get("game");

export default board;