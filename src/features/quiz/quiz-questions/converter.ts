export function convertBase(
  inputString: string,
  fromBase: string,
  toBase: string,
): string {
  // Map the base names to numbers
  const baseMappings: { [key: string]: number } = {
    binary: 2,
    octal: 8,
    decimal: 10,
    hexadecimal: 16,
    // Add more base mappings as needed
  };

  // Convert base names to numbers
  const fromBaseNumber = baseMappings[fromBase.toLowerCase()];
  const toBaseNumber = baseMappings[toBase.toLowerCase()];

  // Validate bases
  if (fromBaseNumber === undefined) {
    throw new Error(`Unsupported 'from' base: ${fromBase}`);
  }
  if (toBaseNumber === undefined) {
    throw new Error(`Unsupported 'to' base: ${toBase}`);
  }

  // Convert inputString from fromBaseNumber to an integer
  const number = parseInt(inputString, fromBaseNumber);
  if (isNaN(number)) {
    throw new Error(
      `Invalid number for the specified 'from' base: ${inputString}, ${fromBaseNumber}`,
    );
  }

  // Convert the number to toBaseNumber and return
  return number.toString(toBaseNumber);
}
