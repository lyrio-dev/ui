import { appState } from "@/appState";

export enum CodeLanguage {
  Cpp = "cpp"
}

// For UI
export enum CodeLanguageOptionType {
  Select = "Select"
  // Input = "Input",
  // Checkbox = "Checkbox",
  // Radio = "Radio"
}

export interface CodeLanguageOption {
  name: string;
  type: CodeLanguageOptionType;
  values: string[]; // string[] | undefined
  defaultValue: string; // string | boolean
}

const codeLanguageExtensions: Record<CodeLanguage, string[]> = {
  [CodeLanguage.Cpp]: [".cpp", ".cc"]
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
      values: ["c++03", "c++11", "c++14", "c++17"],
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
  ]
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
