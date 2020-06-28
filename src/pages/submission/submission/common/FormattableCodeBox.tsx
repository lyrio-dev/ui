import React, { useRef, useState } from "react";
import { Button } from "semantic-ui-react";

import style from "./FormattableCodeBox.module.less";

import { CodeLanguage } from "@/interfaces/CodeLanguage";
import { useIntlMessage } from "@/utils/hooks";
import { appState } from "@/appState";
import * as CodeFormatter from "@/utils/CodeFormatter";
import toast from "@/utils/toast";
import { HighlightedCodeBox } from "@/components/CodeBox";

interface FormattableCodeBoxProps {
  className?: string;
  title?: React.ReactNode;
  code: string;
  language: CodeLanguage;
}

const FormattableCodeBox = React.forwardRef<HTMLPreElement, FormattableCodeBoxProps>((props, ref) => {
  const _ = useIntlMessage("submission");

  const defaultFormatted = !appState.userPreference.doNotFormatCodeByDefault;
  const options = appState.userPreference.codeFormatterOptions || CodeFormatter.defaultOptions;

  const languageFormattable = CodeFormatter.isLanguageSupported(props.language);

  const unformattedCode = props.code;
  const refFormattedCode = useRef<string>(null);

  const [formatted, setFormatted] = useState(defaultFormatted && languageFormattable);

  // Lazy
  if (formatted && !refFormattedCode.current) {
    const [success, result] = CodeFormatter.format(unformattedCode, props.language, options);
    if (!success) {
      toast.error(_(`.failed_to_format`, { error: result }));
      setFormatted(false);
    } else refFormattedCode.current = result;
  }

  return (
    <HighlightedCodeBox
      className={props.className}
      title={props.title}
      language={props.language}
      code={formatted && refFormattedCode.current != null ? refFormattedCode.current : unformattedCode}
      ref={ref}
    >
      {languageFormattable && (
        <Button
          className={style.formatCodeButton}
          content={!formatted ? _(".format_code") : _(".show_original_code")}
          onClick={() => setFormatted(!formatted)}
        />
      )}
    </HighlightedCodeBox>
  );
});

export default FormattableCodeBox;
