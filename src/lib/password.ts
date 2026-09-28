export interface PasswordRules {
  length: boolean
  lowercase: boolean
  uppercase: boolean
  digit: boolean
  symbol: boolean
}

export function checkPasswordRules(password: string): PasswordRules {
  return {
    length: password.length >= 8 && password.length <= 64,
    lowercase: /[a-z]/.test(password),
    uppercase: /[A-Z]/.test(password),
    digit: /[0-9]/.test(password),
    symbol: /[!@#$%^&*\-_=+?]/.test(password),
  }
}

export function passwordStrengthScore(password: string): number {
  if (password.length < 8) return 1
  const { lowercase, uppercase, digit, symbol } = checkPasswordRules(password)
  const met = [lowercase, uppercase, digit, symbol].filter(Boolean).length
  if (met <= 1) return 1
  if (met === 2) return 2
  if (met === 3) return 3
  return 4
}

export const STRENGTH_LABELS = ['', 'Too short', 'Fair', 'Good', 'Strong'] as const

export function validatePasswordRules(password: string): string | null {
  if (!password) return 'Please enter a password.'
  if (/\s/.test(password)) return 'Password must not contain spaces.'
  if (password.length < 8) return 'Password must be at least 8 characters.'
  if (password.length > 64) return 'Password must be no longer than 64 characters.'
  const { lowercase, uppercase, digit, symbol } = checkPasswordRules(password)
  if (!lowercase) return 'Password must include at least one lowercase letter (a–z).'
  if (!uppercase) return 'Password must include at least one uppercase letter (A–Z).'
  if (!digit) return 'Password must include at least one number (0–9).'
  if (!symbol) return 'Password must include at least one special character (!@#$%^&*-_=+?).'
  return null
}
