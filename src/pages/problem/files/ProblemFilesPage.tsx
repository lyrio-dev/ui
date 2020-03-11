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
  Progress
} from "semantic-ui-react";
import { Link } from "react-navi";
import { route } from "navi";
import uuid from "uuid/v4";
import lodashIsEqual from "lodash.isequal";
import axios from "axios";
import { WritableStream } from "web-streams-polyfill/ponyfill/es6";
import * as streamsaver from "streamsaver";
import "streamsaver/examples/zip-stream";
import pAll from "p-all";
import { useDebounce } from "use-debounce";

import style from "./ProblemFilesPage.module.less";

import { ProblemApi } from "@/api";
import { appState } from "@/appState";
import toast from "@/utils/toast";
import { useIntlMessage } from "@/utils/hooks";
import getFileIcon from "@/utils/getFileIcon";
import formatFileSize from "@/utils/formatFileSize";
import downloadFile from "@/utils/downloadFile";
import openUploadDialog from "@/utils/openUploadDialog";
import pipeStream from "@/utils/pipeStream";
import { observer } from "mobx-react";

// Firefox have no WritableStream
if (!window.WritableStream) streamsaver.WritableStream = WritableStream;

const MAX_UPLOAD_CONCURRENCY = 5;

async function fetchData(idType: "id" | "displayId", id: number) {
  const { requestError, response } = await ProblemApi.getProblem({
    [idType]: id,
    testData: true,
    additionalFiles: true,
    permissionOfCurrentUser: ["MODIFY"]
  });

  if (requestError || response.error) {
    toast.error(requestError || response.error);
    return null;
  }

  return response;
}

interface FileUploadInfo {
  file: File;
  progressType: "Waiting" | "Hashing" | "Uploading" | "Requesting" | "Error" | "Cancelled";
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
  const _ = useIntlMessage();

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

  const [debouncedUploadProgress, cancelDebouncedUploadProgress, callPendingDebouncedUploadProgress] = useDebounce(
    (props.file.upload && props.file.upload.progress) || 0,
    24,
    {
      maxWait: 24
    }
  );
  if (props.file.upload && props.file.upload.progress === 100) callPendingDebouncedUploadProgress();

  function getUploadStatus() {
    const status = (() => {
      switch (props.file.upload.progressType) {
        case "Waiting":
          return (
            <>
              <Icon name="hourglass half" />
              {_("problem_files.progress_waiting")}
            </>
          );
        case "Hashing":
          return (
            <>
              <Icon name="hashtag" />
              {_("problem_files.progress_hashing", {
                progress: formatProgress(debouncedUploadProgress)
              })}
            </>
          );
        case "Uploading":
          return (
            <>
              <Icon name="cloud upload" />
              {_("problem_files.progress_uploading", {
                progress: formatProgress(debouncedUploadProgress)
              })}
            </>
          );
        case "Requesting":
          return (
            <>
              <Icon name="spinner" />
              {_("problem_files.progress_requesting")}
            </>
          );
        case "Error":
          return (
            <>
              <Icon name="warning sign" />
              {_("problem_files.progress_error")}
            </>
          );
        case "Cancelled":
          return (
            <>
              <Icon name="warning circle" />
              {_("problem_files.progress_cancelled")}
            </>
          );
      }
    })();

    if (props.file.upload.progressType === "Error") {
      return (
        <>
          <Popup trigger={<span>{status}</span>} content={props.file.upload.error} on="hover" position="top center" />
        </>
      );
    } else if (props.file.upload.cancel) {
      return (
        <>
          <Popup
            trigger={<span>{status}</span>}
            content={<Button onClick={props.file.upload.cancel}>{_("problem_files.cancel_upload")}</Button>}
            on="hover"
            hoverable
            position="top center"
          />
        </>
      );
    }
    return status;
  }

  const isMobile = appState.isScreenWidthIn(0, 425 + 1);

