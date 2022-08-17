import React, { useEffect, useState, useRef } from "react";
import {
  Dropdown,
  Grid,
  Icon,
  Header,
  Popup,
  Button,
  Form,
  Checkbox,
  List,
  Table,
  SemanticCOLORS,
  Progress,
  Ref
} from "semantic-ui-react";
import { v4 as uuid } from "uuid";
import isEqual from "lodash/isEqual";
import streamsaver from "streamsaver";
import pAll from "p-all";
import { useDebounce } from "use-debounce";

import style from "./ProblemFilesPage.module.less";

import api from "@/api";
import { appState } from "@/appState";
import toast from "@/utils/toast";
import { useAsyncCallbackPending, useLocalizer, useRecaptcha, useScreenWidthWithin, Link } from "@/utils/hooks";
import getFileIcon from "@/utils/getFileIcon";
import formatFileSize from "@/utils/formatFileSize";
import downloadFile from "@/utils/downloadFile";
import openUploadDialog from "@/utils/openUploadDialog";
import pipeStream from "@/utils/pipeStream";
import { observer } from "mobx-react";
import { defineRoute, RouteError } from "@/AppRouter";
import { callApiWithFileUpload } from "@/utils/callApiWithFileUpload";
import { createZipStream } from "@/utils/zip";
import { getProblemIdString, getProblemUrl } from "../utils";
import { onEnterPress } from "@/utils/onEnterPress";
import { isValidFilename } from "@/utils/validators";
import { Localizer, makeToBeLocalizedText } from "@/locales";
import { EmojiRenderer } from "@/components/EmojiRenderer";

// Firefox have no WritableStream
if (!window.WritableStream || true) {
  (streamsaver as any).WritableStream = (await import("web-streams-polyfill/ponyfill/es6")).WritableStream;
}
if (window.apiEndpoint.toLowerCase().startsWith("https://")) {
  (streamsaver as any).mitm = `${window.apiEndpoint}api/cors/streamsaver/mitm.html`;
}

export async function downloadProblemFile(
  problemId: number,
  type: "TestData" | "AdditionalFile",
  filename: string,
  _: Localizer
) {
  if (!filename) return toast.error(_("problem_files.error.NO_SUCH_FILE"));

  const { requestError, response } = await api.problem.downloadProblemFiles({
    problemId,
    type,
    filenameList: [filename]
  });
  if (requestError) return toast.error(requestError(_));
  else if (response.downloadInfo.length === 0) return toast.error(_("problem_files.error.NO_SUCH_FILE"));

  downloadFile(response.downloadInfo[0].downloadUrl);
}

export async function downloadProblemFilesAsArchive(
  problemId: number,
  filename: string,
  type: "TestData" | "AdditionalFile",
  filenames: string[],
  _: Localizer
) {
  const { requestError, response } = await api.problem.downloadProblemFiles({
    problemId,
    type,
    filenameList: filenames
  });
  if (requestError) return toast.error(requestError(_));
  if (response.error) return toast.error(_(`problem_files.error.${response.error}`));

  const { downloadInfo } = response;

  if (downloadInfo.length === 0) return toast.error(_("problem_files.no_files_to_download"));

  const fileStream = streamsaver.createWriteStream(filename);
  let i = 0;
  const zipStream = createZipStream({
    async pull(ctrl) {
      if (i == downloadInfo.length) return ctrl.close();

      try {
        const response = await fetch(downloadInfo[i].downloadUrl);
        if (!response.ok) {
          throw response.statusText;
        }

        ctrl.enqueue({
          name: downloadInfo[i].filename,
          stream: () => response.body
        });
      } catch (e) {
        stopDownload();
        toast.error(
          _("problem_files.download_as_archive_error", {
            filename: downloadInfo[i].filename,
            error: e.toString()
          })
        );
      }

      i++;
    }
  });

  const abortCallbackReceiver: { abort?: () => void } = {};

  function stopDownload() {
    abortCallbackReceiver.abort();
  }

  // If we are on an insecure context, StreamSaver will use a MITM page to download the file
  // a beforeunload event is triggered by the library (not a user), so ignore it
  let isBeforeUnloadTriggeredByLibrary = !window.isSecureContext;
  function onBeforeUnload(e: BeforeUnloadEvent) {
    if (isBeforeUnloadTriggeredByLibrary) {
      isBeforeUnloadTriggeredByLibrary = false;
      return;
    }
    e.returnValue = "";
  }

  window.addEventListener("unload", stopDownload);
  window.addEventListener("beforeunload", onBeforeUnload);

  await pipeStream(zipStream, fileStream, abortCallbackReceiver);

  window.removeEventListener("unload", stopDownload);
  window.removeEventListener("beforeunload", onBeforeUnload);
}

