export function compareBaseNumbers(expectedString, actualString) {
    // Function to remove leading zeros from a base number string
    const removeLeadingZeros = (str) => str.replace(/^0+/, "");

    // Remove leading zeros from both strings
    const normalizedExpected = removeLeadingZeros(expectedString);
    const normalizedActual = removeLeadingZeros(actualString);

    // Compare the normalized strings
    return normalizedExpected === normalizedActual;
}
