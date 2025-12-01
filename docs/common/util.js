const NEW_LINE = "\r\n";
const NEW_LINE_REGEX = /\r?\n/

export function assemble(strings, ...substitutions) {
    // find out how much whitespace is at the start of line 0
    let index = strings[0].length - strings[0].trimStart().length;
    // Account for strings that start with newline
    if (strings[0].search(NEW_LINE_REGEX) === 0) {
        index--;
    }
    // Original strings array is immutable; this returns a copy
    // What it does: take each string; splits it into substrings by newline; strips off whitespace from
    // each substring; joins the substrings back together to replace the original string.
    strings = strings.map(
        string => leftJustify(string.split(NEW_LINE_REGEX), index).join(NEW_LINE)
    );
    const chunks = [];
    // ASSUMPTION: number of substitutions is one less than the number of strings. Otherwise
    // none of this can possibly work, because there's no way to know if two substitutions
    // should get glommed together.
    for (const substitution of substitutions) {
        chunks.push(strings.shift(), substitution);
    }
    chunks.push(strings.shift());
    return chunks;
}

export function toCodeString(js, from = 0, to) {
    if (typeof js === "function") {
        // String it.
        js = `${js}`
    }
    // Split it into lines and take the lines between from and to
    const lines = js.split(NEW_LINE_REGEX).slice(from, to);
    return leftJustify(lines).join(NEW_LINE);
}

export function leftJustify(lines, index) {
    if (index === undefined) {
        // find out how much whitespace is at the start of line 0
        index = lines[0].length - lines[0].trimStart().length;
    }
    // trim that much whitespace off each line and join up the remainder
    return lines.map(line => {
        // If there isn't enough whitespace, do nothing.
        if (line.substring(0, index).trim().length) {
            return line;
        }
        else {
            return line.substring(index);
        }
    });
}
