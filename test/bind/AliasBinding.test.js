import test from "ava";
import AliasBinding from "../../src/bind/AliasBinding.js"
import ValueBinding from "../../src/bind/ValueBinding.js";
import Character from "./_Character.js";

test("Basic alias", t => {
    let counter = 0;
    const basis = new ValueBinding("basis").set(42);
    const alias = new AliasBinding("alias");
    t.is(counter, 0);
    alias.monitor(() => counter++);
    t.is(counter, 1);
    alias.basis = basis;
    t.is(counter, 2);
    basis.value = 0;
    t.is(counter, 3);
    alias.value = -1;
    t.is(counter, 4);
    alias.basis = undefined;
    t.is(counter, 5);
    basis.value = 999;
    t.is(counter, 5);
});

test("Two-level alias", t => {
    let counter = 0;
    const smedley = new Character("smedley");
    const bertha  = new Character("bertha");
    const basis   = new ValueBinding("basis", smedley);
    const alias   = new AliasBinding("alias");
    t.is(counter, 0);
    alias.monitor(() => counter++);
    t.is(counter, 1);
    alias.basis = basis;
    t.is(counter, 2);
    t.is(alias.value.__target, smedley);
    alias.value.gold = 0;
    t.is(smedley.gold, 0);
    basis.value = bertha;
    t.is(counter, 3);
});

test("Alias basis with undefined value; set value in basis", t => {
    let aliasCounter = 0;
    let basisCounter = 0;
    const smedley = new Character("smedley");
    const bertha  = new Character("bertha");
    const basis   = new ValueBinding("basis");
    const alias   = new AliasBinding("alias");
    alias.basis   = basis;
    t.assert(!alias.value);
    basis.value   = smedley;
    t.is(alias.rawValue, smedley);
    basis.value   = bertha;
    t.is(alias.rawValue, bertha);
});

test("Alias basis with undefined value; set value in alias", t => {
    let aliasCounter = 0;
    let basisCounter = 0;
    const smedley    = new Character("smedley");
    const bertha     = new Character("bertha");
    const basis      = new ValueBinding("basis");
    const alias      = new AliasBinding("alias");
    alias.basis      = basis;
    t.assert(!alias.value);
    alias.value      = smedley;
    t.is(basis.rawValue, smedley);
    alias.value      = bertha;
    t.is(basis.rawValue, bertha);
});


test("Alias with deferred binding", t => {
    let aliasCounter = 0;
    let basisCounter = 0;
    const smedley = new Character("smedley");
    const bertha  = new Character("bertha");
    const basis   = new ValueBinding("basis", smedley);
    const alias   = new AliasBinding("alias");
    t.is(basisCounter, 0);
    t.is(aliasCounter, 0);
    basis.monitor(() => basisCounter++);
    t.is(basisCounter, 1);
    t.is(aliasCounter, 0);
    alias.monitor(() => aliasCounter++);
    t.is(aliasCounter, 1);
    t.assert(!alias.value);
    basis.value = bertha;
    t.is(basisCounter, 2);
    t.is(aliasCounter, 1);
    alias.basis = basis;
    t.assert(alias.value);
    t.is(basisCounter, 2);
    t.is(aliasCounter, 2);
    basis.value = smedley;
    t.is(basisCounter, 3);
    t.is(aliasCounter, 3);
    alias.basis = undefined;
    t.is(basisCounter, 3);
    t.is(aliasCounter, 4);
    t.assert(!alias.basis);
    t.assert(!alias.value);
    basis.value = bertha;
    t.is(basisCounter, 4);
});

test("Move alias", t => {
    const smedley    = new Character("smedley");
    const bertha     = new Character("bertha");
    const basis0     = new ValueBinding("basis0", smedley);
    const basis1     = new ValueBinding("basis1", bertha)
    const alias      = new AliasBinding("alias");
    alias.basis      = basis0;
    t.is(alias.rawValue, smedley);
    alias.basis      = basis1;
    t.is(alias.rawValue, bertha);
});

test("Add and remove alias", t => {
    let counter   = 0;
    const smedley = new Character("smedley");
    const bertha  = new Character("bertha");
    const basis   = new ValueBinding("smedley");
    const alias   = new AliasBinding("alias").monitor(() => counter++);
    t.is(counter, 1);
    alias.basis   = basis;
    t.is(counter, 2);
    alias.basis   = undefined;
    t.is(counter, 3);
    basis.value   = bertha;
    t.is(counter, 3)
});