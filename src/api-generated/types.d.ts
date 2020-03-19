// This file is generated automatically, do NOT modify it.

declare namespace ApiTypes {
  export interface AddJudgeClientRequestDto {
    name: string;
    allowedHosts: string[];
  }
  export interface AddJudgeClientResponseDto {
    error?: "PERMISSION_DENIED";
    judgeClient?: ApiTypes.JudgeClientInfoDto;
  }
  export interface AddProblemFileRequestDto {
    problemId: number;
    type: "TestData" | "AdditionalFile";
    size: number;
    filename: string;
    uuid?: string;
  }
  export interface AddProblemFileResponseDto {
    error?:
      | "NO_SUCH_PROBLEM"
      | "PERMISSION_DENIED"
      | "TOO_MANY_FILES"
      | "TOTAL_SIZE_TOO_LARGE"
      | "INVALID_OPERATION"
      | "NOT_UPLOADED";
    uploadInfo?: ApiTypes.FileUploadInfoDto;
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
    type: "TRADITIONAL";
    statement: ApiTypes.ProblemStatementDto;
  }
  export interface CreateProblemResponseDto {
    error?: "PERMISSION_DENIED" | "NO_SUCH_PROBLEM_TAG" | "FAILED";
    id?: number;
  }
  export interface CreateProblemTagRequestDto {
    localizedNames: ApiTypes.ProblemTagLocalizedNameDto[];
    color: string;
  }
  export interface CreateProblemTagResponseDto {
    error?: "PERMISSION_DENIED";
    id?: number;
  }
  export interface DeleteGroupRequestDto {
    groupId: number;
    force: boolean;
  }
  export interface DeleteGroupResponseDto {
    error?: "PERMISSION_DENIED" | "NO_SUCH_GROUP" | "GROUP_NOT_EMPTY" | "GROUP_HAVE_PRIVILIGE";
  }
  export interface DeleteJudgeClientRequestDto {
    id: number;
  }
  export interface DeleteJudgeClientResponseDto {
    error?: "PERMISSION_DENIED" | "NO_SUCH_JUDGE_CLIENT";
  }
  export interface DeleteProblemTagRequestDto {
    id: number;
  }
  export interface DeleteProblemTagResponseDto {
    error?: "NO_SUCH_PROBLEM_TAG" | "PERMISSION_DENIED";
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
  export interface FileUploadInfoDto {
    uuid: string;
    method: "POST" | "PUT";
    url: string;
    extraFormData: {};
    fileFieldName: string;
  }
  export interface GetAllProblemTagsOfAllLocalesRequestDto {}
  export interface GetAllProblemTagsOfAllLocalesResponseDto {
    error?: "PERMISSION_DENIED";
    tags?: ApiTypes.ProblemTagWithAllLocalesDto[];
  }
  export interface GetAllProblemTagsRequestDto {
    locale: "en_US" | "zh_CN";
  }
  export interface GetAllProblemTagsResponseDto {
    tags: ApiTypes.LocalizedProblemTagDto[];
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
    tagsOfLocale?: "en_US" | "zh_CN";
    samples?: boolean;
    judgeInfo?: boolean;
    testData?: boolean;
    additionalFiles?: boolean;
    statistics?: boolean;
    permissionOfCurrentUser?: ("VIEW" | "MODIFY" | "MANAGE_PERMISSION" | "MANAGE_PUBLICNESS" | "DELETE")[];
    permissions?: boolean;
  }
  export interface GetProblemResponseDto {
    error?: "PERMISSION_DENIED" | "NO_SUCH_PROBLEM";
    meta?: ApiTypes.ProblemMetaDto;
    owner?: ApiTypes.UserMetaDto;
    localizedContentsOfLocale?: ApiTypes.ProblemLocalizedContentDto;
    localizedContentsOfAllLocales?: ApiTypes.ProblemLocalizedContentDto[];
    tagsOfLocale?: ApiTypes.LocalizedProblemTagDto[];
    samples?: ApiTypes.ProblemSampleDataMemberDto[];
    judgeInfo?: {};
    testData?: ApiTypes.ProblemFileDto[];
    additionalFiles?: ApiTypes.ProblemFileDto[];
    permissionOfCurrentUser?: ApiTypes.ProblemPermissionOfCurrentUserDto;
    permissions?: ApiTypes.ProblemPermissions;
  }
  export interface GetProblemTagDetailRequestDto {
    id: number;
  }
  export interface GetProblemTagDetailResponseDto {
    error?: "NO_SUCH_PROBLEM_TAG";
    id?: number;
    color?: string;
    localizedNames?: ApiTypes.ProblemTagLocalizedNameDto[];
  }
  export interface GetSelfMetaResponseDto {
    userMeta?: ApiTypes.UserMetaDto;
  }
  export interface GetSubmissionDetailRequestDto {
    submissionId: string;
    locale: "en_US" | "zh_CN";
  }
  export interface GetSubmissionDetailResponseDto {
    error?: "NO_SUCH_SUBMISSION" | "PERMISSION_DENIED";
    meta?: ApiTypes.SubmissionMetaDto;
    content?: {};
    result?: {};
    progress?: {};
    progressSubscriptionKey?: string;
  }
  export interface GetUserDetailRequestDto {
    userId: number;
    timezone: string;
    now: string;
  }
  export interface GetUserDetailResponseDto {
    error?: "NO_SUCH_USER";
    meta?: ApiTypes.UserMetaDto;
    information?: ApiTypes.UserInformationDto;
    submissionCountPerDay?: number[];
    rank?: number;
    hasPrivilege?: boolean;
  }
  export interface GetUserListRequestDto {
    sortBy: "acceptedProblemCount" | "rating";
    skipCount: number;
    takeCount: number;
  }
  export interface GetUserListResponseDto {
    error?: "TAKE_TOO_MANY";
    userMetas?: ApiTypes.UserMetaDto[];
    count?: number;
  }
  export interface GetUserMetaResponseDto {
    userMeta?: ApiTypes.UserMetaDto;
    privileges?: ("MANAGE_USER" | "MANAGE_USER_GROUP" | "MANAGE_PROBLEM" | "MANAGE_CONTEST" | "MANAGE_DISCUSSION")[];
  }
  export interface GetUserPreferenceRequestDto {
    userId: number;
  }
  export interface GetUserPreferenceResponseDto {
    error?: "NO_SUCH_USER" | "PERMISSION_DENIED";
    meta?: ApiTypes.UserMetaDto;
    preference?: ApiTypes.UserPreferenceDto;
  }
  export interface GetUserProfileRequestDto {
    userId: number;
  }
  export interface GetUserProfileResponseDto {
    error?: "NO_SUCH_USER" | "PERMISSION_DENIED";
    meta?: ApiTypes.UserMetaDto;
    publicEmail?: boolean;
    information?: ApiTypes.UserInformationDto;
  }
  export interface GroupMetaDto {
    id: number;
    name: string;
    ownerId: number;
  }
  export interface HeaderParameters {
    "maintaince-key": ApiTypes.Parameters.MaintainceKey;
  }
  export interface JudgeClientInfoDto {
    id: number;
    name: string;
    key: string;
    allowedHosts: string[];
    online: boolean;
    systemInfo?: {};
  }
  export interface ListJudgeClientsResponseDto {
    judgeClients: ApiTypes.JudgeClientInfoDto[];
    hasManagePermission: boolean;
  }
  export interface LocalizedProblemTagDto {
    id: number;
    name: string;
    color: string;
    nameLocale: "en_US" | "zh_CN";
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
    export type MaintainceKey = string;
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
    type: "TRADITIONAL";
    isPublic: boolean;
    ownerId: number;
    locales: ("en_US" | "zh_CN")[];
    submissionCount?: number;
    acceptedSubmissionCount?: number;
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
    problemTagIds: number[];
  }
  export interface ProblemTagLocalizedNameDto {
    name: string;
    locale: "en_US" | "zh_CN";
  }
  export interface ProblemTagWithAllLocalesDto {
    id?: number;
    color?: string;
    localizedNames?: ApiTypes.ProblemTagLocalizedNameDto[];
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
    keyword?: string;
    tagIds?: number[];
    ownerId?: number;
    nonpublic?: boolean;
    skipCount: number;
    takeCount: number;
  }
  export interface QueryProblemSetResponseDto {
    error?: "PERMISSION_DENIED" | "TAKE_TOO_MANY";
    result?: ApiTypes.QueryProblemSetResponseItemDto[];
    count?: number;
    filterTags?: ApiTypes.LocalizedProblemTagDto[];
    filterOwner?: ApiTypes.UserMetaDto;
    permissions?: ApiTypes.QueryProblemSetResponsePermissionDto;
  }
  export interface QueryProblemSetResponseItemDto {
    meta: ApiTypes.ProblemMetaDto;
    title: string;
    tags: ApiTypes.LocalizedProblemTagDto[];
    resultLocale: "en_US" | "zh_CN";
  }
  export interface QueryProblemSetResponsePermissionDto {
    createProblem?: boolean;
    manageTags?: boolean;
    filterByOwner?: boolean;
    filterNonpublic?: boolean;
  }
  export interface QuerySubmissionRequestDto {
    locale: "en_US" | "zh_CN";
    problemId: number;
    problemDisplayId: number;
    submitter: string;
    codeLanguage: string;
    status:
      | "Pending"
      | "ConfigurationError"
      | "SystemError"
      | "CompilationError"
      | "FileError"
      | "RuntimeError"
      | "TimeLimitExceeded"
      | "MemoryLimitExceeded"
      | "OutputLimitExceeded"
      | "InvalidInteraction"
      | "PartiallyCorrect"
      | "WrongAnswer"
      | "Accepted"
      | "JudgementFailed";
    minId: number;
    maxId: number;
    takeCount: number;
  }
  export interface QuerySubmissionResponseDto {
    error?: "NO_SUCH_PROBLEM" | "NO_SUCH_USER";
    submissions?: ApiTypes.SubmissionMetaDto[];
    hasSmallerId?: boolean;
    hasLargerId?: boolean;
    progressSubscriptionKey?: string;
  }
  export interface QuerySubmissionStatisticsRequestDto {
    locale: "en_US" | "zh_CN";
    problemId?: number;
    problemDisplayId?: number;
    statisticsType: "Fastest" | "MinMemory" | "MinAnswerSize" | "Earlist";
    skipCount: number;
    takeCount: number;
  }
  export interface QuerySubmissionStatisticsResponseDto {
    error?: "NO_SUCH_PROBLEM" | "TAKE_TOO_MANY";
    submissions?: ApiTypes.SubmissionMetaDto[];
    count?: number;
    scores?: number[];
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
  export type RequestBody = ApiTypes.ResetJudgeClientKeyRequestDto;
  export interface ResetJudgeClientKeyRequestDto {
    id: number;
  }
  export interface ResetJudgeClientKeyResponseDto {
    error?: "PERMISSION_DENIED" | "NO_SUCH_JUDGE_CLIENT";
    key?: string;
  }
  namespace Responses {
    export type $200 = string;
    export type $201 = ApiTypes.ResetJudgeClientKeyResponseDto;
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
  export interface SubmissionMetaDto {
    id: number;
    isPublic: boolean;
    codeLanguage: string;
    answerSize: number;
    score: number;
    status:
      | "Pending"
      | "ConfigurationError"
      | "SystemError"
      | "CompilationError"
      | "FileError"
      | "RuntimeError"
      | "TimeLimitExceeded"
      | "MemoryLimitExceeded"
      | "OutputLimitExceeded"
      | "InvalidInteraction"
      | "PartiallyCorrect"
      | "WrongAnswer"
      | "Accepted"
      | "JudgementFailed";
    submitTime: string; // date-time
    timeUsed: number;
    memoryUsed: number;
    problem: ApiTypes.ProblemMetaDto;
    problemTitle: string;
    submitter: ApiTypes.UserMetaDto;
    progressMeta?: 0 | 1 | 2 | 3;
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
    problemTagIds: number[];
  }
  export interface UpdateProblemStatementResponseDto {
    error?: "PERMISSION_DENIED" | "NO_SUCH_PROBLEM" | "NO_SUCH_PROBLEM_TAG" | "FAILED";
  }
  export interface UpdateProblemTagRequestDto {
    id: number;
    localizedNames: ApiTypes.ProblemTagLocalizedNameDto[];
    color: string;
  }
  export interface UpdateProblemTagResponseDto {
    error?: "NO_SUCH_PROBLEM_TAG" | "PERMISSION_DENIED";
  }
  export interface UpdateUserPreferenceRequestDto {
    userId: number;
    preference: ApiTypes.UserPreferenceDto;
  }
  export interface UpdateUserPreferenceResponseDto {
    error?: "NO_SUCH_USER" | "PERMISSION_DENIED";
  }
  export interface UpdateUserProfileRequestDto {
    userId: number;
    username?: string;
    email?: string;
    publicEmail: boolean;
    bio: string;
    information: ApiTypes.UserInformationDto;
    oldPassword?: string;
    password?: string;
  }
  export interface UpdateUserProfileResponseDto {
    error?: "PERMISSION_DENIED" | "NO_SUCH_USER" | "WRONG_OLD_PASSWORD" | "DUPLICATE_USERNAME" | "DUPLICATE_EMAIL";
  }
  export interface UserInformationDto {
    organization: string;
    location: string;
    url: string;
    telegram: string;
    qq: string;
    github: string;
  }
  export interface UserMetaDto {
    id: number;
    username: string;
    email: string;
    gravatarEmailHash: string;
    bio: string;
    isAdmin: boolean;
    acceptedProblemCount: number;
    submissionCount: number;
    rating: number;
    registrationTime: string; // date-time
  }
  export interface UserPreferenceDto {
    locale?: "en_US" | "zh_CN";
    formatCodeByDefault?: boolean;
    codeFormatterOptions?: string;
    languageOptions?: {};
  }
}
