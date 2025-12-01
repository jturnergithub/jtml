import Chooser from "./Chooser.js";

/**
 * A Chooser subclass that uses a table, rather than a one-dimensional list,
 * to store its potential choices. Overrides the selectables() method to return
 * <td> tags, rather than iterating through all children.
 * 
 */
export default class Palette extends Chooser {

    constructor(table, mode) {
        super(table, mode);
        this.classes("jtml-ui jtml-palette");
    }

    /**
     * Overrides the base class method, because the table is 2D. Instead of
     * making sure that each child of the Chooser is correctly configured
     * to respond to clicks and update its state,
     * we have to make sure that each child of each child--i.e., each <td>
     * in each <tr>--is correctly configured to etc. 
     *      * 
     * @param {string} key 
     */
    bindChoices(key) {
        this.tag.always((tr, i) => 
            tr.always((td, j) => this.bindChoice(td, j, `${key}[${i}]`))
        )
    }

    selectables() {
        return this.find(tag => tag.name === "td", true);
    }
}