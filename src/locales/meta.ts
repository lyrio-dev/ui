import { Locale } from "@/interfaces/Locale";

export interface LocaleMeta {
  name: string;
  flag: string;
}

const localeMeta: Record<Locale, LocaleMeta> = {
  [Locale.zh_CN]: {
    name: "中文（简体）",
    flag: "cn"
  },
  [Locale.en_US]: {
    name: "English",
    flag: "us"
  }
};

export default localeMeta;
