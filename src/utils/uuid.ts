/**
 * Generate a UUID v4 (random) for chat IDs
 * Similar to ChatGPT's URL format: 68cf0f08-63f8-832f-8ed2-d5a2594d0b2d
 */
export function generateChatId(): string {
  // Generate random hex values
  const hex = () => Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
  
  return [
    hex() + hex(),     // 8 characters
    hex(),             // 4 characters  
    hex(),             // 4 characters
    hex(),             // 4 characters
    hex() + hex()      // 12 characters
  ].join('-');
}

/**
 * Validate if a string is a valid UUID format
 */
export function isValidChatId(id: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(id);
}