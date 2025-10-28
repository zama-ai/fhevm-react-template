/**
 * Utility function to safely serialize objects containing BigInt values
 * @param obj - The object to serialize
 * @param space - Optional spacing for JSON formatting
 * @returns JSON string with BigInt values converted to strings
 */
export const safeJsonStringify = (obj: any, space?: number): string => {
  return JSON.stringify(obj, (key, value) => 
    typeof value === 'bigint' ? value.toString() : value, 
    space
  );
};
