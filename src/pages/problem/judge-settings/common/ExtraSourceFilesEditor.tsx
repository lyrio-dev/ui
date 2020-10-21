import React, { useState, useEffect } from "react";
import { Dropdown, Menu, Popup, Button, Form, Input } from "semantic-ui-react";
import { observer } from "mobx-react";
import update from "immutability-helper";
import { v4 as uuid } from "uuid";

import style from "./ExtraSourceFilesEditor.module.less";

import { useLocalizer } from "@/utils/hooks";
import { CodeLanguage } from "@/interfaces/CodeLanguage";
import TestDataFileSelector from "./TestDataFileSelector";
import { JudgeInfoProcessor, EditorComponentProps } from "./interface";

export interface JudgeInfoWithExtraSourceFiles {
  // language => dst => src
  extraSourceFiles?: Partial<Record<CodeLanguage, Record<string, string>>>;
}

type ExtraSourceFilesEditorProps = EditorComponentProps<JudgeInfoWithExtraSourceFiles>;

let ExtraSourceFilesEditor: React.FC<ExtraSourceFilesEditorProps> = props => {
  const _ = useLocalizer("problem_judge_settings");

  // To support inserting empty items, use a local copy for editing
  // XXX: If the judge info's extraSourceFiles is modified outside this componment, it won't get synced
  //      This componment should be unmounted and remounted.
  type ExtraSourceFiles = Partial<Record<CodeLanguage, [string, string, string][]>>; // [uuid, dst, src]
  const [extraSourceFiles, setExtraSourceFiles] = useState<ExtraSourceFiles>(
    Object.fromEntries(
      Object.values(CodeLanguage).map(codeLanguage =>
        props.judgeInfo.extraSourceFiles
          ? [
              codeLanguage,
              Object.entries(props.judgeInfo.extraSourceFiles[codeLanguage] || {}).map(a => [uuid(), ...a])
            ]
          : [codeLanguage, []]
      )
    )
  );

  function updateJudgeInfo(extraSourceFiles: ExtraSourceFiles, isNotByUser?: boolean) {
    props.onUpdateJudgeInfo({
      extraSourceFiles: Object.fromEntries(
        Object.values(CodeLanguage)
          .map(codeLanguage =>
            extraSourceFiles[codeLanguage].length > 0
              ? [codeLanguage, Object.fromEntries(extraSourceFiles[codeLanguage].map(a => a.slice(1)))]
              : null
          )
          .filter(x => x)
      )
    });
  }
  useEffect(() => props.judgeInfo.extraSourceFiles && updateJudgeInfo(extraSourceFiles, true), []);

  // Update both a local copy and judge info
  function updateExtraSourceFiles(newExtraSourceFiles: ExtraSourceFiles) {
    setExtraSourceFiles(newExtraSourceFiles);
    updateJudgeInfo(newExtraSourceFiles);
  }

  // Preverse the local copy
  function onToggleExtraSourceFiles() {
    if (props.pending) return;

    if (!props.judgeInfo.extraSourceFiles) {
      updateJudgeInfo(extraSourceFiles);
    } else {
      props.onUpdateJudgeInfo({ extraSourceFiles: null });
    }
  }

  function updateExtraSourceFile(
    codeLanguage: CodeLanguage,
    operation: "ADD" | "DEL" | "UPDATE",
    i?: number,
    newValue?: { src?: string; dst?: string }
  ) {
    if (operation === "ADD") {
      updateExtraSourceFiles(
        update(extraSourceFiles, {
          [codeLanguage]: {
            $push: [[uuid(), "", ""]]
          }
        })
      );
    } else if (operation === "DEL") {
      updateExtraSourceFiles(
        update(extraSourceFiles, {
          [codeLanguage]: {
            $splice: [[i, 1]]
          }
        })
      );
    } else {
      const item = extraSourceFiles[codeLanguage][i];
      const newDst = newValue.dst == null ? item[1] : newValue.dst;
      const newSrc = newValue.src == null ? item[2] : newValue.src;
      updateExtraSourceFiles(
        update(extraSourceFiles, {
          [codeLanguage]: {
            [i]: {
              $set: [item[0], newDst, newSrc]
            }
          }
        })
      );
    }
  }

  return (
    <div>
      <Form>
        <Form.Checkbox
          checked={!!props.judgeInfo.extraSourceFiles}
          label={_(".extra_source_files.option")}
          onChange={() => onToggleExtraSourceFiles()}
        />
        {props.judgeInfo.extraSourceFiles && (
          <>
            <Menu className={style.menu + " " + style.menuHeader + " " + style.color_6} attached="top">
              <Menu.Item className={style.itemTitle}>
                <strong>{_(".extra_source_files.title")}</strong>
              </Menu.Item>
              <Menu.Menu position="right">
                <Dropdown item icon="plus" className={`icon ${style.itemWithIcon}`}>
                  <Dropdown.Menu>
                    {Object.values(CodeLanguage).map(codeLanguage => (
                      <Dropdown.Item
                        key={codeLanguage}
                        text={_(`code_language.${codeLanguage}.name`)}
                        onClick={() => updateExtraSourceFile(codeLanguage, "ADD")}
                      />
                    ))}
                  </Dropdown.Menu>
                </Dropdown>
              </Menu.Menu>
            </Menu>
            {extraSourceFiles &&
              Object.entries(extraSourceFiles).map(([codeLanguage, files]) =>
                files.map(([uuid, dst, src], i) => (
                  <Menu
                    className={style.extraSourceFilesItem}
                    key={uuid}
                    attached={i == files.length - 1 ? "bottom" : (true as any)}
                  >
                    <Menu.Item
                      className={style.itemTitle + " " + style.language}
                      style={
                        i == 0
                          ? {
                              height: 41 * files.length - 1
                            }
                          : {
                              visibility: "hidden"
                            }
                      }
                    >
                      {_(`code_language.${codeLanguage}.name`)}
                    </Menu.Item>
                    <TestDataFileSelector
                      type="ItemSearchDropdown"
                      className={style.dropdown}
                      testData={props.testData}
                      placeholder={_(".extra_source_files.src")}
                      value={src}
                      onChange={value => updateExtraSourceFile(codeLanguage as any, "UPDATE", i, { src: value })}
                    />
                    <Menu.Item className={style.input}>
                      <Input
                        icon="long arrow alternate right"
                        iconPosition="left"
                        transparent
                        placeholder={_(".extra_source_files.dst")}
                        value={dst}
                        onChange={(e, { value }) =>
                          updateExtraSourceFile(codeLanguage as any, "UPDATE", i, { dst: value })
                        }
                      />
                    </Menu.Item>
                    <Menu.Menu position="right">
                      <Popup
                        trigger={
                          <Menu.Item
                            className={`icon ${style.itemWithIcon}`}
                            icon="delete"
                            title={_(".extra_source_files.delete")}
                          />
                        }
                        content={
                          <Button
                            negative
                            content={_(".extra_source_files.confirm_delete")}
                            onClick={() => updateExtraSourceFile(codeLanguage as any, "DEL", i)}
                          />
                        }
                        on="click"
                        position="top center"
                      />
                    </Menu.Menu>
                  </Menu>
                ))
              )}
          </>
        )}
      </Form>
    </div>
  );
};

ExtraSourceFilesEditor = observer(ExtraSourceFilesEditor);

const judgeInfoProcessor: JudgeInfoProcessor<JudgeInfoWithExtraSourceFiles> = {
  parseJudgeInfo(raw) {
    return {
      extraSourceFiles: raw.extraSourceFiles
    };
  },
  normalizeJudgeInfo(judgeInfo) {
    if (!judgeInfo.extraSourceFiles) delete judgeInfo.extraSourceFiles;
  }
};

export default Object.assign(ExtraSourceFilesEditor, judgeInfoProcessor);
