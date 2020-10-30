import { Locale } from "@/interfaces/Locale";

export interface LocaleMeta {
  name: string;
  flag: string;
  recaptchaLanguageCode: string;
}

const localeMeta: Record<Locale, LocaleMeta> = {
  [Locale.zh_CN]: {
    name: "中文（简体）",
    flag: "cn",
    recaptchaLanguageCode: "zh-CN"
  },
  [Locale.en_US]: {
    name: "English",
    flag: "us",
    recaptchaLanguageCode: "en"
  },
  [Locale.ja_JP]: {
    name: "日本語",
    flag: "jp",
    recaptchaLanguageCode: "ja"
  }
};

export default localeMeta;
