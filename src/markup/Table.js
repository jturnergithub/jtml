import ContainerTag from "./ContainerTag.js";

export default class Table extends ContainerTag {

    #thead;
    #tfoot;

    constructor(factory = Table.TR_FACTORY) {
        super("table", factory);
        // this.always((tr, index) => tr.classes(index % 2 ? "jtml-odd" : "jtml-even"));
    }

    thead(thead) {
        if (thead === undefined) {
            return this.#thead;
        }
        else {
            this.#thead = thead;
            return this;
        }
    }

    tfoot(tfoot) {
        if (tfoot === undefined) {
            return this.#tfoot;
        }
        else {
            this.#tfoot = tfoot;
            return this;
        }
    }

    appendTo(domNode) {
        if (this.#thead) {
            this.#thead.appendTo(this.domNode);
        }
        super.appendTo(domNode);
        if (this.#tfoot) {
            this.#tfoot.appendTo(this.domNode);
        }
    }
}

Table.TR_FACTORY = function(cells, index) {
    if (cells instanceof ContainerTag) {
        return cells;
    }
    else {
        const tds = cells.map(cell => {
            return Table.textTag("td", cell)}
        );
        return new ContainerTag("tr")._(...tds);    
    }
}
