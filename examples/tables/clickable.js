import {chooser, table, th} from "../../jtml.js";

export default chooser(
    table(
        [ th("City"), th("Location") ],
        [ "Boston", "Massachusetts" ],
        [ "New York City", "New York"],
        [ "Los Angeles", "California"],
        [ "Cleveland", "Ohio" ],
        [ "London", "England" ],
        [ "Tokyo", "Japan" ],
        [ "Minas Tirith", "Gondor" ],
        [ "Trantor", "Trantor" ]
    )
).bind("city");