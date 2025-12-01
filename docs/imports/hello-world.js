export const html = `
    <body>
        <h1>Hello, world!</h1>
        <div>
            Four score and seven years ago, our fathers brought forth on this
            continent a new nation, conceived in liberty, and dedicated to the 
            proposition that all men are created equal.
        </div>
        <img src="../jtml.gif" width="120" height="120">
    </body>`;

export const jtml = `
    body(
        h1("Hello, world!"),
        div(${`\`
            Four score and seven years ago, our fathers brought forth on this 
            continent a new nation, conceived in liberty, and dedicated to the 
            proposition that all men are created equal.
        \``}),
        img("../jtml.gif").attrs({ "width" : 120, "height" : 120})
    )`