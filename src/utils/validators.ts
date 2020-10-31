import validator from "validator";

// Change `/patches/markdown-it-mentions+1.0.0.patch` together if you change this regex
export function isValidUsername(username: string): boolean {
  return /^[a-zA-Z0-9\-_.#$]{3,24}$/.test(username);
}

export function isValidGroupName(groupName: string): boolean {
  return /^[a-zA-Z0-9 :@~\-_.#$/]{1,48}$/.test(groupName);
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

export function isValidFilename(filename: string): boolean {
  const forbiddenCharacters = ["/", "\x00"];
  const reservedFilenames = [".", ".."];
  return forbiddenCharacters.every(ch => filename.indexOf(ch) === -1) && !reservedFilenames.includes(filename);
}

export function stripInvalidCharactersInEmailVerificationCode(str: string) {
  return str.replace(/[^\d]/g, "");
}
