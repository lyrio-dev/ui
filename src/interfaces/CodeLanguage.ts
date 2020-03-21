export enum CodeLanguage {
  CPP = "cpp"
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

export const codeLanguageOptions: Record<CodeLanguage, CodeLanguageOption[]> = {
  [CodeLanguage.CPP]: [
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

export const getDefaultCodeLanguageOptions = (codeLanguage: CodeLanguage): Record<string, unknown> =>
  Object.fromEntries(codeLanguageOptions[codeLanguage].map(({ name, defaultValue }) => [name, defaultValue]));

export const filterValidLanguageOptions = (
  codeLanguage: CodeLanguage,
  inputOptions: Record<string, unknown>
): Record<string, unknown> =>
  Object.assign(
    {},
    getDefaultCodeLanguageOptions(codeLanguage),
    Object.fromEntries(
      Object.entries(inputOptions || ({} as Record<string, unknown>)).filter(([name, value]) => {
        const option = codeLanguageOptions[codeLanguage].find(option => option.name === name);
        if (!option) return false;
        switch (option.type) {
          case CodeLanguageOptionType.Select:
            return option.values.includes(value as string);
        }
      })
    )
  );
