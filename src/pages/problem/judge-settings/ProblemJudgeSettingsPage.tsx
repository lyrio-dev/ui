import React, { useEffect, useState, useRef, useMemo } from "react";
import {
  Dropdown,
  Grid,
  Icon,
  Header,
  Menu,
  Popup,
  Button,
  Form,
  Message,
  Input,
  Ref,
  Table,
  Segment,
  Checkbox
} from "semantic-ui-react";
import { useNavigation } from "react-navi";
import { observer } from "mobx-react";
import yaml from "js-yaml";
import { v4 as uuid } from "uuid";
import update from "immutability-helper";
import lodashClonedeep from "lodash.clonedeep";
import { FormattedMessage } from "react-intl";

import style from "./ProblemJudgeSettingsPage.module.less";

import { ProblemApi } from "@/api";
import { appState } from "@/appState";
import { useIntlMessage, useDialog, useConfirmUnload } from "@/utils/hooks";
import toast from "@/utils/toast";
import getFileIcon from "@/utils/getFileIcon";
import formatFileSize from "@/utils/formatFileSize";
import CodeEditor from "@/components/LazyCodeEditor";
import { HighlightedCodeBox } from "@/components/CodeBox";
import { defineRoute, RouteError } from "@/AppRouter";
import {
  CodeLanguage,
  filterValidLanguageOptions,
  getPreferredCodeLanguageOptions,
  codeLanguageOptions,
  CodeLanguageOptionType,
  checkCodeFileExtension
} from "@/interfaces/CodeLanguage";

async function fetchData(idType: "id" | "displayId", id: number) {
  const { requestError, response } = await ProblemApi.getProblem({
    [idType]: id,
    judgeInfo: true,
    testData: true,
    permissionOfCurrentUser: ["MODIFY"]
  });

  if (requestError) throw new RouteError(requestError, { showRefresh: true, showBack: true });
  else if (response.error)
    throw new RouteError(<FormattedMessage id={`problem_judge_settings.error.${response.error}`} />);

  return response;
}

function getColor(uuid: string) {
  const hex = uuid.split("-").join(""),
    COLOR_COUNT = 13;
  let x = 0;
  for (let i = 0; i < hex.length; i += 4) {
    x ^= parseInt(hex.substr(i, 4), 16);
  }
  return x % COLOR_COUNT;
}

// TODO: Separate code of different problem types to different files

interface Testcase {
  uuid: string;
  inputFilename: string;
  outputFilename: string;
  timeLimit?: number;
  memoryLimit?: number;
  percentagePoints?: number;
}

enum SubtaskScoringType {
  Sum = "Sum",
  GroupMin = "GroupMin",
  GroupMul = "GroupMul"
}

interface Subtask {
  uuid: string;
  timeLimit?: number;
  memoryLimit?: number;
  testcases: Testcase[];
  scoringType: SubtaskScoringType;
  percentagePoints?: number;
  dependencies: number[];
}

interface CheckerTypeIntegers {
  type: "integers";
}

interface CheckerTypeFloats {
  type: "floats";
  precision: number;
}

interface CheckerTypeLines {
  type: "lines";
  caseSensitive: boolean;
}

interface CheckerTypeBinary {
  type: "binary";
}

interface CheckerTypeCustom {
  type: "custom";
  interface: string;
  language: CodeLanguage;
  languageOptions: Record<string, unknown>;
  filename: string;
}

interface JudgeInfo {
  timeLimit: number;
  memoryLimit: number;
  fileIo?: {
    inputFilename: string;
    outputFilename: string;
  };
  runSamples: boolean;
  subtasks: Subtask[];
  checker: CheckerTypeIntegers | CheckerTypeFloats | CheckerTypeLines | CheckerTypeBinary | CheckerTypeCustom;
}

interface SubtaskEditorTastcaseItemProps {
  testDataFiles: ProblemFile[];
  testcaseIndex: number;
  testcaseCount: number;
  testcase: Testcase;

  defaultPercentagePoints: number;
  defaultTimeLimit: number;
  defaultMemoryLimit: number;

  onUpdate: (updateInfo: Partial<Testcase>) => void;
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onAddTestcaseBefore: () => void;
  onAddTestcaseAfter: () => void;
}

let SubtaskEditorTastcaseItem: React.FC<SubtaskEditorTastcaseItemProps> = props => {
  const _ = useIntlMessage();

  const refOptionsButton = useRef(null);

  return (
    <>
      <Menu
        className={
          style.menu +
          " " +
          style.menuTestcase +
          " " +
          style.menuTestcaseFirstLine +
          " " +
          style["color_" + getColor(props.testcase.uuid)]
        }
        attached
      >
        <Menu.Item className={style.itemTestcaseTitle}>#{props.testcaseIndex + 1}</Menu.Item>
        <Dropdown
          className={style.itemSearchDropdown + " " + style.fileSelect}
          item
          selection
          search
          noResultsMessage={_("problem_judge_settings.testcase.no_files")}
          text={
            props.testcase.inputFilename &&
            !props.testDataFiles.some(file => file.filename === props.testcase.inputFilename)
              ? ((
                  <>
                    <Icon className={style.iconInputOrOutput} name="sign in" />
                    {props.testcase.inputFilename}
                  </>
                ) as any)
              : undefined
          }
          placeholder={_("problem_judge_settings.testcase.input_file")}
          value={props.testcase.inputFilename}
          options={props.testDataFiles.map(file => ({
            key: file.filename,
            value: file.filename,
            text: (
              <>
                <Icon className={style.iconInputOrOutput} name="sign in" />
                <Icon name={getFileIcon(file.filename)} />
                <div className={style.filename}>{file.filename}</div>
                <div className={style.fileSize}>{formatFileSize(file.size, 1)}</div>
              </>
            )
          }))}
          onChange={(e, { value }) => props.onUpdate({ inputFilename: value as string })}
        />
        <Menu.Menu position="right">
          <Menu.Item className={style.itemTestcaseTimeLimit}>
            <Input
              transparent
              placeholder={props.defaultTimeLimit}
              value={props.testcase.timeLimit == null ? "" : props.testcase.timeLimit}
              icon="clock"
              iconPosition="left"
              onChange={(e, { value }) =>
                (value === "" || (Number.isSafeInteger(Number(value)) && Number(value) >= 0)) &&
                props.onUpdate({ timeLimit: value === "" ? null : Number(value) })
              }
            />
          </Menu.Item>
          <Menu.Item className={style.itemLabel}>ms</Menu.Item>
          <Dropdown item icon="plus" className={`icon ${style.itemWithIcon}`}>
            <Dropdown.Menu>
              <Dropdown.Item
                icon="angle double up"
                text={_("problem_judge_settings.testcase_add.before")}
                onClick={() => props.onAddTestcaseBefore()}
              />
              <Dropdown.Item
                icon="angle double down"
                text={_("problem_judge_settings.testcase_add.after")}
                onClick={() => props.onAddTestcaseAfter()}
              />
            </Dropdown.Menu>
          </Dropdown>
        </Menu.Menu>
      </Menu>
      <Menu
        className={
          style.menu +
          " " +
          style.menuTestcase +
          " " +
          style.menuTestcaseSecondLine +
          " " +
          style["color_" + getColor(props.testcase.uuid)]
        }
        attached
      >
        <Menu.Item className={style.itemTestcaseScore}>
          <Input
            transparent
            placeholder={props.defaultPercentagePoints}
            value={props.testcase.percentagePoints == null ? "" : props.testcase.percentagePoints}
            icon="percent"
            onChange={(e, { value }) =>
              (value === "" || (Number.isSafeInteger(Number(value)) && Number(value) >= 0 && Number(value) <= 100)) &&
              props.onUpdate({ percentagePoints: value === "" ? null : Number(value) })
            }
          />
        </Menu.Item>
        <Dropdown
          className={style.itemSearchDropdown + " " + style.fileSelect}
          item
          selection
          search
          noResultsMessage={_("problem_judge_settings.testcase.no_files")}
          text={
            props.testcase.outputFilename &&
            !props.testDataFiles.some(file => file.filename === props.testcase.outputFilename)
              ? ((
                  <>
                    <Icon className={style.iconInputOrOutput} name="sign out" />
                    {props.testcase.outputFilename}
                  </>
                ) as any)
              : undefined
          }
          placeholder={_("problem_judge_settings.testcase.output_file")}
          value={props.testcase.outputFilename}
          options={props.testDataFiles.map(file => ({
            key: file.filename,
            value: file.filename,
            text: (
              <>
                <Icon className={style.iconInputOrOutput} name="sign out" />
                <Icon name={getFileIcon(file.filename)} />
                <div className={style.filename}>{file.filename}</div>
                <div className={style.fileSize}>{formatFileSize(file.size, 1)}</div>
              </>
            )
          }))}
          onChange={(e, { value }) => props.onUpdate({ outputFilename: value as string })}
        />
        <Menu.Menu position="right">
          <Menu.Item className={style.itemTestcaseMemoryLimit}>
            <Input
              transparent
              placeholder={props.defaultMemoryLimit}
              value={props.testcase.memoryLimit == null ? "" : props.testcase.memoryLimit}
              icon="microchip"
              iconPosition="left"
              onChange={(e, { value }) =>
                (value === "" || (Number.isSafeInteger(Number(value)) && Number(value) >= 0)) &&
                props.onUpdate({ memoryLimit: value === "" ? null : Number(value) })
              }
            />
          </Menu.Item>
          <Menu.Item className={style.itemLabel}>MiB</Menu.Item>
          <Ref innerRef={refOptionsButton}>
            <Dropdown item icon="bars" className={`icon ${style.itemWithIcon}`}>
              <Dropdown.Menu>
                <Dropdown.Item
                  icon="angle double up"
                  text={_("problem_judge_settings.testcase_options.move_up")}
                  onClick={() => props.onMoveUp()}
                  disabled={props.testcaseIndex === 0}
                />
                <Dropdown.Item
                  icon="angle double down"
                  text={_("problem_judge_settings.testcase_options.move_down")}
                  onClick={() => props.onMoveDown()}
                  disabled={props.testcaseIndex === props.testcaseCount - 1}
                />
                <Popup
                  trigger={<Dropdown.Item icon="delete" text={_("problem_judge_settings.testcase_options.delete")} />}
                  context={refOptionsButton}
                  content={
                    <Button
                      negative
                      content={_("problem_judge_settings.testcase_options.confirm_delete")}
                      onClick={() => props.onDelete()}
                    />
                  }
                  on="click"
                  position="top center"
                />
              </Dropdown.Menu>
            </Dropdown>
          </Ref>
        </Menu.Menu>
      </Menu>
    </>
  );
};

