export function detectTestcasesByMatchingInputToOutput(testData: ApiTypes.ProblemFileDto[], outputOptional?: boolean) {
  return testData
    .filter(file => file.filename.toLowerCase().endsWith(".in"))
    .map<[ApiTypes.ProblemFileDto, ApiTypes.ProblemFileDto, number[]]>(input => [
      input,
      testData.find(file =>
        [".out", ".ans"]
          .map(ext => input.filename.slice(0, -3).toLowerCase() + ext)
          .includes(file.filename.toLowerCase())
      ),
      (input.filename.match(/\d+/g) || []).map(Number)
    ])
    .filter(([, outputFile]) => (outputOptional ? true : outputFile))
    .sort(([inputA, , numbersA], [inputB, , numbersB]) => {
      const firstNonEqualIndex = [...Array(Math.max(numbersA.length, numbersB.length)).keys()].findIndex(
        i => numbersA[i] !== numbersB[i]
      );
      return firstNonEqualIndex === -1
        ? inputA.filename < inputB.filename
          ? -1
          : 1
        : numbersA[firstNonEqualIndex] - numbersB[firstNonEqualIndex];
    })
    .map(([input, output]) => ({
      inputFile: input.filename,
      outputFile: output?.filename
    }));
}

export function detectTestcasesByMatchingOutputToInput(testData: ApiTypes.ProblemFileDto[], inputOptional?: boolean) {
  return testData
    .filter(file => ((str: string) => str.endsWith(".out") || str.endsWith(".ans"))(file.filename.toLowerCase()))
    .map<[ApiTypes.ProblemFileDto, ApiTypes.ProblemFileDto, number[]]>(input => [
      input,
      testData.find(file => `${input.filename.slice(0, -4).toLowerCase()}.in` === file.filename.toLowerCase()),
      (input.filename.match(/\d+/g) || []).map(Number)
    ])
    .filter(([, inputFile]) => (inputOptional ? true : inputFile))
    .sort(([outputA, , numbersA], [outputB, , numbersB]) => {
      const firstNonEqualIndex = [...Array(Math.max(numbersA.length, numbersB.length)).keys()].findIndex(
        i => numbersA[i] !== numbersB[i]
      );
      return firstNonEqualIndex === -1
        ? outputA.filename < outputB.filename
          ? -1
          : 1
        : numbersA[firstNonEqualIndex] - numbersB[firstNonEqualIndex];
    })
    .map(([output, input]) => ({
      inputFile: input?.filename,
      outputFile: output.filename
    }));
}
