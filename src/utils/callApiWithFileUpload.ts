import Axios from "axios";

import { ApiResponse } from "@/api";

export interface ApiResponseWithUploadResult<T extends { error?: string }> {
  uploadCancelled?: boolean;
  uploadError?: any;
  requestError?: ApiResponse<T>["requestError"];
  response?: Omit<T, "signedUploadRequest">;
}

export interface FileUploadApiProgress {
  status: "Requesting" | "Uploading";
  progress: number;
}

// Workaround: xdomain's FormData doesn't set [Symbol.toStringTag] to "FormData"
//             so axios doesn't treat it as FormData
//             see https://github.com/axios/axios/blob/c9aca7525703ab600eacd9e95fd7f6ecc9942616/lib/utils.js#L56
if (FormData.prototype[Symbol.toStringTag] !== "FormData") FormData.prototype[Symbol.toStringTag] = "FormData";

export async function callApiWithFileUpload<
  Request extends { uploadInfo?: ApiTypes.FileUploadInfoDto },
  Response extends { error?: string; signedUploadRequest?: ApiTypes.SignedFileUploadRequestDto }
>(
  api: (request: Request, recaptchaTokenPromise: Promise<string>) => Promise<ApiResponse<Response>>,
  request: Omit<Request, "uploadInfo">,
  getRecaptchaToken: () => Promise<string>,
  file: Blob,
  progressCallback?: (progress: FileUploadApiProgress) => void,
  cancelFunctionReceiver?: (cancelFunction: () => void) => void
): Promise<ApiResponseWithUploadResult<Response>> {
  if (progressCallback) progressCallback({ status: "Requesting", progress: 0 });

  const result = await api(
    {
      ...request,
      uploadInfo: file
        ? {
            size: file.size,
            uuid: null
          }
        : null
    } as Request,
    getRecaptchaToken()
  );
  if (result.requestError) return result;

  if (result.response.signedUploadRequest) {
    // Upload is required

    const cancelTokenSource = Axios.CancelToken.source();
    let isCancelled = false;
    const cancelFunction = () => {
      if (isCancelled) return;
      isCancelled = true;
      cancelTokenSource.cancel();
    };

    if (cancelFunctionReceiver) cancelFunctionReceiver(cancelFunction);

    let error = false;
    function onUploadProgress(e: ProgressEvent<EventTarget>) {
      // setTimeout is a workaround for Axios triggers a "progress" event with 100% loaded after error

      if (progressCallback)
        setTimeout(() => {
          if (error) return;

          progressCallback({ status: "Uploading", progress: e.loaded / e.total });
        }, 0);
    }

    try {
      if (result.response.signedUploadRequest.method === "PUT") {
        await Axios.put(result.response.signedUploadRequest.url, file, {
          cancelToken: cancelTokenSource.token,
          onUploadProgress
        });
      } else {
        const formData = new FormData();
        Object.entries(result.response.signedUploadRequest.extraFormData).forEach(([key, value]) =>
          formData.append(key, value as string)
        );

        formData.append(result.response.signedUploadRequest.fileFieldName, file);
        await Axios.post(result.response.signedUploadRequest.url, formData, {
          cancelToken: cancelTokenSource.token,
          onUploadProgress
        });
      }
    } catch (e) {
      error = true;
      if (isCancelled) return { uploadCancelled: true };
      return { uploadError: e };
    }

    if (progressCallback) progressCallback({ status: "Requesting", progress: 0 });

    return await api(
      {
        ...request,
        uploadInfo: {
          size: file.size,
          uuid: result.response.signedUploadRequest.uuid
        }
      } as Request,
      getRecaptchaToken()
    );
  }
  // Upload is not required
  else return result;
}
