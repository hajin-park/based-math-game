export function validateAnswer(
    expected: string,
    actual: string,
    toBase: string
): boolean {
    // Helper function to clean input strings
    const cleanInput = (input: string, base: string) => {
        // Conditionally remove '0x' if present and toBase is 'hexadecimal'
        const cleaned =
            base.toLowerCase() === "hexadecimal" && input.startsWith("0x")
                ? input.substring(2)
                : input;
        // Remove leading zeros and convert to lowercase for case-insensitive comparison
        return cleaned.replace(/^0+/, "").toLowerCase();
    };

    // Clean both expected and actual strings based on the toBase parameter
    const cleanedExpected = cleanInput(expected, toBase);
    const cleanedActual = cleanInput(actual, toBase);

    // Compare the cleaned strings
    return cleanedExpected === cleanedActual;
}
