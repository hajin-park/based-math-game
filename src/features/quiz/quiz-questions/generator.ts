// Simple seeded random number generator for deterministic questions
function seededRandom(seed: number): number {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

export function generateQuestion(
  fromBase: string,
  rangeLower: number,
  rangeUpper: number,
  seed?: number, // Optional seed for deterministic generation in multiplayer
): string {
  // Step 1: Map base names to numbers
  const baseMappings: { [key: string]: number } = {
    binary: 2,
    octal: 8,
    decimal: 10,
    hexadecimal: 16,
    // Add more bases as needed
  };

  const fromBaseNumber = baseMappings[fromBase.toLowerCase()];

  if (!fromBaseNumber) {
    throw new Error(`Unsupported base: ${fromBase}`);
  }

  // Step 2: Generate a random number within the range
  // Use seeded random if seed is provided (for multiplayer), otherwise use Math.random()
  const randomValue = seed !== undefined ? seededRandom(seed) : Math.random();
  const randomNumber =
    Math.floor(randomValue * (rangeUpper - rangeLower + 1)) + rangeLower;

  // Convert the number to the fromBase for consistency in question (e.g., show the number in hexadecimal if needed)
  const numberInFromBase = randomNumber.toString(fromBaseNumber);

  // Step 3: Format the question
  return `${numberInFromBase}`;
}
