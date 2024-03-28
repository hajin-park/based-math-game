export function generateRandomString(lowerBound, upperBound, base) {
    // Ensure the bounds are integers and lowerBound is not greater than upperBound
    lowerBound = Math.ceil(lowerBound);
    upperBound = Math.floor(upperBound);
    if (lowerBound > upperBound) {
        throw new Error(
            "Lower bound must be less than or equal to upper bound."
        );
    }

    // Generate a random number within the bounds
    const randomNumber =
        Math.floor(Math.random() * (upperBound - lowerBound + 1)) + lowerBound;

    // Convert the number to the specified base
    switch (base.toLowerCase()) {
        case "binary":
            return randomNumber.toString(2);
        case "decimal":
            return randomNumber.toString(10);
        case "hexadecimal":
            return randomNumber.toString(16);
        default:
            throw new Error(
                'Invalid base. Please choose "binary", "decimal", or "hexadecimal".'
            );
    }
}
