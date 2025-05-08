const formatAddress = (address: string): string => {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

const toHexString = (bytes: Uint8Array) =>
  '0x' +
  bytes.reduce((str, byte) => str + byte.toString(16).padStart(2, '0'), '');

const formatTime = (seconds: number, shortFormat: boolean = false): string => {
  if (!seconds) return shortFormat ? '0s' : '0 seconds';

  const days = Math.floor(seconds / (24 * 60 * 60));
  const hours = Math.floor((seconds % (24 * 60 * 60)) / (60 * 60));
  const minutes = Math.floor((seconds % (60 * 60)) / 60);
  const remainingSeconds = seconds % 60;

  const parts = [];
  if (days > 0)
    parts.push(`${days}${shortFormat ? 'd' : ` day${days !== 1 ? 's' : ''}`}`);
  if (hours > 0)
    parts.push(
      `${hours}${shortFormat ? 'h' : ` hour${hours !== 1 ? 's' : ''}`}`,
    );
  if (minutes > 0)
    parts.push(
      `${minutes}${shortFormat ? 'm' : ` minute${minutes !== 1 ? 's' : ''}`}`,
    );
  if (remainingSeconds > 0)
    parts.push(
      `${remainingSeconds}${
        shortFormat ? 's' : ` second${remainingSeconds !== 1 ? 's' : ''}`
      }`,
    );

  return parts.join(shortFormat ? ' ' : ', ');
};

/**
 * Formats a token balance with dynamic decimal places:
 * - 5 decimal places when value < 1
 * - 3 decimal places when 1 ≤ value < 1000
 * - 2 decimal places when value ≥ 1000
 * - 0 decimal places when value ≥ 100000
 *
 * @param value The token amount as bigint
 * @param decimals The number of decimals for the token
 */
function formatUnits(value: bigint, decimals: number) {
  let display = value.toString();

  const negative = display.startsWith('-');
  if (negative) display = display.slice(1);

  display = display.padStart(decimals, '0');

  const integer = display.slice(0, display.length - decimals);
  let fraction = display.slice(display.length - decimals);

  // Convert to number for comparison
  const numValue = Number(integer + '.' + fraction);

  // Determine decimal places based on value
  let decimalPlaces = 0; // default
  if (numValue < 1) decimalPlaces = 5;
  else if (numValue < 1000) decimalPlaces = 3;
  else if (numValue < 100000) decimalPlaces = 2;

  // Format fraction to specified decimal places and remove trailing zeros
  fraction = fraction.slice(0, decimalPlaces).replace(/(0+)$/, '');

  return `${negative ? '-' : ''}${integer || '0'}${
    fraction ? `.${fraction}` : ''
  }`;
}

export { formatAddress, toHexString, formatTime, formatUnits };