  return (
    <>
      <Table.Row>
        <Table.Cell className={style.fileTableColumnFilename}>
          {props.file.upload && props.file.upload.progress != null && (
            <Progress percent={debouncedUploadProgress} indicating />
          )}
          <div className={style.filename}>
            <Checkbox
              className={style.fileTableCheckbox}
              checked={props.selected}
              disabled={!!props.file.upload}
              onChange={(e, { checked }) => props.onSelect(checked)}
            />
            <Icon name={getFileIcon(props.file.filename)} />
            {props.file.filename}
          </div>
        </Table.Cell>
        {!isMobile && <Table.Cell textAlign="center">{formatFileSize(props.file.size)}</Table.Cell>}
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
                          placeholder={_("problem_files.new_filename")}
                          value={newFilename}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewFilename(e.target.value)}
                          onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                            if (e.keyCode === 13) {
                              e.preventDefault();
                              onRename();
                            }
                          }}
                        />
                        <Button primary loading={props.pending} onClick={onRename}>
                          {_("problem_files.rename")}
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
                        {_("problem_files.confirm_delete")}
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
  const _ = useIntlMessage();

  const [selectedFiles, setSelectedFiles] = useState(new Set<string>());

  const nonUploadingFiles = props.files.filter(file => !file.upload);
  useEffect(() => {
    const fileUuids = nonUploadingFiles.map(file => file.uuid);
    const newSelectedFiles = new Set<string>();
    for (const fileUuid of selectedFiles) {
      if (fileUuids.includes(fileUuid)) newSelectedFiles.add(fileUuid);
    }

    if (!lodashIsEqual(selectedFiles, newSelectedFiles)) setSelectedFiles(newSelectedFiles);
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

  const refSelectedInfoDropdown = useRef(null);
  const [selectedInfoDropdownOpen, setSelectedInfoDropdownOpen] = useState(false);
  const [deleteSelectedPending, setDeleteSelectedPending] = useState(false);
  const [popupDeleteSelectedOpen, setPopupDeleteSelectedOpen] = useState(false);

  async function onDeleteSelected() {
    if (deleteSelectedPending) return;
    setDeleteSelectedPending(true);
    await props.onDeleteFiles(selectedFilesArray.map(file => file.filename));
    setPopupDeleteSelectedOpen(false);
    setDeleteSelectedPending(false);
  }

  const isMobile = appState.isScreenWidthIn(0, 425 + 1);

  return (
    <>
      <Table
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
              {_("problem_files.filename")}
            </Table.HeaderCell>
            {!isMobile && (
              <Table.HeaderCell className={style.fileTableColumnSize} textAlign="center">
                {_("problem_files.size")}
              </Table.HeaderCell>
            )}
            <Table.HeaderCell textAlign="center" className={style.fileTableColumnOperations}>
              {props.hasPermission ? _("problem_files.operations_and_status") : _("problem_files.operations")}
            </Table.HeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {props.files.length === 0 ? (
            <Table.Row>
              <Table.HeaderCell colSpan={isMobile ? 2 : 3} textAlign="center" className={style.filesTableNoFiles}>
                <Header>{_("problem_files.no_files")}</Header>
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
                    <Dropdown
                      // Semantic UI doesn't forward ref
                      ref={ref => (refSelectedInfoDropdown.current = ref && (ref as any).ref.current)}
                      open={selectedInfoDropdownOpen}
                      onOpen={() => !popupDeleteSelectedOpen && setSelectedInfoDropdownOpen(true)}
                      onClose={() => setSelectedInfoDropdownOpen(false)}
                      pointing
                      text={_(
                        isMobile
                          ? "problem_files.selected_files_count_and_size_narrow"
                          : "problem_files.selected_files_count_and_size",
                        {
                          count: selectedFilesArray.length.toString(),
                          totalSize: formatFileSize(selectedFilesArray.reduce((sum, file) => sum + file.size, 0))
                        }
                      )}
                    >
                      <Dropdown.Menu className={style.fileTableSelectedFilesDropdownMenu}>
                        <Dropdown.Item
                          icon="download"
                          text={_("problem_files.download_as_archive")}
                          onClick={() => props.onDownloadFilesAsArchive(selectedFilesArray.map(file => file.filename))}
                        />
                        {props.hasPermission && (
                          <Popup
                            trigger={<Dropdown.Item icon="delete" text={_("problem_files.delete")} />}
                            open={popupDeleteSelectedOpen}
                            onOpen={() => setPopupDeleteSelectedOpen(true)}
                            onClose={() => !deleteSelectedPending && setPopupDeleteSelectedOpen(false)}
                            context={refSelectedInfoDropdown}
                            content={
                              <Button negative loading={deleteSelectedPending} onClick={onDeleteSelected}>
                                {_("problem_files.confirm_delete")}
                              </Button>
                            }
                            on="click"
                            position="top center"
                          />
                        )}
                      </Dropdown.Menu>
                    </Dropdown>
                  ) : uploadingCount ? (
                    _(
                      isMobile
                        ? "problem_files.files_count_and_size_with_uploading_narrow"
                        : "problem_files.files_count_and_size_with_uploading",
                      {
                        count: props.files.length.toString(),
                        totalSize: formatFileSize(props.files.reduce((sum, file) => sum + file.size, 0)),
                        uploadingCount: uploadingCount.toString()
                      }
                    )
                  ) : (
                    _(isMobile ? "problem_files.files_count_and_size_narrow" : "problem_files.files_count_and_size", {
                      count: props.files.length.toString(),
                      totalSize: formatFileSize(props.files.reduce((sum, file) => sum + file.size, 0))
                    })
                  )}
                </div>
                {props.hasPermission && (
                  <Popup
                    trigger={
                      <Button
                        className={style.tableFooterButton}
                        icon="upload"
                        content={_("problem_files.upload")}
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
                          <strong>{_("problem_files.confirm_override_question")}</strong>
                        </p>
                        <List>
                          {overridingFiles.map(filename => (
                            <List.Item key={filename} icon={getFileIcon(filename)} content={filename} />
                          ))}
                        </List>
                        <Button
                          onClick={() => {
                            setOverridingFiles([]);
                            refDoUpload.current();
                          }}
                        >
                          {_("problem_files.confirm_override")}
                        </Button>
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
  const _ = useIntlMessage();

  const idString = props.idType === "id" ? `P${props.problem.meta.id}` : `#${props.problem.meta.displayId}`;

  useEffect(() => {
    appState.enterNewPage(`${_("problem_files.title")} ${idString}`);
  }, [appState.locale]);

  function transformResponseToFileTableItems(fileList: ApiTypes.ProblemFileDto[]): FileTableItem[] {
    return fileList.map(file => ({
      uuid: uuid(),
      filename: file.filename,
      size: file.size
    }));
  }

  const stateListTestData = useState(transformResponseToFileTableItems(props.problem.testData));
  const refStateListTestData = useRef(stateListTestData);
  refStateListTestData.current = stateListTestData;
  const fileListTestData = stateListTestData[0];

  const stateListAdditionalFiles = useState(transformResponseToFileTableItems(props.problem.additionalFiles));
  const refStateListAdditionalFiles = useRef(stateListAdditionalFiles);
  refStateListAdditionalFiles.current = stateListAdditionalFiles;
  const fileListAdditionalFiles = stateListAdditionalFiles[0];

  async function onDownloadFile(type: "TestData" | "AdditionalFile", filename: string) {
    const { requestError, response } = await ProblemApi.downloadProblemFiles({
      problemId: props.problem.meta.id,
      type,
      filenameList: [filename]
    });
    if (requestError) {
      toast.error(requestError);
      return;
    }

    downloadFile(response.downloadInfo[0].downloadUrl, filename);
  }

  async function onDownloadFilesAsArchive(type: "TestData" | "AdditionalFile", filenames: string[]) {
    const fileStream = streamsaver.createWriteStream(type + "_" + idString + ".zip");

    const { requestError, response } = await ProblemApi.downloadProblemFiles({
      problemId: props.problem.meta.id,
      type,
      filenameList: filenames
    });
    if (requestError) return toast.error(requestError);
    if (response.error) return toast.error(`problem_files.error.${response.error}`);

    const { downloadInfo } = response;
    let i = 0;
    const zipStream = new (window as any).ZIP({
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

  async function onRenameFile(
    type: "TestData" | "AdditionalFile",
    stateFileList: typeof stateListTestData,
    filename: string,
    newFilename: string
  ) {
    const { requestError, response } = await ProblemApi.renameProblemFile({
      problemId: props.problem.meta.id,
      type,
      filename,
      newFilename
    });
    if (requestError) {
      toast.error(requestError);
      return;
    }

    if (response.error) {
      toast.error(_(`problem_files.error.${response.error}`));
      return;
    }

    // Unpack state object later to prevent from using a dirty value
    const [fileList, setFileList] = stateFileList;
    setFileList(
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
    stateFileList: typeof stateListTestData,
    filenames: string[]
  ) {
    const { requestError, response } = await ProblemApi.removeProblemFiles({
      problemId: props.problem.meta.id,
      type,
      filenames: filenames
    });
    if (requestError) {
      toast.error(requestError);
      return;
    }

    if (response.error) {
      toast.error(_(`problem_files.error.${response.error}`));
      return;
    }

    // Unpack state object later to prevent from using a dirty value
    const [fileList, setFileList] = stateFileList;
    setFileList(fileList.filter(file => !filenames.includes(file.filename)));
  }

  async function onUploadFiles(
    type: "TestData" | "AdditionalFile",
    refStateFileList: typeof refStateListTestData,
    files: File[]
  ) {
    const [fileList, setFileList] = refStateFileList.current;

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
      const [fileList, setFileList] = refStateFileList.current;
      const newFileList = Array.from(fileList);
      for (const i in newFileList) {
        if (newFileList[i].uuid === fileUuid) {
          newFileList[i] = Object.assign({}, fileList[i], {
            upload: uploadInfo ? Object.assign({}, fileList[i].upload, uploadInfo) : null
          });
          setFileList(newFileList);
          break;
        }
      }
    }

    const uploadTasks: Array<() => Promise<void>> = [];
    for (const item of uploadingFileList) {
      uploadTasks.push(async () => {
        try {
          updateFileUploadInfo(item.uuid, {
            progressType: "Requesting",
            progress: 0
          });

          let uuid: string;
          async function tryAddFile(beforeDoUpload: boolean) {
            const { requestError, response } = await ProblemApi.addProblemFile({
              problemId: props.problem.meta.id,
              type,
              size: item.upload.file.size,
              filename: item.filename,
              uuid: uuid
            });
            if (requestError) throw requestError;

            if (response.uploadInfo && beforeDoUpload) {
              return response.uploadInfo;
            }

            if (response.error) throw _(`problem_files.error.${response.error}`);

            return null;
          }

          const uploadUrlInfo = await tryAddFile(true);
          if (uploadUrlInfo) {
            // If upload is required
            const cancelTokenSource = axios.CancelToken.source();
            let cancelled = false;
            const cancel = () => {
              if (cancelled) return;
              cancelled = true;
              cancelTokenSource.cancel();
            };

            uuid = uploadUrlInfo.uuid;

            try {
              if (uploadUrlInfo.method === "PUT") {
                await axios.put(uploadUrlInfo.url, item.upload.file, {
                  cancelToken: cancelTokenSource.token,
                  onUploadProgress: e =>
                    updateFileUploadInfo(item.uuid, {
                      progressType: "Uploading",
                      progress: (e.loaded / e.total) * 100,
                      cancel
                    })
                });
              } else {
                const formData = new FormData();
                Object.entries(uploadUrlInfo.extraFormData).forEach(([key, value]) =>
                  formData.append(key, value as string)
                );
                formData.append(uploadUrlInfo.fileFieldName, item.upload.file);
                await axios.post(uploadUrlInfo.url, formData, {
                  cancelToken: cancelTokenSource.token,
                  onUploadProgress: e =>
                    updateFileUploadInfo(item.uuid, {
                      progressType: "Uploading",
                      progress: (e.loaded / e.total) * 100,
                      cancel
                    })
                });
              }
            } catch (e) {
              if (cancelled) {
                updateFileUploadInfo(item.uuid, {
                  progressType: "Cancelled",
                  cancel: null
                });
                return;
              }

              throw e;
            }

            updateFileUploadInfo(item.uuid, {
              progressType: "Requesting",
              progress: 100
            });

            await tryAddFile(false);
          }

          updateFileUploadInfo(item.uuid, null);
        } catch (e) {
          console.log("Error uploading file", e);
          updateFileUploadInfo(item.uuid, {
            progressType: "Error",
            error: e.toString()
          });
        }
      });
    }

    await pAll(uploadTasks, {
      concurrency: MAX_UPLOAD_CONCURRENCY
    });
  }

  const isWideScreen = appState.isScreenWidthIn(960, Infinity);

  const fileTableTestdata = (
    <>
      <Header as="h2">
        <strong>{_("problem_files.header_testdata")}</strong>
        <Button
          className={style.back_to_problem}
          primary
          as={Link}
          href={
            props.idType === "id"
              ? `/problem/by-id/${props.problem.meta.id}`
              : `/problem/${props.problem.meta.displayId}`
          }
          content={_("problem_files.back_to_problem")}
        />
      </Header>
      <FileTable
        hasPermission={props.problem.permissionOfCurrentUser.MODIFY}
        color="green"
        files={fileListTestData}
        onDownloadFile={filename => onDownloadFile("TestData", filename)}
        onDownloadFilesAsArchive={filenames => onDownloadFilesAsArchive("TestData", filenames)}
        onRenameFile={(filename, newFilename) => onRenameFile("TestData", stateListTestData, filename, newFilename)}
        onDeleteFiles={filenames => onDeleteFiles("TestData", stateListTestData, filenames)}
        onUploadFiles={files => onUploadFiles("TestData", refStateListTestData, files)}
      />
    </>
  );

  const fileTableAdditionalFile = (
    <>
      <Header as="h2">
        <strong>{_("problem_files.header_additional_files")}</strong>
      </Header>
      <FileTable
        hasPermission={props.problem.permissionOfCurrentUser.MODIFY}
        color="pink"
        files={fileListAdditionalFiles}
        onDownloadFile={filename => onDownloadFile("AdditionalFile", filename)}
        onDownloadFilesAsArchive={filenames => onDownloadFilesAsArchive("AdditionalFile", filenames)}
        onRenameFile={(filename, newFilename) =>
          onRenameFile("AdditionalFile", stateListAdditionalFiles, filename, newFilename)
        }
        onDeleteFiles={filenames => onDeleteFiles("AdditionalFile", stateListAdditionalFiles, filenames)}
        onUploadFiles={files => onUploadFiles("AdditionalFile", refStateListAdditionalFiles, files)}
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
  byId: route({
    async getView(request) {
      const id = parseInt(request.params["id"]);
      const problem = await fetchData("id", id);
      if (problem === null) {
        // TODO: Display an error page
        return null;
      }

      return <ProblemFilesPage key={Math.random()} idType="id" problem={problem} />;
    }
  }),
  byDisplayId: route({
    async getView(request) {
      const displayId = parseInt(request.params["displayId"]);
      const problem = await fetchData("displayId", displayId);
      if (problem === null) {
        // TODO: Display an error page
        return null;
      }

      return <ProblemFilesPage key={Math.random()} idType="displayId" problem={problem} />;
    }
  })
};
