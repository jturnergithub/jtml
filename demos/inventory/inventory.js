import {checkbox, div, table, td, th, text, textField, tr} from "../../jtml.js";

let category = "";

function rowVisible(product, filter, restrict) {
    const filtered = filter && !product.name.toLowerCase().includes(filter.toLowerCase());
    const restricted = restrict && !product.stocked;
    return !filtered && !restricted;
}

function rowFactory(product) {
    const rows = [];
    if (product.category !== category) {
        category = product.category;
        rows.push(tr(td(product.category).attr("colspan", 2)).classes("category-row"))
    }
    rows.push(
        tr(
            td(product.name), td(product.price)
        )
            .classes("product-row")
            .classes("in-stock", product.stocked)
            .visible(["search.filter", "search.restrict"], (filter, restrict) => rowVisible(product, filter, restrict))
    );
    return rows;
}

export default function() {
    return div(
        div(
            textField().attr("placeholder", "Search...").bind("search.filter"),
            div(
                checkbox().bind("search.restrict"), "Only show products in stock"
            )
        ).id("search-bar"),
        table(rowFactory).bind("products").thead(
            tr(th("Name"), th("Price"))
        )
    );
}