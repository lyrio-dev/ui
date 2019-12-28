import validator from "validator";

export function isValidUsername(username: string): boolean {
  return /^[a-zA-Z0-9\-_.#$]{3,24}$/.test(username);
}

export function isValidPassword(password: string): boolean {
  return password.length >= 6 && password.length <= 32;
}

export function isValidEmail(email: string): boolean {
  return validator.isEmail(email);
}

export function isValidDisplayId(displayId: string): boolean {
  return validator.isInt(displayId);
}
