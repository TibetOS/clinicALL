/**
 * Security validation utilities
 */

// List of allowed redirect domains
const ALLOWED_REDIRECT_HOSTS = [
  window.location.host, // Same origin
];

// List of allowed URL protocols
const ALLOWED_PROTOCOLS = ['mailto:', 'tel:'];

/**
 * Validates if a URL is safe for redirection
 * Prevents open redirect vulnerabilities
 */
export function isValidRedirectUrl(url: string): boolean {
  // Allow relative URLs starting with /
  if (url.startsWith('/') && !url.startsWith('//')) {
    return true;
  }

  // Allow mailto: and tel: protocols (for email/phone links)
  if (ALLOWED_PROTOCOLS.some(protocol => url.startsWith(protocol))) {
    return true;
  }

  try {
    const parsedUrl = new URL(url, window.location.origin);

    // Check if the host is in our allowed list
    if (ALLOWED_REDIRECT_HOSTS.includes(parsedUrl.host)) {
      return true;
    }

    return false;
  } catch {
    // Invalid URL format
    return false;
  }
}

/**
 * Safely redirect to a URL
 * Falls back to home page if URL is invalid
 */
export function safeRedirect(url: string, fallback = '/'): void {
  if (isValidRedirectUrl(url)) {
    window.location.href = url;
  } else {
    window.location.href = fallback;
  }
}

/**
 * Validates Israeli phone number format
 * Accepts formats: 050-1234567, 0501234567, 050-123-4567
 */
export function isValidIsraeliPhone(phone: string): boolean {
  // Remove all non-digit characters
  const digits = phone.replace(/\D/g, '');

  // Israeli mobile numbers: 10 digits starting with 05
  // Israeli landlines: 9-10 digits starting with 0
  if (digits.length === 10 && digits.startsWith('05')) {
    return true;
  }
  if ((digits.length === 9 || digits.length === 10) && digits.startsWith('0')) {
    return true;
  }

  return false;
}

/**
 * Validates email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validates password strength for healthcare applications
 * Requirements: 8+ chars, at least one uppercase, one lowercase, one number
 */
export function isStrongPassword(password: string): { valid: boolean; message: string } {
  if (password.length < 8) {
    return { valid: false, message: 'הסיסמה חייבת להכיל לפחות 8 תווים' };
  }

  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);

  if (!hasUppercase || !hasLowercase || !hasNumber) {
    return {
      valid: false,
      message: 'הסיסמה חייבת להכיל אותיות גדולות, אותיות קטנות ומספרים',
    };
  }

  return { valid: true, message: '' };
}

/**
 * Sanitizes user input to prevent XSS
 * Note: This is a basic sanitizer. For displaying user content,
 * always use React's built-in escaping or a library like DOMPurify.
 */
export function sanitizeInput(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}