SubtaskEditorTastcaseItem = observer(SubtaskEditorTastcaseItem);

interface SubtaskEditorProps {
  testDataFiles: ProblemFile[];
  subtaskIndex: number;
  subtaskCount: number;
  subtask: Subtask;

  defaultPercentagePoints: number;
  defaultTimeLimit: number;
  defaultMemoryLimit: number;

  onUpdate: (updateInfo: Partial<Subtask>) => void;
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onAddSubtaskBefore: () => void;
  onAddSubtaskAfter: () => void;

  onUpdateTestcase: (testcaseIndex: number, updateInfo: Partial<Testcase>) => void;
  onDeleteTestcase: (testcaseIndex: number) => void;
  onMoveTestcaseUp: (testcaseIndex: number) => void;
  onMoveTestcaseDown: (testcaseIndex: number) => void;
  onAddTestcase: (testcaseIndex: number) => void;
}

let SubtaskEditor: React.FC<SubtaskEditorProps> = props => {
  const _ = useIntlMessage();

  const [testcasesExpanded, setTestcasesExpanded] = useState(props.subtaskCount === 1);

  const refOptionsButton = useRef(null);

  const sumSpecfiedPercentagePoints = props.subtask.testcases
    .map(testcase => testcase.percentagePoints)
    .filter(x => x != null)
    .reduce((sum, x) => sum + x, 0);
  const countUnspecfiedPercentagePoints = props.subtask.testcases.filter(testcase => testcase.percentagePoints == null)
    .length;
  const defaultPercentagePoints =
    (sumSpecfiedPercentagePoints > 100
      ? 0
      : Math.round((100 - sumSpecfiedPercentagePoints) / countUnspecfiedPercentagePoints)) || 0;

  const [autoAddTestcaseRegexForInput, setAutoAddTestcaseRegexForInput] = useState("");
  const [autoAddTestcaseRegexForOutput, setAutoAddTestcaseRegexForOutput] = useState("");
  const [autoAddTestcaseErrorCompileForInput, setAutoAddTestcaseErrorCompileForInput] = useState("");
  const [autoAddTestcaseErrorCompileForOutput, setAutoAddTestcaseErrorCompileForOutput] = useState("");
  const [autoAddTestcaseErrorMatching, setAutoAddTestcaseErrorMatching] = useState("");
  const [autoAddTestcaseMatchResult, setAutoAddTestcaseMatchResult] = useState<[string, string][]>([]);

  // If the user only input one of the regexes, generate the default for another automatically
  function getDefaultRegexForOutput(regexForInput: string) {
    if (!regexForInput) return "^(.*?)\\.(?:out|ans|OUT|ANS)$";

    let re = regexForInput;
    re = re.split("input").join("output");
    re = re.split("INPUT").join("OUTPUT");
    if (re.endsWith(".in")) re = re.substring(0, re.length - 3) + ".(?:out|ans)";
    if (re.endsWith(".IN")) re = re.substring(0, re.length - 3) + ".(?:OUT|ANS)";
    if (re.endsWith(".in$")) re = re.substring(0, re.length - 4) + ".(?:out|ans)$";
    if (re.endsWith(".IN$")) re = re.substring(0, re.length - 4) + ".(?:OUT|ANS)$";
    return re === regexForInput ? "" : re;
  }

  function getDefaultRegexForInput(regexForOutput: string) {
    if (!regexForOutput) return "^(.*?)\\.(?:in|IN)$";

    let re = regexForOutput;
    re = re.split("output").join("input");
    re = re.split("OUTPUT").join("INPUT");
    if (re.endsWith(".out") || re.endsWith(".ans")) re = re.substring(0, re.length - 4) + ".in";
    if (re.endsWith(".OUT") || re.endsWith(".ANS")) re = re.substring(0, re.length - 4) + ".IN";
    if (re.endsWith(".out$") || re.endsWith(".ans$")) re = re.substring(0, re.length - 5) + ".in";
    if (re.endsWith(".OUT$") || re.endsWith(".ANS$")) re = re.substring(0, re.length - 5) + ".IN";
    return re === regexForOutput ? "" : re;
  }

  // Pass the new value via argument
  // Because the states' values are not being updated immediately after setState()
  function autoAddTestcaseDoMatching(input: string, output: string) {
    const defaultInput = getDefaultRegexForInput(output),
      defaultOutput = getDefaultRegexForOutput(input);
    let inputIsDefault = false,
      outputIsDefault = false;

    if (!input) {
      input = defaultInput;
      inputIsDefault = true;
    }

    if (!output) {
      output = defaultOutput;
      outputIsDefault = true;
    }

    if (!input || !output) {
      setAutoAddTestcaseErrorCompileForInput("");
      setAutoAddTestcaseErrorCompileForOutput("");
      setAutoAddTestcaseErrorMatching("");
      setAutoAddTestcaseMatchResult([]);
      return;
    }

    let regexForInput: RegExp, regexForOutput: RegExp;
    try {
      regexForInput = new RegExp(input);
      setAutoAddTestcaseErrorCompileForInput("");
    } catch (e) {
      // If the regex is auto generated, do not show error message
      if (!inputIsDefault) {
        setAutoAddTestcaseErrorCompileForInput(
          _("problem_judge_settings.auto_add_testcases.can_not_compile_for_input", { message: e.message })
        );
      } else setAutoAddTestcaseErrorCompileForInput("");
      setAutoAddTestcaseErrorMatching("");
      setAutoAddTestcaseMatchResult([]);
    }
    try {
      regexForOutput = new RegExp(output);
      setAutoAddTestcaseErrorCompileForOutput("");
    } catch (e) {
      // If the regex is auto generated, do not show error message
      if (!outputIsDefault) {
        setAutoAddTestcaseErrorCompileForOutput(
          _("problem_judge_settings.auto_add_testcases.can_not_compile_for_output", { message: e.message })
        );
      } else setAutoAddTestcaseErrorCompileForOutput("");
      setAutoAddTestcaseErrorMatching("");
      setAutoAddTestcaseMatchResult([]);
    }

    if (regexForInput == null || regexForOutput == null) return;

    const matchesForInput = props.testDataFiles.map(file => file.filename.match(regexForInput)).filter(x => x);
    const matchesForOutput = props.testDataFiles.map(file => file.filename.match(regexForOutput)).filter(x => x);
    const result: [string, string][] = [];
    if (matchesForInput.length > 0 && matchesForOutput.length > 0) {
      const groupCount = matchesForInput[0].length - 1;
      if (groupCount !== matchesForOutput[0].length - 1) {
        setAutoAddTestcaseErrorMatching(
          _("problem_judge_settings.auto_add_testcases.capturing_groups_do_not_match", {
            countInInputFilename: String(groupCount),
            countInOutputFilename: String(matchesForOutput[0].length - 1)
          })
        );
      } else if (groupCount === 0) {
        setAutoAddTestcaseErrorMatching(_("problem_judge_settings.auto_add_testcases.no_capturing_groups"));
      } else {
        while (matchesForInput.length !== 0) {
          const currentMatchForInput = matchesForInput.shift();

          // Find the matching output filename with the current input filename
          for (let i = 0; i < matchesForOutput.length; i++) {
            let foundNonMatch = false;
            for (let j = 1; j <= groupCount; j++) {
              if (currentMatchForInput[j] !== matchesForOutput[i][j]) {
                foundNonMatch = true;
                break;
              }
            }

            if (!foundNonMatch) {
              result.push([currentMatchForInput.input, matchesForOutput[i].input]);
              matchesForOutput.splice(i, 1);
            }
          }
        }

        setAutoAddTestcaseMatchResult(result);
      }
    }
  }

  function getNewTestcases(matchResult: [string, string][]): Testcase[] {
    return matchResult.map(m => ({
      uuid: uuid(),
      inputFilename: m[0],
      outputFilename: m[1]
    }));
  }

  function doReplace() {
    props.onUpdate({
      testcases: getNewTestcases(autoAddTestcaseMatchResult)
    });
    setTestcasesExpanded(true);
    autoAddTestcaseDialog.close();
  }

  const autoAddTestcaseError = [
    autoAddTestcaseErrorCompileForInput,
    autoAddTestcaseErrorCompileForOutput,
    autoAddTestcaseErrorMatching
  ]
    .filter(x => x)
    .join("\n");
  const autoAddTestcaseDialog = useDialog(
    {},
    <Header
      icon="magic"
      className={style.dialogHeader}
      content={
        <>
          {_("problem_judge_settings.auto_add_testcases.auto_add_testcases")}
          <div className={style.dialogHeaderInfo}>
            {_("problem_judge_settings.auto_add_testcases.subtask") + " #" + (props.subtaskIndex + 1)}
          </div>
        </>
      }
    />,
    (() => {
      const defaultInput = getDefaultRegexForInput(autoAddTestcaseRegexForOutput),
        defaultOutput = getDefaultRegexForOutput(autoAddTestcaseRegexForInput);
      const input = autoAddTestcaseRegexForInput || defaultInput,
        output = autoAddTestcaseRegexForOutput || defaultOutput;

      return (
        <>
          <p className={style.autoAddTestcasesHelp}>{_("problem_judge_settings.auto_add_testcases.help")}</p>
          <Form>
            <Form.Group>
              <Form.Field width={8}>
                <label>{_("problem_judge_settings.auto_add_testcases.input_file")}</label>
                <Input
                  placeholder={defaultInput}
                  value={autoAddTestcaseRegexForInput}
                  icon="sign in"
                  iconPosition="left"
                  onChange={(e, { value }) => {
                    setAutoAddTestcaseRegexForInput(value);
                    autoAddTestcaseDoMatching(value, autoAddTestcaseRegexForOutput);
                  }}
                />
              </Form.Field>
              <Form.Field width={8}>
                <label>{_("problem_judge_settings.auto_add_testcases.output_file")}</label>
                <Input
                  placeholder={defaultOutput}
                  value={autoAddTestcaseRegexForOutput}
                  icon="sign out"
                  iconPosition="left"
                  onChange={(e, { value }) => {
                    setAutoAddTestcaseRegexForOutput(value);
                    autoAddTestcaseDoMatching(autoAddTestcaseRegexForInput, value);
                  }}
                />
              </Form.Field>
            </Form.Group>
          </Form>
          {autoAddTestcaseError ? (
            <Message className={style.dialogMessage} error content={autoAddTestcaseError} />
          ) : (
            <Message
              className={style.dialogMessage}
              success={autoAddTestcaseMatchResult.length > 0}
              info={autoAddTestcaseMatchResult.length === 0}
              content={
                !input || !output
                  ? _("problem_judge_settings.auto_add_testcases.empty_regex")
                  : _("problem_judge_settings.auto_add_testcases.matches_count", {
                      count: autoAddTestcaseMatchResult.length.toString()
                    })
              }
            />
          )}
          {autoAddTestcaseMatchResult.length > 0 && (
            <Table textAlign="center" compact="very" celled unstackable>
              <Table.Header>
                <Table.Row>
                  {[1, 2].map(i => (
                    <React.Fragment key={i}>
                      <Table.HeaderCell width={1}>#</Table.HeaderCell>
                      <Table.HeaderCell width={3}>
                        {_("problem_judge_settings.auto_add_testcases.column_input_file")}
                      </Table.HeaderCell>
                      <Table.HeaderCell width={3}>
                        {_("problem_judge_settings.auto_add_testcases.column_output_file")}
                      </Table.HeaderCell>
                    </React.Fragment>
                  ))}
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {[...Array(Math.ceil(autoAddTestcaseMatchResult.length / 2))]
                  .map((_, i, a) => [i, a.length + i])
                  .map(ids => (
                    <Table.Row>
                      {ids.map(id =>
                        id >= autoAddTestcaseMatchResult.length ? null : (
                          <React.Fragment key={id}>
                            <Table.Cell>
                              <strong>{id + 1}</strong>
                            </Table.Cell>
                            <Table.Cell>{autoAddTestcaseMatchResult[id][0]}</Table.Cell>
                            <Table.Cell>{autoAddTestcaseMatchResult[id][1]}</Table.Cell>
                          </React.Fragment>
                        )
                      )}
                    </Table.Row>
                  ))}
              </Table.Body>
            </Table>
          )}
        </>
      );
    })(),
    <>
      <Button
        content={_("problem_judge_settings.auto_add_testcases.close")}
        onClick={() => autoAddTestcaseDialog.close()}
      />
      <Button
        positive
        disabled={autoAddTestcaseMatchResult.length === 0}
        content={_("problem_judge_settings.auto_add_testcases.append")}
        onClick={() => {
          const current = props.subtask.testcases.map(testcase => [testcase.inputFilename, testcase.outputFilename]);
          const toAppend = autoAddTestcaseMatchResult.filter(
            result => !current.some(testcase => result[0] === testcase[0] && result[1] === testcase[1])
          );
          props.onUpdate({
            testcases: props.subtask.testcases.concat(getNewTestcases(toAppend))
          });
          setTestcasesExpanded(true);
          autoAddTestcaseDialog.close();
        }}
      />
      <Popup
        trigger={
          <Button
            primary
            disabled={autoAddTestcaseMatchResult.length === 0}
            content={_("problem_judge_settings.auto_add_testcases.replace")}
            onClick={() => props.subtask.testcases.length === 0 && doReplace()}
          />
        }
        // It's safe to replace if no testcases at present, don't confirm
        disabled={props.subtask.testcases.length === 0}
        content={
          <Button content={_("problem_judge_settings.auto_add_testcases.confirm_replace")} onClick={doReplace} />
        }
        on="click"
        position="top center"
      />
    </>
  );

  function openAutoAddTestcasesDialog() {
    autoAddTestcaseDialog.open();
    autoAddTestcaseDoMatching(autoAddTestcaseRegexForInput, autoAddTestcaseRegexForOutput);
  }

  function sortTestcases() {
    const temp: [number[], Testcase][] = props.subtask.testcases.map(testcase => [
      (testcase.inputFilename || testcase.outputFilename).match(/\d+/g).map(parseInt),
      testcase
    ]);
    temp.sort(([a], [b]) => {
      if (a.length != b.length) return a.length - b.length;
      for (let i = 0; i < a.length; i++) if (a[i] != b[i]) return a[i] - b[i];
      return 0;
    });

    props.onUpdate({
      testcases: temp.map(([numbers, testcase]) => testcase)
    });
  }

  return (
    <>
      {autoAddTestcaseDialog.element}
      <Menu
        attached="top"
        className={style.menu + " " + style.menuSubtaskHeader + " " + style["color_" + getColor(props.subtask.uuid)]}
      >
        <Menu.Item className={style.itemTitle}>
          <strong>
            {props.subtaskCount === 1 ? (
              _("problem_judge_settings.single_subtask")
            ) : (
              <>
                {_("problem_judge_settings.subtask")}
                &nbsp; #{props.subtaskIndex + 1}
              </>
            )}
          </strong>
          <div className={style.subtaskTitleTestcasesCount}>
            {appState.windowWidth >= 100
              ? _("problem_judge_settings.subtask_testcases_count", {
                  count: props.subtask.testcases.length.toString()
                })
              : props.subtask.testcases.length}
          </div>
        </Menu.Item>
        <Menu.Menu position="right">
          <Menu.Item className={style.itemSubtaskTimeLimit}>
            <Input
              transparent
              placeholder={props.defaultTimeLimit}
              value={props.subtask.timeLimit == null ? "" : props.subtask.timeLimit}
              icon="clock"
              iconPosition="left"
              onChange={(e, { value }) =>
                (value === "" || (Number.isSafeInteger(Number(value)) && Number(value) >= 0)) &&
                props.onUpdate({ timeLimit: value === "" ? null : Number(value) })
              }
            />
          </Menu.Item>
          <Menu.Item className={style.itemLabel}>ms</Menu.Item>
          <Menu.Item className={style.itemSubtaskMemoryLimit}>
            <Input
              transparent
              placeholder={props.defaultMemoryLimit}
              value={props.subtask.memoryLimit == null ? "" : props.subtask.memoryLimit}
              icon="microchip"
              iconPosition="left"
              onChange={(e, { value }) =>
                (value === "" || (Number.isSafeInteger(Number(value)) && Number(value) >= 0)) &&
                props.onUpdate({ memoryLimit: value === "" ? null : Number(value) })
              }
            />
          </Menu.Item>
          <Menu.Item className={style.itemLabel}>MiB</Menu.Item>
          <Menu.Item className={style.itemSubtaskScore}>
            <Input
              transparent
              placeholder={props.defaultPercentagePoints}
              value={props.subtask.percentagePoints == null ? "" : props.subtask.percentagePoints}
              icon="percent"
              onChange={(e, { value }) =>
                (value === "" || (Number.isSafeInteger(Number(value)) && Number(value) >= 0 && Number(value) <= 100)) &&
                props.onUpdate({ percentagePoints: value === "" ? null : Number(value) })
              }
            />
          </Menu.Item>
          <Ref innerRef={refOptionsButton}>
            <Dropdown item icon="bars" className={`icon ${style.itemWithIcon}`}>
              <Dropdown.Menu>
                <Dropdown.Item
                  icon="sort numeric down"
                  text={_("problem_judge_settings.subtask_options.sort")}
                  onClick={sortTestcases}
                />
                <Dropdown.Item
                  icon="arrow up"
                  text={_("problem_judge_settings.subtask_options.add_before")}
                  onClick={() => props.onAddSubtaskBefore()}
                />
                <Dropdown.Item
                  icon="arrow down"
                  text={_("problem_judge_settings.subtask_options.add_after")}
                  onClick={() => props.onAddSubtaskAfter()}
                />
                <Dropdown.Item
                  icon="plus"
                  text={_("problem_judge_settings.subtask_options.add_testcase")}
                  onClick={() => (props.onAddTestcase(props.subtask.testcases.length), setTestcasesExpanded(true))}
                />
                <Dropdown.Item
                  icon="angle double up"
                  text={_("problem_judge_settings.subtask_options.move_up")}
                  disabled={props.subtaskIndex === 0}
                  onClick={() => props.onMoveUp()}
                />
                <Dropdown.Item
                  icon="angle double down"
                  text={_("problem_judge_settings.subtask_options.move_down")}
                  disabled={props.subtaskIndex === props.subtaskCount - 1}
                  onClick={() => props.onMoveDown()}
                />
                <Popup
                  trigger={<Dropdown.Item icon="delete" text={_("problem_judge_settings.subtask_options.delete")} />}
                  context={refOptionsButton}
                  content={
                    <Button
                      negative
                      content={_("problem_judge_settings.subtask_options.confirm_delete")}
                      onClick={() => props.onDelete()}
                    />
                  }
                  on="click"
                  position="top center"
                />
              </Dropdown.Menu>
            </Dropdown>
          </Ref>
          <Menu.Item as="a" icon="magic" className={style.itemWithIcon} onClick={openAutoAddTestcasesDialog} />
        </Menu.Menu>
      </Menu>
      <Menu attached className={style.menu}>
        <Dropdown
          item
          value={props.subtask.scoringType}
          className={style.itemScoringTypeDropdown}
          options={Object.values(SubtaskScoringType).map(type => ({
            key: type,
            value: type,
            text: _(`problem_judge_settings.subtask_type.${type}`)
          }))}
          onChange={(e, { value }) => props.onUpdate({ scoringType: value as SubtaskScoringType })}
        />
        <Menu.Menu position="right">
          {props.subtask.testcases.length === 0 ? (
            <Menu.Item icon="circle outline" content={_("problem_judge_settings.no_testcases")} />
          ) : (
            <Menu.Item
              as="a"
              icon={testcasesExpanded ? "minus square outline" : "plus square outline"}
              content={
                testcasesExpanded
                  ? _("problem_judge_settings.hide_testcases")
                  : _("problem_judge_settings.expand_testcases")
              }
              onClick={() => setTestcasesExpanded(!testcasesExpanded)}
            />
          )}
        </Menu.Menu>
      </Menu>
      {testcasesExpanded &&
        props.subtask.testcases.map((testcase, testcaseIndex) => (
          <SubtaskEditorTastcaseItem
            key={testcase.uuid}
            testDataFiles={props.testDataFiles}
            testcaseIndex={testcaseIndex}
            testcaseCount={props.subtask.testcases.length}
            testcase={testcase}
            defaultPercentagePoints={defaultPercentagePoints}
            defaultTimeLimit={props.subtask.timeLimit != null ? props.subtask.timeLimit : props.defaultTimeLimit}
            defaultMemoryLimit={
              props.subtask.memoryLimit != null ? props.subtask.memoryLimit : props.defaultMemoryLimit
            }
            onUpdate={updateInfo => props.onUpdateTestcase(testcaseIndex, updateInfo)}
            onDelete={() => props.onDeleteTestcase(testcaseIndex)}
            onMoveUp={() => props.onMoveTestcaseUp(testcaseIndex)}
            onMoveDown={() => props.onMoveTestcaseDown(testcaseIndex)}
            onAddTestcaseBefore={() => props.onAddTestcase(testcaseIndex)}
            onAddTestcaseAfter={() => props.onAddTestcase(testcaseIndex + 1)}
          />
        ))}
      {props.subtaskCount > 1 && (
        <>
          <Menu attached="bottom" className={style.menu + " " + style.menuSubtaskFooter}>
            <Menu.Item>{_("problem_judge_settings.dependencies")}</Menu.Item>
            <Dropdown
              className={style.itemSearchDropdown + " " + style.itemDependencies}
              item
              multiple
              search
              selection
              value={props.subtask.dependencies}
              options={[...Array(props.subtaskCount).keys()]
                .filter(i => i != props.subtaskIndex)
                .map(i => ({
                  key: i,
                  value: i,
                  text: i + 1
                }))}
              onChange={(e, { value }) => props.onUpdate({ dependencies: value as number[] })}
            />
          </Menu>
        </>
      )}
    </>
  );
};

