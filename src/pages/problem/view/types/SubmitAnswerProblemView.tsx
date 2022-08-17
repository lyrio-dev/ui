import React, { useRef, useState } from "react";
import { observer } from "mobx-react";

import { useLocalizer } from "@/utils/hooks";
import { CodeLanguage } from "@/interfaces/CodeLanguage";
import getFileIcon from "@/utils/getFileIcon";

import { JudgeInfoSubmitAnswer } from "../../judge-settings/types/SubmitAnswerProblemEditor";
import { ProblemTypeLabelsProps, ProblemTypeSubmitViewProps, ProblemTypeView } from "../common/interface";
import SubmitViewFrame from "../common/SubmitViewFrame";
import FileChooser from "../common/FileChooser";
import TabbedEditor from "../common/TabbedEditor";
import PseudoLink from "@/components/PseudoLink";
import { createZipBlob } from "@/utils/zip";
import { hasAnySubtaskTestcase } from "../common";

type SubmitAnswerProblemLabelsProps = ProblemTypeLabelsProps<JudgeInfoSubmitAnswer>;

const ARCHIVE_FILE_EXTENSIONS = [".zip"];

const SubmitAnswerProblemLabels: React.FC<SubmitAnswerProblemLabelsProps> = React.memo(props => {
  const _ = useLocalizer("problem");

  return <></>;
});

interface SubmissionContent {
  language: CodeLanguage;
  code: string;
  compileAndRunOptions: any;
  skipSamples?: boolean;
}

type SubmitAnswerProblemSubmitViewProps = ProblemTypeSubmitViewProps<JudgeInfoSubmitAnswer, SubmissionContent>;

let SubmitAnswerProblemSubmitView: React.FC<SubmitAnswerProblemSubmitViewProps> = props => {
  const _ = useLocalizer("problem");

  const wantedFiles = props.judgeInfo.subtasks
    .map(subtask => subtask.testcases.map(testcase => testcase.userOutputFilename || testcase.outputFile))
    .flat();

  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const selectedIsArchive =
    selectedFiles.length === 1 &&
    ARCHIVE_FILE_EXTENSIONS.some(ext => selectedFiles[0].name.toLowerCase().endsWith(ext));
  const selectedWantedFiles = selectedFiles.filter(file => wantedFiles.includes(file.name));

  const [editorContents, setEditorContents] = useState<string[]>(Array(wantedFiles.length).fill(""));

  // If the editor contents are not empty, and user choose some files, warn the user the editor contents will not be submitted.
  const editorContentsNotEmpty = editorContents.some(s => s);

  async function onGetSubmitFile(): Promise<Blob> {
    if (selectedIsArchive) return selectedFiles[0];
    else if (selectedWantedFiles.length > 0)
      return await createZipBlob({
        start(ctrl) {
          selectedWantedFiles.forEach(file => ctrl.enqueue(file));
          ctrl.close();
        }
      });
    else if (editorContentsNotEmpty)
      return await createZipBlob({
        start(ctrl) {
          wantedFiles.forEach((filename, i) => ctrl.enqueue(new File([editorContents[i]], filename)));
          ctrl.close();
        }
      });
    else throw new TypeError("This should not happen.");
  }

  const refSetEditorValue = useRef<(tabIndex: number, value: string) => void>();
  function clearEditor() {
    wantedFiles.map((file, i) => refSetEditorValue.current(i, ""));
  }

  return (
    <>
      <SubmitViewFrame
        {...props}
        onGetSubmitFile={onGetSubmitFile}
        showSkipSamples={false}
        mainContent={
          <SubmitViewFrame.EditorWrapper disabled={selectedFiles.length > 0}>
            <TabbedEditor
              tabs={wantedFiles.map(filename => ({
                title: filename,
                icon: getFileIcon(filename),
                language: null,
                initialContent: ""
              }))}
              refSetValue={refSetEditorValue}
              onChange={(i, newValue) =>
                setEditorContents(editorContents => {
                  const a = editorContents.slice(0);
                  a[i] = newValue;
                  return a;
                })
              }
            />
          </SubmitViewFrame.EditorWrapper>
        }
        sidebarContent={
          <>
            <FileChooser
              accept={wantedFiles}
              disabled={editorContentsNotEmpty}
              message={(() => {
                const cancelFiles = (
                  <PseudoLink onClick={() => setSelectedFiles([])}>{_(".submit.cancel_select_files")}</PseudoLink>
                );
                if (selectedIsArchive)
                  return (
                    <>
                      {_(".submit.selected_archive")}
                      {cancelFiles}
                    </>
                  );
                if (selectedFiles.length > 0 && selectedFiles.length !== selectedWantedFiles.length)
                  return (
                    <>
                      {_(".submit.selected_valid_files", {
                        all: selectedFiles.length,
                        valid: selectedWantedFiles.length
                      })}
                      {cancelFiles}
                    </>
                  );
                if (selectedFiles.length > 0)
                  return (
                    <>
                      {_(".submit.selected_files", { all: selectedFiles.length })}
                      {cancelFiles}
                    </>
                  );
                if (editorContentsNotEmpty)
                  return (
                    <>
                      {_(".submit.clear_editor_to_use_upload_left")}
                      <PseudoLink onClick={clearEditor}>{_(".submit.clear_editor")}</PseudoLink>
                      {_(".submit.clear_editor_to_use_upload_right")}
                    </>
                  );
                return _(".submit.fill_in_editor_or_upload_file");
              })()}
              onChange={setSelectedFiles}
            />
          </>
        }
        submitDisabled={!(selectedIsArchive || selectedWantedFiles.length > 0 || editorContentsNotEmpty)}
      />
    </>
  );
};

SubmitAnswerProblemSubmitView = observer(SubmitAnswerProblemSubmitView);

const SubmitAnswerProblemViews: ProblemTypeView<JudgeInfoSubmitAnswer> = {
  Labels: SubmitAnswerProblemLabels,
  SubmitView: SubmitAnswerProblemSubmitView,
  getDefaultSubmissionContent: () => ({}),
  isSubmittable: hasAnySubtaskTestcase,
  enableStatistics: () => false
};

export default SubmitAnswerProblemViews;