const MAX_UPLOAD_CONCURRENCY = 5;

async function fetchData(idType: "id" | "displayId", id: number) {
  const { requestError, response } = await api.problem.getProblem({
    [idType]: id,
    testData: true,
    additionalFiles: true,
    permissionOfCurrentUser: true
  });

  if (requestError) throw new RouteError(requestError, { showRefresh: true, showBack: true });
  else if (response.error) throw new RouteError(makeToBeLocalizedText(`problem_files.error.${response.error}`));

  return response;
}

interface FileUploadInfo {
  file: File;
  progressType: "Waiting" | "Uploading" | "Retrying" | "Requesting" | "Error" | "Cancelled";
  cancel?: () => void;
  progress?: number;
  error?: string;
}

interface FileTableItem {
  uuid: string;
  filename: string;
  size: number;
  upload?: FileUploadInfo;
}

interface FileTableRowProps {
  file: FileTableItem;
  hasPermission: boolean;
  selected: boolean;
  pending: boolean;
  onSelect: (checked: boolean) => void;
  onDownload: () => void;
  onRename: (newFilename: string) => Promise<void>;
  onDelete: () => Promise<void>;
}

let FileTableRow: React.FC<FileTableRowProps> = props => {
  const _ = useLocalizer("problem_files");

  const [renameOpen, setRenameOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const [newFilename, setNewFilename] = useState(props.file.filename);

  async function onRename() {
    await props.onRename(newFilename);
    setRenameOpen(false);
  }

  async function onDelete() {
    await props.onDelete();
    setDeleteOpen(false);
  }

  function formatProgress(progress: number) {
    const str = progress.toFixed(1);
    if (str === "100.0") return "100";
    return str;
  }

  const [debouncedUploadProgress, debouncedUploadProgressControlFunctions] = useDebounce(
    (props.file.upload && props.file.upload.progress) || 0,
    24,
    {
      maxWait: 24
    }
  );
  if (props.file.upload && props.file.upload.progress === 100) debouncedUploadProgressControlFunctions.flush();

  function getUploadStatus() {
    const status = (() => {
      switch (props.file.upload.progressType) {
        case "Waiting":
          return (
            <>
              <Icon name="hourglass half" />
              {_(".progress_waiting")}
            </>
          );
        case "Uploading":
          return (
            <>
              <Icon name="cloud upload" />
              {_(".progress_uploading", {
                progress: formatProgress(debouncedUploadProgress)
              })}
            </>
          );
        case "Retrying":
          return (
            <>
              <Icon name="redo" />
              {_(".progress_retrying")}
            </>
          );
        case "Requesting":
          return (
            <>
              <Icon name="spinner" />
              {_(".progress_requesting")}
            </>
          );
        case "Error":
          return (
            <>
              <Icon name="warning sign" />
              {_(".progress_error")}
            </>
          );
        case "Cancelled":
          return (
            <>
              <Icon name="warning circle" />
              {_(".progress_cancelled")}
            </>
          );
      }
    })();

    if (props.file.upload.progressType === "Error") {
      return (
        <>
          <Popup
            trigger={<span>{status}</span>}
            hoverable
            content={props.file.upload.error}
            on="hover"
            position="top center"
          />
        </>
      );
    } else if (props.file.upload.cancel) {
      return (
        <>
          <Popup
            trigger={<span>{status}</span>}
            content={<Button onClick={props.file.upload.cancel}>{_(".cancel_upload")}</Button>}
            on="hover"
            hoverable
            position="top center"
          />
        </>
      );
    }
    return status;
  }

  const isMobile = useScreenWidthWithin(0, 425 + 1);

  return (
    <>
      <Table.Row>
        <Table.Cell className={style.fileTableColumnFilename}>
          {props.file.upload && props.file.upload.progress != null && (
            <Progress percent={debouncedUploadProgress} indicating />
          )}
          <EmojiRenderer>
            <div className={style.filename}>
              <Checkbox
                className={style.fileTableCheckbox}
                checked={props.selected}
                disabled={!!props.file.upload}
                onChange={(e, { checked }) => props.onSelect(checked)}
              />
              <Icon name={getFileIcon(props.file.filename)} />
              {"\u200E" + props.file.filename}
            </div>
          </EmojiRenderer>
        </Table.Cell>
        {!isMobile && <Table.Cell textAlign="center">{formatFileSize(props.file.size, 1)}</Table.Cell>}
        <Table.Cell className={style.fileTableColumnOperations} textAlign="center">
          {props.file.upload ? (
            getUploadStatus()
          ) : (
            <>
              <Icon className={style.fileTableOperationIcon} name="download" onClick={() => props.onDownload()} />
              {props.hasPermission && (
                <>
                  <Popup
                    trigger={
                      <Icon disabled={props.pending} className={style.fileTableOperationIcon} name="pencil alternate" />
                    }
                    disabled={props.pending}
                    open={renameOpen}
                    onOpen={() => setRenameOpen(true)}
                    onClose={() => !props.pending && setRenameOpen(false)}
                    content={
                      <Form>
                        <Form.Input
                          style={{ width: 230 }}
                          placeholder={_(".new_filename")}
                          value={newFilename}
                          onChange={(e, { value }) => setNewFilename(value)}
                          onKeyPress={onEnterPress(() => onRename())}
                        />
                        <Button primary loading={props.pending} onClick={onRename}>
                          {_(".rename")}
                        </Button>
                      </Form>
                    }
                    on="click"
                    position="top center"
                  />
                  <Popup
                    trigger={<Icon disabled={props.pending} className={style.fileTableOperationIcon} name="delete" />}
                    disabled={props.pending}
                    open={deleteOpen}
                    onOpen={() => setDeleteOpen(true)}
                    onClose={() => !props.pending && setDeleteOpen(false)}
                    content={
                      <Button negative loading={props.pending} onClick={onDelete}>
                        {_(".confirm_delete")}
                      </Button>
                    }
                    on="click"
                    position="top center"
                  />
                </>
              )}
            </>
          )}
        </Table.Cell>
      </Table.Row>
    </>
  );
};

FileTableRow = observer(FileTableRow);

interface FileTableProps {
  hasPermission: boolean;
  color: SemanticCOLORS;
  files: FileTableItem[];
  onDownloadFile: (filename: string) => void;
  onDownloadFilesAsArchive: (filenames: string[]) => void;
  onRenameFile: (filename: string, newFilename: string) => Promise<void>;
  onDeleteFiles: (filenames: string[]) => Promise<void>;
  onUploadFiles: (files: File[]) => void;
}

let FileTable: React.FC<FileTableProps> = props => {
  const _ = useLocalizer("problem_files");

  const [selectedFiles, setSelectedFiles] = useState(new Set<string>());

  const nonUploadingFiles = props.files.filter(file => !file.upload);
  useEffect(() => {
    const fileUuids = nonUploadingFiles.map(file => file.uuid);
    const newSelectedFiles = new Set<string>();
    for (const fileUuid of selectedFiles) {
      if (fileUuids.includes(fileUuid)) newSelectedFiles.add(fileUuid);
    }

    if (!isEqual(selectedFiles, newSelectedFiles)) setSelectedFiles(newSelectedFiles);
  }, [props.files]);

  function onSelectAll(checked: boolean) {
    setSelectedFiles(new Set(checked ? nonUploadingFiles.map(file => file.uuid) : []));
  }

  function onSelect(fileUuid: string, checked: boolean) {
    const newSelectedFiles = new Set(selectedFiles);
    if (checked) newSelectedFiles.add(fileUuid);
    else newSelectedFiles.delete(fileUuid);
    setSelectedFiles(newSelectedFiles);
  }

  const selectedFilesArray = props.files.filter(file => selectedFiles.has(file.uuid));

  const [pendingFiles, setPendingFiles] = useState(new Set<string>());
  function setPending(fileUuids: string | string[], pending: boolean) {
    const newPendingFiles = new Set(pendingFiles);

    if (typeof fileUuids === "string") fileUuids = [fileUuids];

    for (const fileUuid of fileUuids) {
      if (pending) newPendingFiles.add(fileUuid);
      else newPendingFiles.delete(fileUuid);
    }

    setPendingFiles(newPendingFiles);
  }

  async function onRename(fileUuid: string, filename: string, newFilename: string) {
    if (pendingFiles.has(fileUuid)) return;
    setPending(fileUuid, true);
    await props.onRenameFile(filename, newFilename);
    setPending(fileUuid, false);
  }

  async function onDelete(fileUuids: string[], filenames: string[]) {
    if (fileUuids.some(fileUuid => pendingFiles.has(fileUuid))) return;
    setPending(fileUuids, true);
    await props.onDeleteFiles(filenames);
    setPending(fileUuids, false);
  }

  const uploadingCount = props.files.filter(
    file => file.upload && file.upload.progressType !== "Error" && file.upload.progressType !== "Cancelled"
  ).length;

  const [overridingFiles, setOverridingFiles] = useState<string[]>([]);
  const refDoUpload = useRef<() => void>();
  async function onUploadButtonClick() {
    if (uploadingCount) return;

    openUploadDialog(files => {
      if (files.some(file => !isValidFilename(file.name))) {
        // This shouldn't happen
        toast.error(_(".invalid_filename"));
        return;
      }

      const doUpload = () => props.onUploadFiles(files);

      // Cancelled and Error uploads will not be shown as overriding
      const currentFilenames = props.files.filter(file => !file.upload).map(file => file.filename);
      const overriding = files.map(file => file.name).filter(filename => currentFilenames.includes(filename));
      if (overriding.length > 0) {
        setOverridingFiles(overriding);
        refDoUpload.current = doUpload;
      } else doUpload();
    });
  }

  const [refSelectedInfoDropdown, setRefSelectedInfoDropdown] = useState<HTMLElement>(null);
  const [selectedInfoDropdownOpen, setSelectedInfoDropdownOpen] = useState(false);
  const [popupDeleteSelectedOpen, setPopupDeleteSelectedOpen] = useState(false);
  const [deleteSelectedPending, onDeleteSelected] = useAsyncCallbackPending(async () => {
    await props.onDeleteFiles(selectedFilesArray.map(file => file.filename));
    setPopupDeleteSelectedOpen(false);
  });

  const isMobile = useScreenWidthWithin(0, 425 + 1);

  return (
    <>
      <Table
        compact
        color={props.color}
        className={style.fileTable + (!props.hasPermission ? " " + style.noManagePermission : "")}
        unstackable
      >
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell>
              <Checkbox
                className={style.fileTableCheckbox}
                checked={selectedFiles.size > 0}
                indeterminate={selectedFiles.size > 0 && selectedFiles.size < nonUploadingFiles.length}
                disabled={deleteSelectedPending}
                onChange={(e, { checked }) => onSelectAll(checked)}
              />
              {_(".filename")}
            </Table.HeaderCell>
            {!isMobile && (
              <Table.HeaderCell className={style.fileTableColumnSize} textAlign="center">
                {_(".size")}
              </Table.HeaderCell>
            )}
            <Table.HeaderCell textAlign="center" className={style.fileTableColumnOperations}>
              {props.hasPermission ? _(".operations_and_status") : _(".operations")}
            </Table.HeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {props.files.length === 0 ? (
            <Table.Row>
              <Table.HeaderCell colSpan={isMobile ? 2 : 3} textAlign="center" className={style.filesTableNoFiles}>
                <Header>{_(".no_files")}</Header>
              </Table.HeaderCell>
            </Table.Row>
          ) : (
            props.files.map(file => (
              <FileTableRow
                key={file.uuid}
                file={file}
                hasPermission={props.hasPermission}
                selected={selectedFiles.has(file.uuid)}
                pending={pendingFiles.has(file.uuid)}
                onSelect={checked => onSelect(file.uuid, checked)}
                onDownload={() => props.onDownloadFile(file.filename)}
                onRename={newFilename => onRename(file.uuid, file.filename, newFilename)}
                onDelete={() => onDelete([file.uuid], [file.filename])}
              />
            ))
          )}
        </Table.Body>
        <Table.Footer fullWidth>
          <Table.Row>
            <Table.HeaderCell colSpan={isMobile ? 2 : 3}>
              <div className={style.fileTableFooterInfo}>
                <div className={style.tableFooterText}>
                  {selectedFilesArray.length > 0 ? (
                    <Ref innerRef={setRefSelectedInfoDropdown}>
                      <Dropdown
                        open={selectedInfoDropdownOpen}
                        onOpen={() => !popupDeleteSelectedOpen && setSelectedInfoDropdownOpen(true)}
                        onClose={() => setSelectedInfoDropdownOpen(false)}
                        pointing
                        text={_(isMobile ? ".selected_files_count_and_size_narrow" : ".selected_files_count_and_size", {
                          count: selectedFilesArray.length.toString(),
                          totalSize: formatFileSize(
                            selectedFilesArray.reduce((sum, file) => sum + file.size, 0),
                            1
                          )
                        })}
                      >
                        <Dropdown.Menu className={style.fileTableSelectedFilesDropdownMenu}>
                          <Dropdown.Item
                            icon="download"
                            text={_(".download_as_archive")}
                            onClick={() =>
                              props.onDownloadFilesAsArchive(selectedFilesArray.map(file => file.filename))
                            }
                          />
                          {props.hasPermission && (
                            <Popup
                              trigger={<Dropdown.Item icon="delete" text={_(".delete")} />}
                              open={popupDeleteSelectedOpen}
                              onOpen={() => setPopupDeleteSelectedOpen(true)}
                              onClose={() => !deleteSelectedPending && setPopupDeleteSelectedOpen(false)}
                              context={refSelectedInfoDropdown}
                              content={
                                <Button negative loading={deleteSelectedPending} onClick={onDeleteSelected}>
                                  {_(".confirm_delete")}
                                </Button>
                              }
                              on="click"
                              position="top center"
                            />
                          )}
                        </Dropdown.Menu>
                      </Dropdown>
                    </Ref>
                  ) : uploadingCount ? (
                    _(
                      isMobile ? ".files_count_and_size_with_uploading_narrow" : ".files_count_and_size_with_uploading",
                      {
                        count: props.files.length.toString(),
                        totalSize: formatFileSize(
                          props.files.reduce((sum, file) => sum + file.size, 0),
                          1
                        ),
                        uploadingCount: uploadingCount.toString()
                      }
                    )
                  ) : (
                    _(isMobile ? ".files_count_and_size_narrow" : ".files_count_and_size", {
                      count: props.files.length.toString(),
                      totalSize: formatFileSize(
                        props.files.reduce((sum, file) => sum + file.size, 0),
                        1
                      )
                    })
                  )}
                </div>
                {props.hasPermission && (
                  <Popup
                    trigger={
                      <Button
                        className={style.tableFooterButton}
                        icon="upload"
                        content={_(".upload")}
                        labelPosition="left"
                        primary
                        size={"small"}
                        loading={uploadingCount !== 0}
                        onClick={onUploadButtonClick}
                      />
                    }
                    open={overridingFiles.length !== 0}
                    onClose={() => setOverridingFiles([])}
                    content={
                      <>
                        <p>
                          <strong>{_(".confirm_override_question")}</strong>
                        </p>
                        <List>
                          {overridingFiles.map(filename => (
                            <EmojiRenderer key={filename}>
                              <List.Item icon={getFileIcon(filename)} content={filename} />
                            </EmojiRenderer>
                          ))}
                        </List>
                        <Ref innerRef={button => button && window.requestAnimationFrame(() => button.focus())}>
                          <Button
                            onClick={() => {
                              setOverridingFiles([]);
                              refDoUpload.current();
                            }}
                          >
                            {_(".confirm_override")}
                          </Button>
                        </Ref>
                      </>
                    }
                    on="click"
                    position="left center"
                  />
                )}
              </div>
            </Table.HeaderCell>
          </Table.Row>
        </Table.Footer>
      </Table>
    </>
  );
};

FileTable = observer(FileTable);

interface ProblemFilesPageProps {
  idType?: "id" | "displayId";
  problem?: ApiTypes.GetProblemResponseDto;
}

let ProblemFilesPage: React.FC<ProblemFilesPageProps> = props => {
  const _ = useLocalizer("problem_files");

  const idString = getProblemIdString(props.problem.meta);

  useEffect(() => {
    appState.enterNewPage(`${_(".title")} ${idString}`, "problem_set");
  }, [appState.locale, props.problem]);

  const recaptcha = useRecaptcha();

  function transformResponseToFileTableItems(fileList: ApiTypes.ProblemFileDto[]): FileTableItem[] {
    return fileList.map(file => ({
      uuid: uuid(),
      filename: file.filename,
      size: file.size
    }));
  }

  const [fileListTestData, setFileListTestData] = useState(transformResponseToFileTableItems(props.problem.testData));
  const [fileListAdditionalFiles, setFileListAdditionalFiles] = useState(
    transformResponseToFileTableItems(props.problem.additionalFiles)
  );

  async function onRenameFile(
    type: "TestData" | "AdditionalFile",
    setFileList: typeof setFileListTestData,
    filename: string,
    newFilename: string
  ) {
    if (!isValidFilename(newFilename)) {
      toast.error(_(".invalid_filename"));
      return;
    }

    const { requestError, response } = await api.problem.renameProblemFile({
      problemId: props.problem.meta.id,
      type,
      filename,
      newFilename
    });
    if (requestError) {
      toast.error(requestError(_));
      return;
    }

    if (response.error) {
      toast.error(_(`.error.${response.error}`));
      return;
    }

    // Unpack state object later to prevent from using a dirty value
    setFileList(fileList =>
      fileList.map(file =>
        file.filename !== filename
          ? file
          : Object.assign({}, file, {
              filename: newFilename
            })
      )
    );
  }

  async function onDeleteFiles(
    type: "TestData" | "AdditionalFile",
    setFileList: typeof setFileListTestData,
    filenames: string[]
  ) {
    const { requestError, response } = await api.problem.removeProblemFiles({
      problemId: props.problem.meta.id,
      type,
      filenames: filenames
    });
    if (requestError) {
      toast.error(requestError(_));
      return;
    }

    if (response.error) {
      toast.error(_(`.error.${response.error}`));
      return;
    }

    // Unpack state object later to prevent from using a dirty value
    setFileList(fileList => fileList.filter(file => !filenames.includes(file.filename)));
  }

  async function onUploadFiles(
    type: "TestData" | "AdditionalFile",
    fileList: typeof fileListTestData,
    setFileList: typeof setFileListTestData,
    files: File[]
  ) {
    const uploadingFilenames = files.map(file => file.name);
    const uploadingFileList: FileTableItem[] = [];
    for (const file of files) {
      uploadingFileList.push({
        uuid: uuid(),
        filename: file.name,
        size: file.size,
        upload: {
          file: file,
          progressType: "Waiting"
        }
      });
    }
    const newFileList = fileList.filter(file => !uploadingFilenames.includes(file.filename)).concat(uploadingFileList);
    setFileList(newFileList);

    function updateFileUploadInfo(fileUuid: string, uploadInfo: Partial<FileUploadInfo>) {
      setFileList(fileList => {
        const newFileList = Array.from(fileList);
        for (const i in newFileList) {
          if (newFileList[i].uuid === fileUuid) {
            newFileList[i] = Object.assign({}, fileList[i], {
              upload: uploadInfo ? Object.assign({}, fileList[i].upload, uploadInfo) : null
            });
            return newFileList;
          }
        }
        return fileList;
      });
    }

    const uploadTasks: Array<() => Promise<void>> = [];
    for (const item of uploadingFileList) {
      uploadTasks.push(async () => {
        const { uploadCancelled, uploadError, requestError, response } = await callApiWithFileUpload(
          api.problem.addProblemFile,
          {
            problemId: props.problem.meta.id,
            type,
            filename: item.filename
          },
          () => recaptcha("AddProblemFile"),
          item.upload.file,
          progress =>
            updateFileUploadInfo(item.uuid, {
              progressType: progress.status,
              progress: progress.progress * 100
            }),
          cancelFunction =>
            updateFileUploadInfo(item.uuid, {
              cancel: cancelFunction
            })
        );

        if (uploadCancelled) {
          updateFileUploadInfo(item.uuid, {
            progressType: "Cancelled",
            cancel: null
          });
        } else if (uploadError) {
          console.log("Error uploading file", uploadError);
          updateFileUploadInfo(item.uuid, {
            progressType: "Error",
            error: String(uploadError)
          });
        } else if (requestError) {
          updateFileUploadInfo(item.uuid, {
            progressType: "Error",
            error: requestError(_)
          });
        } else if (response.error) {
          updateFileUploadInfo(item.uuid, {
            progressType: "Error",
            error: _(`.error.${response.error}`)
          });
        } else updateFileUploadInfo(item.uuid, null);
      });
    }

    await pAll(uploadTasks, {
      concurrency: MAX_UPLOAD_CONCURRENCY
    });
  }

  const isWideScreen = useScreenWidthWithin(960, Infinity);

  const fileTableTestdata = (
    <>
      <Header
        className={style.header + " withIcon"}
        icon="file alternate"
        as="h2"
        content={
          <>
            {_(".header_testdata")}
            <Button
              className={style.backToProblem}
              primary
              as={Link}
              href={getProblemUrl(props.problem.meta)}
              content={_(".back_to_problem")}
            />
          </>
        }
      />
      <FileTable
        hasPermission={props.problem.permissionOfCurrentUser.includes("Modify")}
        color="green"
        files={fileListTestData}
        onDownloadFile={filename => downloadProblemFile(props.problem.meta.id, "TestData", filename, _)}
        onDownloadFilesAsArchive={filenames =>
          downloadProblemFilesAsArchive(props.problem.meta.id, `TestData_${idString}.zip`, "TestData", filenames, _)
        }
        onRenameFile={(filename, newFilename) => onRenameFile("TestData", setFileListTestData, filename, newFilename)}
        onDeleteFiles={filenames => onDeleteFiles("TestData", setFileListTestData, filenames)}
        onUploadFiles={files => onUploadFiles("TestData", fileListTestData, setFileListTestData, files)}
      />
    </>
  );

  const fileTableAdditionalFile = (
    <>
      <Header
        className={style.header + " withIcon"}
        icon="file alternate outline"
        as="h2"
        content={_(".header_additional_files")}
      />
      <FileTable
        hasPermission={props.problem.permissionOfCurrentUser.includes("Modify")}
        color="pink"
        files={fileListAdditionalFiles}
        onDownloadFile={filename => downloadProblemFile(props.problem.meta.id, "AdditionalFile", filename, _)}
        onDownloadFilesAsArchive={filenames =>
          downloadProblemFilesAsArchive(
            props.problem.meta.id,
            `AdditionalFile_${idString}.zip`,
            "AdditionalFile",
            filenames,
            _
          )
        }
        onRenameFile={(filename, newFilename) =>
          onRenameFile("AdditionalFile", setFileListAdditionalFiles, filename, newFilename)
        }
        onDeleteFiles={filenames => onDeleteFiles("AdditionalFile", setFileListAdditionalFiles, filenames)}
        onUploadFiles={files =>
          onUploadFiles("AdditionalFile", fileListAdditionalFiles, setFileListAdditionalFiles, files)
        }
      />
    </>
  );

  return (
    <>
      <Grid>
        {isWideScreen ? (
          <>
            <Grid.Row>
              <Grid.Column width={8}>{fileTableTestdata}</Grid.Column>
              <Grid.Column width={8}>{fileTableAdditionalFile}</Grid.Column>
            </Grid.Row>
          </>
        ) : (
          <>
            <Grid.Row>
              <Grid.Column width={16}>{fileTableTestdata}</Grid.Column>
            </Grid.Row>
            <Grid.Row>
              <Grid.Column width={16}>{fileTableAdditionalFile}</Grid.Column>
            </Grid.Row>
          </>
        )}
      </Grid>
    </>
  );
};

ProblemFilesPage = observer(ProblemFilesPage);

export default {
  byId: defineRoute(async request => {
    const id = parseInt(request.params["id"]);
    const problem = await fetchData("id", id);

    return <ProblemFilesPage key={uuid()} idType="id" problem={problem} />;
  }),
  byDisplayId: defineRoute(async request => {
    const displayId = parseInt(request.params["displayId"]);
    const problem = await fetchData("displayId", displayId);

    return <ProblemFilesPage key={uuid()} idType="displayId" problem={problem} />;
  })
};
