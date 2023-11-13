import Binder from "../../src/bind/Binder.js";

function environment(name) {
    console.log("----- " + name + "-----");
    const env = {
        
        binder : new Binder(),
        childNotified : 0,
        parentNotified : 0,

        jt : {
            name : "JT",
            status : {
                employed : false,
                temperature : "warm"
            }
        },
    
        robin : {
            name : "Robin",
            status : {
                employed : true,
                temperature : "cold"
            }    
        },

    };
    env.person = env.binder.binding("person");
    return env;
};

function setBindingValue() {
    const env = environment("setBindingValue()");
    env.person.value = env.jt;
    console.assert(env.person.oldValue === undefined, "Binding has unexpected oldValue property");
    console.assert(env.person.rawValue === env.jt, "Binding raw value does not match original");

}

function getBindingValue() {
    const env = environment("getBindingValue()");
    env.person.value = env.jt;
    console.assert(env.person.value.name === env.jt.name, "Name in bound value does not match name in object");
}

function getChild() {
    const env = environment("getChild()");
    env.person.value = env.jt;
    const child = env.binder.binding("person.name");
    console.assert(child !== undefined, "Child binding 'person.name' does not exist");
    console.assert(child.value === env.jt.name, `child.value returned ${child.value} instead of '${env.jt.name}'`);
}

function assignChildPrimitive() {
    const env = environment("assignChildPrimitive()");
    env.person.value = env.jt;
    env.person.monitor(() => env.parentNotified++);
    const child = env.binder.binding("person.name");
    child.monitor(() => env.childNotified++);
    child.value = "Jonathan";
    console.assert(env.person.value.name === "Jonathan", "Parent name is " + env.person.value.name);
    console.assert(env.childNotified === 1, "Child monitor callback invoked " + env.childNotified + "x");
    console.assert(env.parentNotified === 1, "Parent monitor callback invoked " + env.parentNotified + "x");
}

function assignParentPropertyPrimitive() {
    const env = environment("assignParentPropertyPrimitive()");
    env.person.value = env.jt;
    env.person.monitor(() => env.parentNotified++);
    env.person.value.name = "Jonathan";
    console.assert(env.parentNotified === 1, "Parent monitor callback invoked " + env.parentNotified + "x");
    console.assert(env.jt.name === "Jonathan", "Object name is " + env.jt.name);
    console.assert(env.person.child("name").value === "Jonathan", "Child name is " + env.person.child("name").value);
}

function setChildPrimitive() {
    const env = environment("setChildPrimitive()");
    env.person.value = env.jt;
    env.person.monitor(() => env.parentNotified++);
    const child = env.binder.binding("person.name");
    child.monitor(() => env.childNotified++);
    child.set("Jonathan");
    console.assert(env.person.value.name === "Jonathan", "Parent name is " + env.person.value.name);
    console.assert(env.childNotified === 2, "Child monitor callback invoked " + env.childNotified + "x");
    console.assert(env.parentNotified === 1, "Parent monitor callback invoked " + env.parentNotified + "x");
}

function assignParentObject() {
    const env = environment("assignParentObject()");
    env.person.value = env.jt;
    env.person.monitor(() => env.parentNotified++);
    env.binder.binding("person.name").monitor(() => env.childNotified++);
    env.person.value = env.robin;
    console.assert(env.binder.binding("person.name").value === "Robin", "Name not changed in child binding");
    console.assert(env.childNotified === 1, "Child monitor callback invoked " + env.childNotified + "x");
    console.assert(env.parentNotified === 1, "Parent monitor callback invoked " + env.parentNotified + "x");
}

function setParentObject() {
    const env = environment("setParentObject()");
    env.person.value = env.jt;
    env.person.monitor(() => env.parentNotified++);
    env.binder.binding("person.name").monitor(() => env.childNotified++);
    env.person.set(env.robin);
    console.assert(env.binder.binding("person.name").value === "Robin", "Name not changed in child binding");
    console.assert(env.childNotified === 2, "Child monitor callback invoked " + env.childNotified + "x");
    console.assert(env.parentNotified === 2, "Parent monitor callback invoked " + env.parentNotified + "x");
}

function setGrandchildPrimitive() {
    const env = environment("setGrandchildPrimitive()");
    env.person.set(env.jt);
    env.binder.binding("person.status.temperature").set("normal");
    console.assert(env.jt.status.temperature === "normal", "Object property value is " + env.jt.status.temperature);
    console.assert(env.person.value.status.temperature === "normal", "Inconsistent object in parent binding");
}


setBindingValue();
getBindingValue();
getChild();
assignChildPrimitive();
assignParentPropertyPrimitive();
setChildPrimitive();
assignParentObject();
setParentObject();
setGrandchildPrimitive();