import { v4 as uuid } from "uuid";

import { Locale } from "@/interfaces/Locale";

import type { LocalizedContentSection } from "./ProblemEditPage";

export default <Record<Locale, LocalizedContentSection[]>>{
  [Locale.zh_CN]: [
    {
      uuid: uuid(),
      sectionTitle: "题目描述",
      type: "Text",
      text: ""
    },
    {
      uuid: uuid(),
      sectionTitle: "输入格式",
      type: "Text",
      text: ""
    },
    {
      uuid: uuid(),
      sectionTitle: "输出格式",
      type: "Text",
      text: ""
    },
    {
      uuid: uuid(),
      sectionTitle: "样例",
      type: "Sample",
      sampleId: 0,
      text: ""
    },
    {
      uuid: uuid(),
      sectionTitle: "数据范围与提示",
      type: "Text",
      text: ""
    }
  ],
  [Locale.en_US]: [
    {
      uuid: uuid(),
      sectionTitle: "Description",
      type: "Text",
      text: ""
    },
    {
      uuid: uuid(),
      sectionTitle: "Input",
      type: "Text",
      text: ""
    },
    {
      uuid: uuid(),
      sectionTitle: "Output",
      type: "Text",
      text: ""
    },
    {
      uuid: uuid(),
      sectionTitle: "Sample",
      type: "Sample",
      sampleId: 0,
      text: ""
    },
    {
      uuid: uuid(),
      sectionTitle: "Limits And Hints",
      type: "Text",
      text: ""
    }
  ],
  [Locale.ja_JP]: [
    {
      uuid: uuid(),
      sectionTitle: "問題文",
      type: "Text",
      text: ""
    },
    {
      uuid: uuid(),
      sectionTitle: "入力",
      type: "Text",
      text: ""
    },
    {
      uuid: uuid(),
      sectionTitle: "出力",
      type: "Text",
      text: ""
    },
    {
      uuid: uuid(),
      sectionTitle: "例",
      type: "Sample",
      sampleId: 0,
      text: ""
    },
    {
      uuid: uuid(),
      sectionTitle: "制約",
      type: "Text",
      text: ""
    }
  ]
};
