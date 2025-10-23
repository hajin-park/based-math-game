export function validateAnswer(
  expected: string,
  actual: string,
  toBase: string,
): boolean {
  // Helper function to clean input strings
  const cleanInput = (input: string, base: string) => {
    // Conditionally remove '0x' if present and toBase is 'hexadecimal'
    const cleaned =
      base.toLowerCase() === "hexadecimal" && input.startsWith("0x")
        ? input.substring(2)
        : input;
    // Remove leading zeros and convert to lowercase for case-insensitive comparison
    // Special case: if the result is empty after removing zeros, it means the value is 0
    const withoutLeadingZeros = cleaned.replace(/^0+/, "");
    return (withoutLeadingZeros || "0").toLowerCase();
  };

  // Clean both expected and actual strings based on the toBase parameter
  const cleanedExpected = cleanInput(expected, toBase);
  const cleanedActual = cleanInput(actual, toBase);

  // Compare the cleaned strings
  return cleanedExpected === cleanedActual;
}
