import { Locale } from "@/interfaces/Locale";

// See escapeLocalizedMessage in messages/importMessages.js
export function unescapeLocalizedMessage(text: string) {
  if (text.startsWith(" ")) text = text.substr(1);
  text = text.split("&lt;").join("<").split("&amp;").join("&");
  return text;
}

export async function loadLocaleData(locale: Locale): Promise<Record<string, string>>;
export async function loadLocaleData(locale: Locale): Promise<any> {
  switch (locale) {
    case Locale.en_US:
      return await import("./messages/en-US");
    case Locale.zh_CN:
      return await import("./messages/zh-CN");
    case Locale.ja_JP:
      return await import("./messages/ja-JP");
  }
}

export type LocalizerParameters = Record<React.ReactText, React.ReactText> | React.ReactText[];
export type Localizer = (messageId: string, parameters?: LocalizerParameters) => string;
export interface ToBeLocalizedText {
  (_: Localizer): string;
  isToBeLocalizedText: true;
}

export const makeToBeLocalizedText = (messageId: string, parameters?: LocalizerParameters): ToBeLocalizedText =>
  Object.assign((_: Localizer) => _(messageId, parameters), { isToBeLocalizedText: true as true });

export const isToBeLocalizedText = (object: any): object is ToBeLocalizedText =>
  "isToBeLocalizedText" in object && object.isToBeLocalizedText === true;
