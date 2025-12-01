import ContainerTag from "./ContainerTag.js";

export default class TableRow extends ContainerTag {

    constructor(factory = tdFactory) {
        super("tr", factory);
    }

}

function tdFactory(cell) {
    if (cell instanceof ContainerTag) {
        return cell;
    }
    else if (Array.isArray(cell)) {
        return new ContainerTag("td")._(...cell);
    }
    else {
        return new ContainerTag("td")._(cell);
    }
}