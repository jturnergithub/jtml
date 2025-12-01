export default class Character {

    constructor(name) {
        this.name    = name;
        this.gold    = 100;
        this.weapons = ["Sword", "Dagger"];
        this.gems    = {
            diamond : 0,
            ruby    : 0,
            emerald : 0
        }
    }
}
