export function generateStrongPassword(length = 8): string {
    const upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lower = 'abcdefghijklmnopqrstuvwxyz';
    const numbers = '0123456789';
    const symbols = '@%&*!?$';
  
    const allChars = upper + lower + numbers + symbols;
  
    let password = '';
    // Ensure at least one of each required type
    password += upper[Math.floor(Math.random() * upper.length)];
    password += lower[Math.floor(Math.random() * lower.length)];
    password += numbers[Math.floor(Math.random() * numbers.length)];
    password += symbols[Math.floor(Math.random() * symbols.length)];
  
    // Fill the rest with random characters
    for (let i = password.length; i < length; i++) {
      password += allChars[Math.floor(Math.random() * allChars.length)];
    }
  
    // Shuffle password to prevent predictable pattern
    return password.split('').sort(() => 0.5 - Math.random()).join('');
  }