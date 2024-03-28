export function convertBase(inputString, fromBase, toBase) {
    // Validate the input string based on the fromBase
    const isValidInput = (str, base) => {
        const regex = {
            "binary": /^[01]+$/,
            "decimal": /^[0-9]+$/,
            "hexadecimal": /^[0-9a-fA-F]+$/,
        };
        return regex[base].test(str);
    };

    if (!isValidInput(inputString, fromBase.toLowerCase())) {
        throw new Error(
            `Invalid input string for the specified base: ${fromBase}`
        );
    }

    // Convert the input string to a decimal number
    let decimalValue;
    switch (fromBase.toLowerCase()) {
        case "binary":
            decimalValue = parseInt(inputString, 2);
            break;
        case "decimal":
            decimalValue = parseInt(inputString, 10);
            break;
        case "hexadecimal":
            decimalValue = parseInt(inputString, 16);
            break;
        default:
            throw new Error(
                'Invalid fromBase. Please choose "binary", "decimal", or "hexadecimal".'
            );
    }

    // Convert the decimal value to the target base
    switch (toBase.toLowerCase()) {
        case "binary":
            return decimalValue.toString(2);
        case "decimal":
            return decimalValue.toString(10);
        case "hexadecimal":
            return decimalValue.toString(16);
        default:
            throw new Error(
                'Invalid toBase. Please choose "binary", "decimal", or "hexadecimal".'
            );
    }
}
