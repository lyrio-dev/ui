import { appState } from "@/appState";

export enum CodeLanguage {
  Cpp = "cpp",
  C = "c",
  Java = "java",
  Kotlin = "kotlin",
  Pascal = "pascal",
  Python = "python",
  Rust = "rust",
  Swift = "swift",
  Go = "go",
  Haskell = "haskell",
  CSharp = "csharp",
  FSharp = "fsharp"
}

// For UI
export enum CodeLanguageOptionType {
  Select = "Select"
  // Input = "Input"
}

export interface CodeLanguageOption {
  name: string;
  type: CodeLanguageOptionType;
  values: string[]; // string[] | undefined
  defaultValue: string; // string | boolean
}

const codeLanguageExtensions: Record<CodeLanguage, string[]> = {
  [CodeLanguage.Cpp]: [".cpp", ".cc", ".cxx"],
  [CodeLanguage.C]: [".c"],
  [CodeLanguage.Java]: [".java"],
  [CodeLanguage.Kotlin]: [".kt"],
  [CodeLanguage.Pascal]: [".pas"],
  [CodeLanguage.Python]: [".py"],
  [CodeLanguage.Rust]: [".rs"],
  [CodeLanguage.Swift]: [".swift"],
  [CodeLanguage.Go]: [".go"],
  [CodeLanguage.Haskell]: [".hs"],
  [CodeLanguage.CSharp]: [".cs"],
  [CodeLanguage.FSharp]: [".fs"]
};

export function checkCodeFileExtension(language: CodeLanguage, filename: string): boolean {
  return codeLanguageExtensions[language].some(extension => filename.toLowerCase().endsWith(extension));
}

export const compileAndRunOptions: Record<CodeLanguage, CodeLanguageOption[]> = {
  [CodeLanguage.Cpp]: [
    {
      name: "compiler",
      type: CodeLanguageOptionType.Select,
      values: ["g++", "clang++"],
      defaultValue: "g++"
    },
    {
      name: "std",
      type: CodeLanguageOptionType.Select,
      values: ["c++03", "c++11", "c++14", "c++17", "c++20", "gnu++03", "gnu++11", "gnu++14", "gnu++17", "gnu++20"],
      defaultValue: "c++11"
    },
    {
      name: "O",
      type: CodeLanguageOptionType.Select,
      values: ["0", "1", "2", "3", "fast"],
      defaultValue: "2"
    },
    {
      name: "m",
      type: CodeLanguageOptionType.Select,
      values: ["64", "32", "x32"],
      defaultValue: "64"
    }
  ],
  [CodeLanguage.C]: [
    {
      name: "compiler",
      type: CodeLanguageOptionType.Select,
      values: ["gcc", "clang"],
      defaultValue: "gcc"
    },
    {
      name: "std",
      type: CodeLanguageOptionType.Select,
      values: ["c89", "c99", "c11", "c17", "gnu89", "gnu99", "gnu11", "gnu17"],
      defaultValue: "c11"
    },
    {
      name: "O",
      type: CodeLanguageOptionType.Select,
      values: ["0", "1", "2", "3", "fast"],
      defaultValue: "2"
    },
    {
      name: "m",
      type: CodeLanguageOptionType.Select,
      values: ["64", "32", "x32"],
      defaultValue: "64"
    }
  ],
  [CodeLanguage.Java]: [],
  [CodeLanguage.Kotlin]: [
    {
      name: "version",
      type: CodeLanguageOptionType.Select,
      values: ["1.5", "1.6", "1.7", "1.8", "1.9"],
      defaultValue: "1.8"
    },
    {
      name: "platform",
      type: CodeLanguageOptionType.Select,
      values: ["jvm"],
      defaultValue: "jvm"
    }
  ],
  [CodeLanguage.Pascal]: [
    {
      name: "optimize",
      type: CodeLanguageOptionType.Select,
      values: ["-", "1", "2", "3", "4"],
      defaultValue: "2"
    }
  ],
  [CodeLanguage.Python]: [
    {
      name: "version",
      type: CodeLanguageOptionType.Select,
      values: ["2.7", "3.9", "3.10"],
      defaultValue: "3.10"
    }
  ],
  [CodeLanguage.Rust]: [
    {
      name: "version",
      type: CodeLanguageOptionType.Select,
      values: ["2015", "2018", "2021"],
      defaultValue: "2021"
    },
    {
      name: "optimize",
      type: CodeLanguageOptionType.Select,
      values: ["0", "1", "2", "3"],
      defaultValue: "3"
    }
  ],
  [CodeLanguage.Swift]: [
    {
      name: "version",
      type: CodeLanguageOptionType.Select,
      values: ["4.2", "5", "6"],
      defaultValue: "5"
    },
    {
      name: "optimize",
      type: CodeLanguageOptionType.Select,
      values: ["Onone", "O", "Ounchecked"],
      defaultValue: "O"
    }
  ],
  [CodeLanguage.Go]: [
    {
      name: "version",
      type: CodeLanguageOptionType.Select,
      values: ["1.x"],
      defaultValue: "1.x"
    }
  ],
  [CodeLanguage.Haskell]: [
    {
      name: "version",
      type: CodeLanguageOptionType.Select,
      values: ["98", "2010"],
      defaultValue: "2010"
    }
  ],
  [CodeLanguage.CSharp]: [
    {
      name: "version",
      type: CodeLanguageOptionType.Select,
      values: ["7.3", "8", "9"],
      defaultValue: "9"
    }
  ],
  [CodeLanguage.FSharp]: []
};

export const getDefaultCompileAndRunOptions = (codeLanguage: CodeLanguage): Record<string, unknown> =>
  Object.fromEntries(compileAndRunOptions[codeLanguage].map(({ name, defaultValue }) => [name, defaultValue]));

export const filterValidCompileAndRunOptions = (
  codeLanguage: CodeLanguage,
  inputOptions: Record<string, unknown>
): Record<string, unknown> =>
  Object.assign(
    {},
    getDefaultCompileAndRunOptions(codeLanguage),
    Object.fromEntries(
      Object.entries(inputOptions || ({} as Record<string, unknown>)).filter(([name, value]) => {
        const option = compileAndRunOptions[codeLanguage].find(option => option.name === name);
        if (!option) return false;
        switch (option.type) {
          case CodeLanguageOptionType.Select:
            return option.values.includes(value as string);
        }
      })
    )
  );

export const getPreferredCodeLanguage = () =>
  (appState.userPreference.code?.defaultLanguage as CodeLanguage) || Object.values(CodeLanguage)[0];

export const getPreferredCompileAndRunOptions = (codeLanguage: CodeLanguage) =>
  codeLanguage === appState.userPreference.code?.defaultLanguage
    ? filterValidCompileAndRunOptions(codeLanguage, appState.userPreference.code?.defaultCompileAndRunOptions)
    : getDefaultCompileAndRunOptions(codeLanguage);
