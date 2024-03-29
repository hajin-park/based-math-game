export function generateQuestion(
    fromBase: string,
    rangeLower: number,
    rangeUpper: number
): string {
    // Step 1: Map base names to numbers
    const baseMappings: { [key: string]: number } = {
        "binary": 2,
        "octal": 8,
        "decimal": 10,
        "hexadecimal": 16,
        // Add more bases as needed
    };

    const fromBaseNumber = baseMappings[fromBase.toLowerCase()];

    if (!fromBaseNumber) {
        throw new Error(`Unsupported base: ${fromBase}`);
    }

    // Step 2: Generate a random number within the range
    const randomNumber =
        Math.floor(Math.random() * (rangeUpper - rangeLower + 1)) + rangeLower;

    // Convert the number to the fromBase for consistency in question (e.g., show the number in hexadecimal if needed)
    const numberInFromBase = randomNumber.toString(fromBaseNumber);

    // Step 3: Format the question
    return `${numberInFromBase}`;
}
