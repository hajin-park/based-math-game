/**
 * Format a number string with visual grouping based on the base
 * @param value - The number string to format
 * @param base - The base system (Binary, Octal, Decimal, Hexadecimal)
 * @returns Formatted string with grouping
 */
export function formatWithGrouping(value: string, base: string): string {
  if (!value) return value;

  const baseLower = base.toLowerCase();
  
  switch (baseLower) {
    case 'binary':
      // Groups of 4, pad with leading zeros to make groups of 4
      return groupDigits(value, 4, ' ');
    
    case 'octal':
      // Groups of 3, pad with leading zeros to make groups of 3
      return groupDigits(value, 3, ' ');
    
    case 'decimal':
      // Add commas for thousands
      return value.replace(/\B(?=(\d{3})+(?!\d))/g, ',');

    case 'hexadecimal': {
      // Remove 0x prefix if present, group by 4, add back prefix
      const cleanHex = value.replace(/^0x/i, '');
      const grouped = groupDigits(cleanHex, 4, ' ');
      return grouped;
    }
    
    default:
      return value;
  }
}

/**
 * Group digits from right to left with padding
 * @param value - The string to group
 * @param groupSize - Size of each group
 * @param separator - Separator between groups
 * @returns Grouped string
 */
function groupDigits(value: string, groupSize: number, separator: string): string {
  if (!value) return value;
  
  // Pad with leading zeros to make length a multiple of groupSize
  const paddingNeeded = (groupSize - (value.length % groupSize)) % groupSize;
  const paddedValue = '0'.repeat(paddingNeeded) + value;
  
  // Split into groups from left to right
  const groups: string[] = [];
  for (let i = 0; i < paddedValue.length; i += groupSize) {
    groups.push(paddedValue.slice(i, i + groupSize));
  }
  
  return groups.join(separator);
}

/**
 * Get index value hints for each digit position, formatted to align with grouped digits
 * @param value - The number string
 * @param base - The base system (Binary, Octal, Decimal, Hexadecimal)
 * @param grouped - Whether the number is displayed with grouping
 * @returns Formatted string of index hints that aligns with the displayed number
 */
export function getIndexHints(value: string, base: string, grouped: boolean = false): string {
  if (!value) return '';

  const baseLower = base.toLowerCase();
  const baseValue = getBaseValue(baseLower);

  if (baseValue === null) return '';

  const hints: string[] = [];
  const length = value.length;

  // Calculate power for each position (right to left)
  for (let i = 0; i < length; i++) {
    const power = length - 1 - i;
    const hintValue = Math.pow(baseValue, power);
    hints.push(hintValue.toString());
  }

  // If grouped, we need to add spaces to match the grouped number format
  if (grouped) {
    const groupSize = baseLower === 'binary' || baseLower === 'hexadecimal' ? 4 :
                      baseLower === 'octal' ? 3 : 0;

    if (groupSize > 0) {
      // Pad the value to match grouping
      const paddingNeeded = (groupSize - (value.length % groupSize)) % groupSize;

      // Add padding to hints array at the beginning
      for (let i = 0; i < paddingNeeded; i++) {
        hints.unshift('0');
      }

      // Insert spaces at group boundaries
      const result: string[] = [];
      for (let i = 0; i < hints.length; i++) {
        if (i > 0 && i % groupSize === 0) {
          result.push('  '); // Add double space separator to match grouped digit spacing
        }
        result.push(hints[i] + ' '); // Add space after each hint value
      }

      return result.join('').trim();
    }
  }

  return hints.join('  '); // Use double space for better readability
}

/**
 * Get the numeric base value
 */
function getBaseValue(base: string): number | null {
  switch (base) {
    case 'binary': return 2;
    case 'octal': return 8;
    case 'decimal': return 10;
    case 'hexadecimal': return 16;
    default: return null;
  }
}



