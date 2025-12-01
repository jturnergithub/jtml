import {div, palette, repeat, table, td, tr} from "../../jtml.js";

const rows = [
    [ "white", "gray",   "black"  ],
    [ "beige", "tan",    "brown"  ],
    [ "red",   "orange", "yellow" ], 
    [ "green", "blue",   "purple" ]
];

export default palette(
    table(
        ...repeat(rows, row => 
            tr(
                ...repeat(row, color => 
                    td(
                        div().classes(["color-cell", color])
                    ).classes("black-border palette-item").value(color)
                )
            )
        )
    )
).bind("palette-color");