SubtaskEditor = observer(SubtaskEditor);

type Problem = ApiTypes.GetProblemResponseDto;
type ProblemFile = ApiTypes.ProblemFileDto;

interface ProblemJudgeSettingsPageProps {
  problem: Problem;
  idType?: "id" | "displayId";
}

let ProblemJudgeSettingsPage: React.FC<ProblemJudgeSettingsPageProps> = props => {
  const _ = useIntlMessage();
  const navigation = useNavigation();

  const idString = props.idType === "id" ? `P${props.problem.meta.id}` : `#${props.problem.meta.displayId}`;

  useEffect(() => {
    appState.enterNewPage(`${_("problem_judge_settings.title")} ${idString}`, false);
  }, [appState.locale]);

  const CHECKER_TYPES: JudgeInfo["checker"]["type"][] = ["integers", "floats", "lines", "binary", "custom"];
  const CUSTOM_CHECKER_INTERFACES = ["testlib", "legacy", "lemon", "hustoj", "qduoj", "domjudge"];

  function parseCheckerConfig(checker: Partial<JudgeInfo["checker"]>): JudgeInfo["checker"] {
    if (!checker || !CHECKER_TYPES.includes(checker.type))
      return {
        // default
        type: "lines",
        caseSensitive: false
      };

    switch (checker.type) {
      case "integers":
        return { type: "integers" };
      case "floats":
        return {
          type: "floats",
          precision: Number.isSafeInteger(checker.precision) && checker.precision > 0 ? checker.precision : 4
        };
      case "lines":
        return { type: "lines", caseSensitive: !!checker.caseSensitive };
      case "binary":
        return { type: "binary" };
      case "custom":
        const language = Object.values(CodeLanguage).includes(checker.language)
          ? checker.language
          : Object.values(CodeLanguage)[0];
        return {
          type: "custom",
          interface: CUSTOM_CHECKER_INTERFACES.includes(checker.interface)
            ? checker.interface
            : CUSTOM_CHECKER_INTERFACES[0],
          language: language,
          languageOptions:
            language === checker.language
              ? filterValidLanguageOptions(language, checker.languageOptions)
              : getPreferredCodeLanguageOptions(language),
          filename:
            checker.filename && typeof checker.filename === "string"
              ? checker.filename
              : (
                  props.problem.testData.find(file => checkCodeFileExtension(language, file.filename)) ||
                  props.problem.testData[0] ||
                  {}
                ).filename || ""
        };
    }
  }

  function parseJudgeInfo(raw: any) {
    const subtaskCount = Array.isArray(raw.subtasks) ? raw.subtasks.length : 0;
    const converted: JudgeInfo = {
      timeLimit: Number.isSafeInteger(raw.timeLimit) ? raw.timeLimit : null,
      memoryLimit: Number.isSafeInteger(raw.memoryLimit) ? raw.memoryLimit : null,
      fileIo:
        raw.fileIo && typeof raw.fileIo.inputFilename === "string" && typeof raw.fileIo.outputFilename === "string"
          ? {
              inputFilename: raw.fileIo.inputFilename,
              outputFilename: raw.fileIo.outputFilename
            }
          : null,
      runSamples: !!raw.runSamples,
      subtasks:
        Array.isArray(raw.subtasks) && raw.subtasks.length > 0
          ? (raw.subtasks as any[])
              .map(x => x || {})
              .map(rawSubtask => ({
                uuid: uuid(),
                scoringType:
                  rawSubtask.scoringType in SubtaskScoringType ? rawSubtask.scoringType : SubtaskScoringType.Sum,
                percentagePoints: Number.isSafeInteger(rawSubtask.percentagePoints)
                  ? rawSubtask.percentagePoints
                  : null,
                timeLimit: Number.isSafeInteger(rawSubtask.timeLimit) ? rawSubtask.timeLimit : null,
                memoryLimit: Number.isSafeInteger(rawSubtask.memoryLimit) ? rawSubtask.memoryLimit : null,
                dependencies: Array.isArray(rawSubtask.dependencies)
                  ? (rawSubtask.dependencies as any[]).filter(
                      id => typeof id === "number" && id >= 0 && id < subtaskCount
                    )
                  : [],
                testcases: Array.isArray(rawSubtask.testcases)
                  ? (rawSubtask.testcases as any[])
                      .map(x => x || {})
                      .map(rawTestcase => ({
                        uuid: uuid(),
                        inputFilename: typeof rawTestcase.inputFilename === "string" ? rawTestcase.inputFilename : "",
                        outputFilename:
                          typeof rawTestcase.outputFilename === "string" ? rawTestcase.outputFilename : "",
                        percentagePoints: Number.isSafeInteger(rawTestcase.percentagePoints)
                          ? rawTestcase.percentagePoints
                          : null,
                        timeLimit: Number.isSafeInteger(rawTestcase.timeLimit) ? rawTestcase.timeLimit : null,
                        memoryLimit: Number.isSafeInteger(rawTestcase.memoryLimit) ? rawTestcase.memoryLimit : null
                      }))
                  : []
              }))
          : null,
      checker: parseCheckerConfig(raw.checker)
    };
    return converted;
  }

  function normalizeJudgeInfo(judgeInfo: JudgeInfo) {
    const normalized = lodashClonedeep(judgeInfo);
    if (!normalized.runSamples) delete normalized.runSamples;
    if (!normalized.fileIo) delete normalized.fileIo;
    if (normalized.subtasks) {
      for (const subtask of normalized.subtasks) {
        delete subtask.uuid;
        if (subtask.percentagePoints == null) delete subtask.percentagePoints;
        if (subtask.timeLimit == null) delete subtask.timeLimit;
        if (subtask.memoryLimit == null) delete subtask.memoryLimit;
        if (subtask.dependencies == null || subtask.dependencies.length === 0) delete subtask.dependencies;
        for (const testcase of subtask.testcases) {
          delete testcase.uuid;
          if (testcase.percentagePoints == null) delete testcase.percentagePoints;
          if (testcase.timeLimit == null) delete testcase.timeLimit;
          if (testcase.memoryLimit == null) delete testcase.memoryLimit;
        }
      }
    }
    return normalized;
  }

  const [judgeInfo, setJudgeInfo] = useState(parseJudgeInfo(props.problem.judgeInfo));

  const [pending, setPending] = useState(false);
  const [modified, setModified] = useState(false);

  function onUpdate(updateInfo: Partial<JudgeInfo>) {
    if (pending) return;
    setModified(true);

    setJudgeInfo(
      update(judgeInfo, {
        $merge: updateInfo
      })
    );
  }

  function onUpdateSubtask(subtaskIndex: number, updateInfo: Partial<Subtask>) {
    if (pending) return;
    setModified(true);

    setJudgeInfo(
      update(judgeInfo, {
        subtasks: {
          [subtaskIndex]: {
            $merge: updateInfo
          }
        }
      })
    );
  }

  function updateSubtaskDependencyIdReference(callback: (id: number) => number): (subtasks: Subtask[]) => Subtask[] {
    return subtasks =>
      subtasks.map(subtask =>
        Object.assign({}, subtask, {
          dependencies: subtask.dependencies.map(callback).filter(x => x != null)
        })
      );
  }

  function onDeleteSubtask(subtaskIndex: number) {
    if (pending) return;
    setModified(true);

    // If only one subtask, clear it instead of deleting it
    if (judgeInfo.subtasks.length === 1) {
      setJudgeInfo(
        update(judgeInfo, {
          $merge: {
            subtasks: [
              {
                uuid: uuid(),
                scoringType: SubtaskScoringType.Sum,
                testcases: [],
                dependencies: []
              }
            ]
          }
        })
      );
      return;
    }

    setJudgeInfo(
      update(judgeInfo, {
        subtasks: {
          $splice: [[subtaskIndex, 1]],
          $apply: updateSubtaskDependencyIdReference(id => {
            if (id === subtaskIndex) return null;
            else if (id > subtaskIndex) return id - 1;
            else return id;
          })
        }
      })
    );
  }

  function onMoveSubtask(subtaskIndex: number, direction: "UP" | "DOWN") {
    if (pending) return;
    setModified(true);

    const subtask = judgeInfo.subtasks[subtaskIndex],
      swappingSubtask = subtaskIndex + (direction === "UP" ? -1 : 1);
    setJudgeInfo(
      update(judgeInfo, {
        subtasks: {
          $splice: [
            [subtaskIndex, 1],
            [subtaskIndex + (direction === "UP" ? -1 : +1), 0, subtask]
          ],
          $apply: updateSubtaskDependencyIdReference(id => {
            if (id === swappingSubtask) return subtaskIndex;
            else if (id == subtaskIndex) return swappingSubtask;
            else return id;
          })
        }
      })
    );
  }

  // Add new subtask with the TL/ML/ST of the old
  function onAddSubtask(subtaskIndex: number, template: Subtask) {
    if (pending) return;
    setModified(true);

    setJudgeInfo(
      update(judgeInfo, {
        subtasks: {
          $splice: [
            [
              subtaskIndex,
              0,
              {
                uuid: uuid(),
                scoringType: template.scoringType,
                percentagePoints: null,
                timeLimit: template.timeLimit,
                memoryLimit: template.memoryLimit,
                dependencies: template.dependencies,
                testcases: []
              }
            ]
          ],
          $apply: updateSubtaskDependencyIdReference(id => {
            if (id >= subtaskIndex) return id + 1;
            else return id;
          })
        }
      })
    );
  }

  function onUpdateTestcase(subtaskIndex: number, testcaseIndex: number, updateInfo: Partial<Testcase>) {
    if (pending) return;
    setModified(true);

    setJudgeInfo(
      update(judgeInfo, {
        subtasks: {
          [subtaskIndex]: {
            testcases: {
              [testcaseIndex]: {
                $merge: updateInfo
              }
            }
          }
        }
      })
    );
  }

  function onDeleteTestcase(subtaskIndex: number, testcaseIndex: number) {
    if (pending) return;
    setModified(true);

    setJudgeInfo(
      update(judgeInfo, {
        subtasks: {
          [subtaskIndex]: {
            testcases: {
              $splice: [[testcaseIndex, 1]]
            }
          }
        }
      })
    );
  }

  function onMoveTestcase(subtaskIndex: number, testcaseIndex, direction: "UP" | "DOWN") {
    if (pending) return;
    setModified(true);

    const testcase = judgeInfo.subtasks[subtaskIndex].testcases[testcaseIndex];
    setJudgeInfo(
      update(judgeInfo, {
        subtasks: {
          [subtaskIndex]: {
            testcases: {
              $splice: [
                [testcaseIndex, 1],
                [testcaseIndex + (direction === "UP" ? -1 : +1), 0, testcase]
              ]
            }
          }
        }
      })
    );
  }

  function onAddTestcase(subtaskIndex: number, testcaseIndex: number) {
    if (pending) return;
    setModified(true);

    setJudgeInfo(
      update(judgeInfo, {
        subtasks: {
          [subtaskIndex]: {
            testcases: {
              $splice: [
                [
                  testcaseIndex,
                  0,
                  {
                    uuid: uuid(),
                    inputFilename: null,
                    outputFilename: null,
                    percentagePoints: null,
                    timeLimit: null,
                    memoryLimit: null
                  }
                ]
              ]
            }
          }
        }
      })
    );
  }

  function onUpdateChecker(config: Partial<JudgeInfo["checker"]>) {
    onUpdate({
      checker: Object.assign({}, judgeInfo.checker, config)
    });
  }

  const checkerConfigBackup = useRef<Map<typeof CHECKER_TYPES[number], JudgeInfo["checker"]>>(new Map()).current;
  function onChangeCheckerType(type: typeof CHECKER_TYPES[number]) {
    if (pending) return;

    if (type === judgeInfo.checker.type) return;
    checkerConfigBackup.set(judgeInfo.checker.type, judgeInfo.checker);

    onUpdate({ checker: checkerConfigBackup.get(type) || parseCheckerConfig({ type }) });
  }

  function onBackToProblem() {
    if (props.idType === "displayId") {
      navigation.navigate(`/problem/${props.problem.meta.displayId}`);
    } else {
      navigation.navigate(`/problem/by-id/${props.problem.meta.id}`);
    }
  }

  async function onSubmit() {
    if (pending) return;

    setPending(true);

    const { requestError, response } = await ProblemApi.updateProblemJudgeInfo({
      problemId: props.problem.meta.id,
      judgeInfo: normalizeJudgeInfo(judgeInfo)
    });

    if (requestError) {
      toast.error(requestError);
    } else if (response.error) {
      if (response.error === "INVALID_JUDGE_INFO") {
        toast.error(
          _(`problem_judge_settings.error.INVALID_JUDGE_INFO.${response.judgeInfoError[0]}`, response.judgeInfoError)
        );
      } else {
        toast.error(_(`problem_judge_settings.error.${response.error}`));
      }
    } else {
      toast.success(_("problem_judge_settings.submit_success"));
      setModified(false);
    }

    setPending(false);
  }

  const sumSpecfiedPercentagePoints = (judgeInfo.subtasks || [])
    .map(subtask => subtask.percentagePoints)
    .filter(x => x != null)
    .reduce((sum, x) => sum + x, 0);
  const countUnspecfiedPercentagePoints = (judgeInfo.subtasks || []).filter(subtask => subtask.percentagePoints == null)
    .length;
  const defaultPercentagePoints =
    (sumSpecfiedPercentagePoints > 100
      ? 0
      : Math.round((100 - sumSpecfiedPercentagePoints) / countUnspecfiedPercentagePoints)) || 0;

  const [editRawEditorValue, setEditRawEditorValue] = useState(yaml.safeDump(normalizeJudgeInfo(judgeInfo)));
  const [editRawEditorErrorMessage, setEditRawEditorErrorMessage] = useState("");
  const editRawDialog = useDialog(
    {},
    <Header icon="code" content={_("problem_judge_settings.edit_raw.edit_raw")} />,
    <>
      {editRawEditorErrorMessage && (
        <Message
          className={style.dialogMessage}
          error
          header={_("problem_judge_settings.edit_raw.parse_error")}
          content={
            <p>
              <code>{editRawEditorErrorMessage.trimEnd()}</code>
            </p>
          }
        />
      )}
      <CodeEditor
        className={style.codeEditor}
        value={editRawEditorValue}
        language="yaml"
        onChange={value => setEditRawEditorValue(value)}
      />
    </>,
    <>
      <Button content={_("problem_judge_settings.edit_raw.cancel")} onClick={() => editRawDialog.close()} />
      <Button
        positive
        content={_("problem_judge_settings.edit_raw.ok")}
        onClick={() => {
          try {
            const parsed = yaml.safeLoad(editRawEditorValue);
            setJudgeInfo(parseJudgeInfo(parsed));
            editRawDialog.close();
          } catch (e) {
            setEditRawEditorErrorMessage(e.message);
          }
        }}
      />
    </>
  );

  const autoTestcases = useMemo(
    () =>
      props.problem.testData
        .filter(file => file.filename.toLowerCase().endsWith(".in"))
        .map<[ApiTypes.ProblemFileDto, ApiTypes.ProblemFileDto, number[]]>(input => [
          input,
          props.problem.testData.find(file =>
            [".out", ".ans"]
              .map(ext => input.filename.slice(0, -3).toLowerCase() + ext)
              .includes(file.filename.toLowerCase())
          ),
          (input.filename.match(/\d+/g) || []).map(parseInt)
        ])
        .filter(([input, outputFile]) => outputFile)
        .sort(([inputA, outputA, numbersA], [inputB, outputB, numbersB]) => {
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
          inputFilename: input.filename,
          outputFilename: output.filename
        })),
    [props.problem]
  );

  // Prevent losing subtasks by clicking "auto detect testcases" checkbox and then click again back.
  const [subtasksBackup, setSubtasksBackup] = useState(
    judgeInfo.subtasks || [{ scoringType: SubtaskScoringType.Sum, testcases: [], uuid: uuid(), dependencies: [] }]
  );

  useConfirmUnload(() => modified);

  return (
    <>
      {editRawDialog.element}
      <Grid>
        <Grid.Row>
          <Grid.Column width={7}>
            <div style={{ height: appState.windowHeight - 105 }} className={style.leftContainer}>
              <div className={style.header}>
                <Header as="h1" content={_("problem_judge_settings.header") + " " + idString} />
                <Popup
                  trigger={
                    <Button
                      className={style.backButton}
                      disabled={pending}
                      content={_("problem_judge_settings.back_to_problem")}
                      onClick={() => !modified && onBackToProblem()}
                    />
                  }
                  // It's safe to redirect if not modified, don't confirm
                  disabled={!modified}
                  content={
                    <Button
                      negative
                      content={_("problem_judge_settings.confirm_back_to_problem")}
                      onClick={onBackToProblem}
                    />
                  }
                  on="click"
                  position="bottom center"
                />
                <Button
                  className={style.submitButton}
                  primary
                  loading={pending}
                  disabled={!props.problem.permissionOfCurrentUser.MODIFY}
                  content={
                    props.problem.permissionOfCurrentUser.MODIFY
                      ? _("problem_judge_settings.submit")
                      : _("problem_judge_settings.no_submit_permission")
                  }
                  onClick={onSubmit}
                />
              </div>
              <HighlightedCodeBox
                className={style.yamlCodeBox}
                segmentClassName={style.yamlSegment}
                code={yaml.safeDump(normalizeJudgeInfo(judgeInfo))}
                language="yaml"
              >
                <Button
                  className="icon labeled"
                  id={style.buttonEditRaw}
                  icon="code"
                  content={_("problem_judge_settings.edit_raw.edit_raw")}
                  onClick={() => {
                    setEditRawEditorErrorMessage("");
                    setEditRawEditorValue(yaml.safeDump(normalizeJudgeInfo(judgeInfo)));
                    editRawDialog.open();
                  }}
                />
              </HighlightedCodeBox>
            </div>
          </Grid.Column>
          <Grid.Column width={9}>
            <Form>
              <Form.Field inline className={style.problemTypeField}>
                <label className={style.problemTypeFieldLabel}>{_("problem_judge_settings.problem_type")}</label>
                <Dropdown
                  className={style.problemTypeDropdown}
                  selection
                  value="TRADITIONAL"
                  options={[
                    {
                      key: "TRADITIONAL",
                      value: "TRADITIONAL",
                      text: _("problem_judge_settings.problem_types.TRADITIONAL")
                    }
                  ]}
                />
                <Button
                  disabled
                  className={style.problemTypeSwitchButton}
                  content={_("problem_judge_settings.switch")}
                />
              </Form.Field>
              <Form.Group>
                <Form.Field width={8}>
                  <label>{_("problem_judge_settings.time_limit")}</label>
                  <Input
                    className={style.labeledInput}
                    value={judgeInfo.timeLimit == null ? "" : judgeInfo.timeLimit}
                    label="ms"
                    labelPosition="right"
                    icon="clock"
                    iconPosition="left"
                    onChange={(e, { value }) =>
                      (value === "" || (Number.isSafeInteger(Number(value)) && Number(value) >= 0)) &&
                      onUpdate({ timeLimit: value === "" ? null : Number(value) })
                    }
                  />
                </Form.Field>
                <Form.Field width={8}>
                  <label>{_("problem_judge_settings.memory_limit")}</label>
                  <Input
                    className={style.labeledInput}
                    value={judgeInfo.memoryLimit == null ? "" : judgeInfo.memoryLimit}
                    label="MiB"
                    labelPosition="right"
                    icon="microchip"
                    iconPosition="left"
                    onChange={(e, { value }) =>
                      (value === "" || (Number.isSafeInteger(Number(value)) && Number(value) >= 0)) &&
                      onUpdate({ memoryLimit: value === "" ? null : Number(value) })
                    }
                  />
                </Form.Field>
              </Form.Group>
              <Form.Group>
                <Form.Field width={8}>
                  <label>{_("problem_judge_settings.input_file")}</label>
                  <Input
                    value={
                      judgeInfo.fileIo ? judgeInfo.fileIo.inputFilename : _("problem_judge_settings.standard_input")
                    }
                    readOnly={!judgeInfo.fileIo}
                    icon="sign in"
                    iconPosition="left"
                    onChange={(e, { value }) =>
                      onUpdate({ fileIo: { inputFilename: value, outputFilename: judgeInfo.fileIo.outputFilename } })
                    }
                  />
                </Form.Field>
                <Form.Field width={8}>
                  <label>{_("problem_judge_settings.output_file")}</label>
                  <Input
                    value={
                      judgeInfo.fileIo ? judgeInfo.fileIo.outputFilename : _("problem_judge_settings.standard_output")
                    }
                    readOnly={!judgeInfo.fileIo}
                    icon="sign out"
                    iconPosition="left"
                    onChange={(e, { value }) =>
                      onUpdate({ fileIo: { inputFilename: judgeInfo.fileIo.inputFilename, outputFilename: value } })
                    }
                  />
                </Form.Field>
              </Form.Group>
              <Form.Group>
                <Form.Checkbox
                  width={8}
                  label={_("problem_judge_settings.use_standard_io")}
                  checked={!judgeInfo.fileIo}
                  onChange={(e, { checked }) =>
                    onUpdate({ fileIo: checked ? null : { inputFilename: "", outputFilename: "" } })
                  }
                />
                <Form.Checkbox
                  width={8}
                  label={_("problem_judge_settings.run_samples")}
                  checked={judgeInfo.runSamples}
                  onChange={(e, { checked }) => onUpdate({ runSamples: checked })}
                />
              </Form.Group>
              <div className={style.checkerMenuWrapper}>
                <Header size="tiny" content={_("problem_judge_settings.checker.checker")} />
                <Menu secondary pointing>
                  {CHECKER_TYPES.map(type => (
                    <Menu.Item
                      key={type}
                      content={_(`problem_judge_settings.checker.types.${type}`)}
                      active={judgeInfo.checker.type === type}
                      onClick={() => judgeInfo.checker.type !== type && onChangeCheckerType(type)}
                    />
                  ))}
                </Menu>
              </div>
              <Segment color="grey" className={style.checkerConfig}>
                {(() => {
                  const checker = judgeInfo.checker;
                  switch (checker.type) {
                    case "integers":
                      return null;
                    case "floats":
                      return (
                        <>
                          <Form.Field width={8}>
                            <label>{_(`problem_judge_settings.checker.config.floats.precision`)}</label>
                            <Input
                              value={checker.precision}
                              onChange={(e, { value }) =>
                                (value === "" || (Number.isSafeInteger(Number(value)) && Number(value) > 0)) &&
                                onUpdateChecker({ precision: Number(value) })
                              }
                            />
                          </Form.Field>
                          <div className={style.description}>
                            {_("problem_judge_settings.checker.config.floats.description", {
                              value: `1e-${checker.precision}`
                            })}
                          </div>
                        </>
                      );
                    case "lines":
                      return (
                        <>
                          <Form.Checkbox
                            toggle
                            label={_(`problem_judge_settings.checker.config.lines.case_sensitive`)}
                            checked={checker.caseSensitive}
                            onChange={(e, { checked }) => onUpdateChecker({ caseSensitive: checked })}
                          />
                          <div className={style.description}>
                            {_("problem_judge_settings.checker.config.lines.description")}
                          </div>
                        </>
                      );
                    case "binary":
                      return null;
                    case "custom":
                      const setLanguageOption = (name: string, value: unknown) => {
                        onUpdateChecker({
                          languageOptions: Object.assign({}, checker.languageOptions, {
                            [name]: value
                          })
                        });
                      };
                      return (
                        <div className={style.custom}>
                          <Form.Select
                            placeholder={_("problem_judge_settings.checker.config.custom.filename_no_file")}
                            text={
                              !props.problem.testData.some(file => file.filename === checker.filename)
                                ? checker.filename
                                : undefined
                            }
                            open={props.problem.testData.length === 0 ? false : undefined}
                            className={style.fileSelect}
                            label={_("problem_judge_settings.checker.config.custom.filename")}
                            value={checker.filename}
                            options={props.problem.testData.map(file => ({
                              key: file.filename,
                              value: file.filename,
                              text: (
                                <>
                                  <Icon className={style.fileIcon} name={getFileIcon(file.filename)} />
                                  <div className={style.filename}>{file.filename}</div>
                                  <div className={style.fileSize}>{formatFileSize(file.size, 1)}</div>
                                </>
                              )
                            }))}
                            onChange={(e, { value }) => onUpdateChecker({ filename: value as string })}
                          />
                          <Form.Group className={style.threeColumns}>
                            <Form.Select
                              width={8}
                              label={_("problem_judge_settings.checker.config.custom.interface")}
                              value={checker.interface}
                              options={CUSTOM_CHECKER_INTERFACES.map(iface => ({
                                key: iface,
                                value: iface,
                                text: _(`problem_judge_settings.checker.config.custom.interfaces.${iface}`)
                              }))}
                              onChange={(e, { value }) => onUpdateChecker({ interface: value as any })}
                            />
                            <Form.Select
                              width={8}
                              label={_("problem_judge_settings.checker.config.custom.language")}
                              value={checker.language}
                              options={Object.keys(codeLanguageOptions).map(language => ({
                                key: language,
                                value: language,
                                text: _(`code_language.${language}.name`)
                              }))}
                              onChange={(e, { value }) => onUpdateChecker({ language: value as CodeLanguage })}
                            />
                          </Form.Group>
                          <div className={style.languageOptions}>
                            {codeLanguageOptions[checker.language].map(option => {
                              switch (option.type) {
                                case CodeLanguageOptionType.Select:
                                  return (
                                    <Form.Select
                                      label={_(`code_language.${checker.language}.options.${option.name}.name`)}
                                      fluid
                                      value={
                                        checker.languageOptions[option.name] == null
                                          ? option.defaultValue
                                          : (checker.languageOptions[option.name] as string)
                                      }
                                      options={option.values.map(value => ({
                                        key: value,
                                        value: value,
                                        text: _(
                                          `code_language.${checker.language}.options.${option.name}.values.${value}`
                                        )
                                      }))}
                                      onChange={(e, { value }) => setLanguageOption(option.name, value)}
                                    />
                                  );
                              }
                            })}
                          </div>
                        </div>
                      );
                  }
                })()}
              </Segment>
              <Form.Group>
                <Form.Checkbox
                  width={16}
                  label={
                    <label dangerouslySetInnerHTML={{ __html: _("problem_judge_settings.auto_testcases") }}></label>
                  }
                  checked={!judgeInfo.subtasks}
                  onChange={(e, { checked }) => {
                    if (checked) {
                      setSubtasksBackup(judgeInfo.subtasks);
                      onUpdate({ subtasks: null });
                    } else {
                      onUpdate({ subtasks: subtasksBackup });
                    }
                  }}
                />
              </Form.Group>
            </Form>
            {judgeInfo.subtasks ? (
              judgeInfo.subtasks.map((subtask, index) => (
                <SubtaskEditor
                  key={subtask.uuid}
                  testDataFiles={props.problem.testData}
                  subtaskIndex={index}
                  subtaskCount={judgeInfo.subtasks.length}
                  subtask={subtask}
                  defaultPercentagePoints={defaultPercentagePoints}
                  defaultTimeLimit={judgeInfo.timeLimit}
                  defaultMemoryLimit={judgeInfo.memoryLimit}
                  onUpdate={updateInfo => onUpdateSubtask(index, updateInfo)}
                  onDelete={() => onDeleteSubtask(index)}
                  onMoveUp={() => onMoveSubtask(index, "UP")}
                  onMoveDown={() => onMoveSubtask(index, "DOWN")}
                  onAddSubtaskBefore={() => onAddSubtask(index, subtask)}
                  onAddSubtaskAfter={() => onAddSubtask(index + 1, subtask)}
                  onUpdateTestcase={(testcaseIndex, updateInfo) => onUpdateTestcase(index, testcaseIndex, updateInfo)}
                  onDeleteTestcase={testcaseIndex => onDeleteTestcase(index, testcaseIndex)}
                  onMoveTestcaseUp={testcaseIndex => onMoveTestcase(index, testcaseIndex, "UP")}
                  onMoveTestcaseDown={testcaseIndex => onMoveTestcase(index, testcaseIndex, "DOWN")}
                  onAddTestcase={testcaseIndex => onAddTestcase(index, testcaseIndex)}
                />
              ))
            ) : (
              <Table textAlign="center">
                <Table.Header>
                  <Table.Row>
                    <Table.HeaderCell width={2}>#</Table.HeaderCell>
                    <Table.HeaderCell width={7}>{_("problem_judge_settings.testcase.input_file")}</Table.HeaderCell>
                    <Table.HeaderCell width={7}>{_("problem_judge_settings.testcase.output_file")}</Table.HeaderCell>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {autoTestcases.length > 0 ? (
                    autoTestcases.map((testcase, i) => (
                      <Table.Row key={i}>
                        <Table.Cell>{i + 1}</Table.Cell>
                        <Table.Cell>{testcase.inputFilename}</Table.Cell>
                        <Table.Cell>{testcase.outputFilename}</Table.Cell>
                      </Table.Row>
                    ))
                  ) : (
                    <Table.Row>
                      <Table.Cell colSpan={3}>
                        {_("problem_judge_settings.cannot_detect_testcases_from_testdata")}
                      </Table.Cell>
                    </Table.Row>
                  )}
                </Table.Body>
              </Table>
            )}
          </Grid.Column>
        </Grid.Row>
      </Grid>
    </>
  );
};

ProblemJudgeSettingsPage = observer(ProblemJudgeSettingsPage);

export default {
  byId: defineRoute(async request => {
    const id = parseInt(request.params["id"]);
    const problem = await fetchData("id", id);

    return <ProblemJudgeSettingsPage key={Math.random()} idType="id" problem={problem} />;
  }),
  byDisplayId: defineRoute(async request => {
    const displayId = parseInt(request.params["displayId"]);
    const problem = await fetchData("displayId", displayId);

    return <ProblemJudgeSettingsPage key={Math.random()} idType="displayId" problem={problem} />;
  })
};
