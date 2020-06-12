import React from "react";
import { Dropdown, Form, Icon, FormSelectProps, DropdownProps, SemanticICONS, Popup } from "semantic-ui-react";

import style from "./TestDataFileSelector.module.less";

import { useIntlMessage } from "@/utils/hooks";
import getFileIcon from "@/utils/getFileIcon";
import formatFileSize from "@/utils/formatFileSize";

interface TestDataFileSelectorProps {
  type: "FormSelect" | "ItemSearchDropdown";
  className?: string;
  iconInputOrOutput?: SemanticICONS;
  label?: FormSelectProps["label"];
  testData: ApiTypes.ProblemFileDto[];
  value: string;
  placeholder: string;
  onChange: (value: string) => void;
}

const TestDataFileSelector: React.FC<TestDataFileSelectorProps> = props => {
  const _ = useIntlMessage();

  const uiProps: FormSelectProps | DropdownProps = {
    className:
      style.fileSelect +
      " " +
      (props.type === "ItemSearchDropdown" ? style.itemSearchDropdown : style.formSelect) +
      (props.className ? " " + props.className : ""),
    label: props.label,
    text:
      props.value && !props.testData.some(file => file.filename === props.value)
        ? ((
            <>
              {props.iconInputOrOutput && <Icon className={style.iconInputOrOutput} name={props.iconInputOrOutput} />}
              <Popup
                trigger={<Icon name="warning sign" className={style.iconFile} />}
                content={_("problem_judge_settings.file_selector.file_not_found_warning")}
                position="top center"
              />
              {props.value}
            </>
          ) as any)
        : undefined,
    placeholder: props.placeholder,
    value: props.value,
    options: props.testData.map(file => ({
      key: file.filename,
      value: file.filename,
      text: (
        <>
          {props.iconInputOrOutput && <Icon className={style.iconInputOrOutput} name={props.iconInputOrOutput} />}
          <Icon name={getFileIcon(file.filename)} className={style.iconFile} />
          <div className={style.filename}>{"\u200E" + file.filename}</div>
          <div className={style.fileSize}>{formatFileSize(file.size, 1)}</div>
        </>
      )
    })),
    onChange: (e, { value }) => props.onChange(value as string)
  };

  return props.type === "ItemSearchDropdown" ? (
    <Dropdown
      item
      selection
      search
      noResultsMessage={_("problem_judge_settings.file_selector.no_matching_files")}
      {...uiProps}
    />
  ) : (
    <Form.Select open={props.testData.length === 0 ? false : undefined} {...(uiProps as FormSelectProps)} />
  );
};

export default TestDataFileSelector;
