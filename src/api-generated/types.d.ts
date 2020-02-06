// This file is generated automatically, do NOT modify it.

declare namespace ApiTypes {
  export interface AddProblemFileRequestDto {
    problemId: number;
    type: "TestData" | "AdditionalFile";
    filename: string;
    sha256: string;
  }
  export interface AddProblemFileResponseDto {
    error?: "NO_SUCH_PROBLEM" | "PERMISSION_DENIED" | "UPLOAD_REQUIRED";
    uploadUrl?: string;
    uploadUuid?: string;
  }
  export interface AddUserToGroupRequestDto {
    userId: number;
    groupId: number;
  }
  export interface AddUserToGroupResponseDto {
    error?: "PERMISSION_DENIED" | "NO_SUCH_USER" | "NO_SUCH_GROUP" | "USER_ALREADY_IN_GROUP";
  }
  export interface CheckAvailabilityResponseDto {
    usernameAvailable?: boolean;
    emailAvailable?: boolean;
  }
  export interface CreateGroupRequestDto {
    groupName: string;
  }
  export interface CreateGroupResponseDto {
    error?: "PERMISSION_DENIED" | "DUPLICATE_GROUP_NAME";
    groupId?: number;
  }
  export interface CreateProblemRequestDto {
    type: string;
    statement: ApiTypes.ProblemStatementDto;
  }
  export interface CreateProblemResponseDto {
    error?: "PERMISSION_DENIED" | "FAILED";
    id?: number;
  }
  export interface DeleteGroupRequestDto {
    groupId: number;
    force: boolean;
  }
  export interface DeleteGroupResponseDto {
    error?: "PERMISSION_DENIED" | "NO_SUCH_GROUP" | "GROUP_NOT_EMPTY" | "GROUP_HAVE_PRIVILIGE";
  }
  export interface DownloadProblemFilesRequestDto {
    problemId: number;
    type: "TestData" | "AdditionalFile";
    filenameList: string[];
  }
  export interface DownloadProblemFilesResponseDto {
    error?: "NO_SUCH_PROBLEM" | "PERMISSION_DENIED";
    downloadInfo?: ApiTypes.ProblemFileDownloadInfoDto[];
  }
  export interface FinishUploadRequestDto {
    uuid: string;
  }
  export interface FinishUploadResponseDto {
    error?: "INVALID_OPERATION" | "NOT_UPLOADED" | "IO_ERROR" | "CHECKSUM_MISMATCH";
    uuid?: string;
  }
  export interface GetGroupMetaResponseDto {
    error?: "NO_SUCH_GROUP";
    groupMeta?: ApiTypes.GroupMetaDto;
  }
  export interface GetProblemRequestDto {
    id?: number;
    displayId?: number;
    owner?: boolean;
    localizedContentsOfLocale?: "en_US" | "zh_CN";
    localizedContentsOfAllLocales?: boolean;
    samples?: boolean;
    judgeInfo?: boolean;
    testData?: boolean;
    additionalFiles?: boolean;
    permissionOfCurrentUser?: ("VIEW" | "MODIFY" | "MANAGE_PERMISSION" | "MANAGE_PUBLICNESS" | "DELETE")[];
    permissions?: boolean;
  }
  export interface GetProblemResponseDto {
    error?: "PERMISSION_DENIED" | "NO_SUCH_PROBLEM";
    meta?: ApiTypes.ProblemMetaDto;
    owner?: ApiTypes.UserMetaDto;
    localizedContentsOfLocale?: ApiTypes.ProblemLocalizedContentDto;
    localizedContentsOfAllLocales?: ApiTypes.ProblemLocalizedContentDto[];
    samples?: ApiTypes.ProblemSampleDataMemberDto[];
    judgeInfo?: {};
    testData?: ApiTypes.ProblemFileDto[];
    additionalFiles?: ApiTypes.ProblemFileDto[];
    permissionOfCurrentUser?: ApiTypes.ProblemPermissionOfCurrentUserDto;
    permissions?: ApiTypes.ProblemPermissions;
  }
  export interface GetSelfMetaResponseDto {
    userMeta?: ApiTypes.UserMetaDto;
  }
  export interface GetUserMetaResponseDto {
    userMeta?: ApiTypes.UserMetaDto;
    privileges?: ("MANAGE_USER" | "MANAGE_USER_GROUP" | "MANAGE_PROBLEM" | "MANAGE_CONTEST" | "MANAGE_DISCUSSION")[];
  }
  export interface GroupMetaDto {
    id: number;
    name: string;
    ownerId: number;
  }
  export interface LoginRequestDto {
    username: string;
    password: string;
  }
  export interface LoginResponseDto {
    error?: "ALREADY_LOGGEDIN" | "NO_SUCH_USER" | "WRONG_PASSWORD";
    userMeta?: ApiTypes.UserMetaDto;
    token?: string;
  }
  namespace Parameters {
    export type Email = string;
    export type GetPrivileges = boolean;
    export type GroupId = string;
    export type Query = string;
    export type UserId = string;
    export type Username = string;
    export type Wildcard = "START" | "END" | "BOTH";
  }
  export interface ProblemContentSectionDto {
    sectionTitle: string;
    type: "TEXT" | "SAMPLE";
    sampleId?: number;
    text?: string;
  }
  export interface ProblemFileDownloadInfoDto {
    filename: string;
    downloadUrl: string;
  }
  export interface ProblemFileDto {
    uuid: string;
    filename: string;
    size?: number;
  }
  export interface ProblemGroupPermissionDto {
    group: ApiTypes.GroupMetaDto;
    permissionLevel: 1 | 2;
  }
  export interface ProblemLocalizedContentDto {
    locale: "en_US" | "zh_CN";
    title: string;
    contentSections: ApiTypes.ProblemContentSectionDto[];
  }
  export interface ProblemMetaDto {
    id: number;
    displayId?: number;
    type: string;
    isPublic: boolean;
    ownerId: number;
    locales: ("en_US" | "zh_CN")[];
  }
  export interface ProblemPermissionOfCurrentUserDto {
    VIEW?: boolean;
    MODIFY?: boolean;
    MANAGE_PERMISSION?: boolean;
    MANAGE_PUBLICNESS?: boolean;
    DELETE?: boolean;
  }
  export interface ProblemPermissions {
    userPermissions: ApiTypes.ProblemUserPermissionDto[];
    groupPermissions: ApiTypes.ProblemGroupPermissionDto[];
  }
  export interface ProblemSampleDataMemberDto {
    inputData: string;
    outputData: string;
  }
  export interface ProblemStatementDto {
    localizedContents: ApiTypes.ProblemLocalizedContentDto[];
    samples: ApiTypes.ProblemSampleDataMemberDto[];
  }
  export interface ProblemUserPermissionDto {
    user: ApiTypes.UserMetaDto;
    permissionLevel: 1 | 2;
  }
  export interface QueryParameters {
    query: ApiTypes.Parameters.Query;
    wildcard?: ApiTypes.Parameters.Wildcard;
  }
  export interface QueryProblemSetRequestDto {
    locale: "en_US" | "zh_CN";
    skipCount: number;
    takeCount: number;
  }
  export interface QueryProblemSetResponseDto {
    error?: "TAKE_TOO_MANY";
    result?: ApiTypes.QueryProblemSetResponseItemDto[];
    count?: number;
  }
  export interface QueryProblemSetResponseItemDto {
    meta: ApiTypes.ProblemMetaDto;
    title: string;
    titleLocale: "en_US" | "zh_CN";
  }
  export interface RegisterRequestDto {
    username: string;
    email: string;
    password: string;
  }
  export interface RegisterResponseDto {
    error?: "ALREADY_LOGGEDIN" | "DUPLICATE_USERNAME" | "DUPLICATE_EMAIL";
    userMeta?: ApiTypes.UserMetaDto;
    token?: string;
  }
  export interface RemoveProblemFilesRequestDto {
    problemId: number;
    type: "TestData" | "AdditionalFile";
    filenames: string[];
  }
  export interface RemoveProblemFilesResponseDto {
    error?: "NO_SUCH_PROBLEM" | "PERMISSION_DENIED";
  }
  export interface RemoveUserFromGroupRequestDto {
    userId: number;
    groupId: number;
  }
  export interface RemoveUserFromGroupResponseDto {
    error?:
      | "PERMISSION_DENIED"
      | "NO_SUCH_USER"
      | "NO_SUCH_GROUP"
      | "USER_NOT_IN_GROUP"
      | "OWNER_OR_GROUP_ADMIN_CAN_NOT_BE_REMOVED";
  }
  export interface RenameProblemFileRequestDto {
    problemId: number;
    type: "TestData" | "AdditionalFile";
    filename: string;
    newFilename: string;
  }
  export interface RenameProblemFileResponseDto {
    error?: "NO_SUCH_PROBLEM" | "PERMISSION_DENIED" | "NO_SUCH_FILE";
  }
  export type RequestBody = ApiTypes.SubmitRequestDto;
  namespace Responses {
    export type $200 = ApiTypes.SearchGroupResponseDto;
    export type $201 = ApiTypes.SubmitResponseDto;
  }
  export interface SearchGroupResponseDto {
    groupMetas: ApiTypes.GroupMetaDto[];
  }
  export interface SearchUserResponseDto {
    userMetas: ApiTypes.UserMetaDto[];
  }
  export interface SetGroupAdminRequestDto {
    userId: number;
    groupId: number;
    isGroupAdmin: boolean;
  }
  export interface SetGroupAdminResponseDto {
    error?: "PERMISSION_DENIED" | "NO_SUCH_USER" | "NO_SUCH_GROUP" | "USER_NOT_IN_GROUP";
  }
  export interface SetProblemDisplayIdRequestDto {
    problemId: number;
    displayId: number;
  }
  export interface SetProblemDisplayIdResponseDto {
    error?: "PERMISSION_DENIED" | "NO_SUCH_PROBLEM" | "DUPLICATE_DISPLAY_ID" | "PUBLIC_PROBLEM_MUST_HAVE_DISPLAY_ID";
  }
  export interface SetProblemPermissionsRequestDto {
    problemId: number;
    userPermissions: ApiTypes.SetProblemPermissionsRequestUserPermissionDto[];
    groupPermissions: ApiTypes.SetProblemPermissionsRequestGroupPermissionDto[];
  }
  export interface SetProblemPermissionsRequestGroupPermissionDto {
    groupId: number;
    permissionLevel: 1 | 2;
  }
  export interface SetProblemPermissionsRequestUserPermissionDto {
    userId: number;
    permissionLevel: 1 | 2;
  }
  export interface SetProblemPermissionsResponseDto {
    error?: "PERMISSION_DENIED" | "NO_SUCH_PROBLEM" | "NO_SUCH_USER" | "NO_SUCH_GROUP";
    errorObjectId?: number;
  }
  export interface SetProblemPublicRequestDto {
    problemId: number;
    isPublic: boolean;
  }
  export interface SetProblemPublicResponseDto {
    error?: "PERMISSION_DENIED" | "NO_SUCH_PROBLEM" | "NO_DISPLAY_ID";
  }
  export interface SetUserPrivilegesRequestDto {
    userId: number;
    privileges: ("MANAGE_USER" | "MANAGE_USER_GROUP" | "MANAGE_PROBLEM" | "MANAGE_CONTEST" | "MANAGE_DISCUSSION")[];
  }
  export interface SetUserPrivilegesResponseDto {
    error?: "PERMISSION_DENIED" | "NO_SUCH_USER" | "FAILED";
  }
  export interface SubmitRequestDto {
    problemId: number;
    content: {};
  }
  export interface SubmitResponseDto {
    error?: "PERMISSION_DENIED" | "NO_SUCH_PROBLEM";
    submissionId?: number;
  }
  export interface UpdateProblemJudgeInfoRequestDto {
    problemId: number;
    judgeInfo?: {};
  }
  export interface UpdateProblemJudgeInfoResponseDto {
    error?: "NO_SUCH_PROBLEM" | "PERMISSION_DENIED";
  }
  export interface UpdateProblemRequestUpdatingLocalizedContentDto {
    locale: "en_US" | "zh_CN";
    title?: string;
    contentSections?: ApiTypes.ProblemContentSectionDto[];
  }
  export interface UpdateProblemStatementRequestDto {
    problemId: number;
    localizedContents: ApiTypes.UpdateProblemRequestUpdatingLocalizedContentDto[];
    samples?: ApiTypes.ProblemSampleDataMemberDto[];
  }
  export interface UpdateProblemStatementResponseDto {
    error?: "PERMISSION_DENIED" | "NO_SUCH_PROBLEM" | "FAILED";
  }
  export interface UpdateUserProfileRequestDto {
    userId: number;
    username?: string;
    email?: string;
    bio?: string;
    oldPassword?: string;
    password?: string;
  }
  export interface UpdateUserProfileResponseDto {
    error?: "PERMISSION_DENIED" | "NO_SUCH_USER" | "WRONG_OLD_PASSWORD" | "DUPLICATE_USERNAME" | "DUPLICATE_EMAIL";
  }
  export interface UserMetaDto {
    id: number;
    username: string;
    email: string;
    bio: string;
    isAdmin: boolean;
  }
}
