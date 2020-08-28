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
  export interface CancelSubmissionRequestDto {
    submissionId: number;
  }
  export interface CancelSubmissionResponseDto {
    error?: "NO_SUCH_SUBMISSION" | "PERMISSION_DENIED";
  }
  export interface ChangeProblemTypeRequestDto {
    problemId: number;
    type: "TRADITIONAL" | "INTERACTION";
  }
  export interface ChangeProblemTypeResponseDto {
    error?: "NO_SUCH_PROBLEM" | "PERMISSION_DENIED" | "PROBLEM_HAS_SUBMISSION";
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
    type: "TRADITIONAL" | "INTERACTION";
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
  }
  export interface DeleteGroupResponseDto {
    error?: "PERMISSION_DENIED" | "NO_SUCH_GROUP";
  }
  export interface DeleteJudgeClientRequestDto {
    id: number;
  }
  export interface DeleteJudgeClientResponseDto {
    error?: "PERMISSION_DENIED" | "NO_SUCH_JUDGE_CLIENT";
  }
  export interface DeleteProblemRequestDto {
    problemId: number;
  }
  export interface DeleteProblemResponseDto {
    error?: "PERMISSION_DENIED" | "NO_SUCH_PROBLEM";
  }
  export interface DeleteProblemTagRequestDto {
    id: number;
  }
  export interface DeleteProblemTagResponseDto {
    error?: "NO_SUCH_PROBLEM_TAG" | "PERMISSION_DENIED";
  }
  export interface DeleteSubmissionRequestDto {
    submissionId: number;
  }
  export interface DeleteSubmissionResponseDto {
    error?: "NO_SUCH_SUBMISSION" | "PERMISSION_DENIED";
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
    locale: "en_US" | "zh_CN" | "ja_JP";
  }
  export interface GetAllProblemTagsResponseDto {
    tags: ApiTypes.LocalizedProblemTagDto[];
  }
  export interface GetGroupListResponseDto {
    groups: ApiTypes.GroupMetaDto[];
    groupsWithAdminPermission: number[];
  }
  export interface GetGroupMemberListRequestDto {
    groupId: number;
  }
  export interface GetGroupMemberListResponseDto {
    error?: "NO_SUCH_GROUP" | "PERMISSION_DENIED";
    memberList?: ApiTypes.GetGroupMemberListResponseItem[];
  }
  export interface GetGroupMemberListResponseItem {
    userMeta: ApiTypes.UserMetaDto;
    isGroupAdmin: boolean;
  }
  export interface GetGroupMetaResponseDto {
    error?: "NO_SUCH_GROUP";
    groupMeta?: ApiTypes.GroupMetaDto;
  }
  export interface GetProblemRequestDto {
    id?: number;
    displayId?: number;
    owner?: boolean;
    localizedContentsOfLocale?: "en_US" | "zh_CN" | "ja_JP";
    localizedContentsOfAllLocales?: boolean;
    tagsOfLocale?: "en_US" | "zh_CN" | "ja_JP";
    samples?: boolean;
    judgeInfo?: boolean;
    testData?: boolean;
    additionalFiles?: boolean;
    statistics?: boolean;
    permissionOfCurrentUser?: ("VIEW" | "MODIFY" | "MANAGE_PERMISSION" | "MANAGE_PUBLICNESS" | "DELETE")[];
    permissions?: boolean;
    lastSubmissionAndLastAcceptedSubmission?: boolean;
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
    permissions?: ApiTypes.ProblemPermissionsDto;
    lastSubmission?: ApiTypes.ProblemLastSubmissionDto;
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
  export interface GetSessionInfoResponseDto {
    userMeta: ApiTypes.UserMetaDto;
    joinedGroupsCount: number;
    userPrivileges: ("MANAGE_USER" | "MANAGE_USER_GROUP" | "MANAGE_PROBLEM" | "MANAGE_CONTEST" | "MANAGE_DISCUSSION")[];
    userPreference: ApiTypes.UserPreferenceDto;
    serverPreference: ApiTypes.PreferenceConfig;
  }
  export interface GetSubmissionDetailRequestDto {
    submissionId: string;
    locale: "en_US" | "zh_CN" | "ja_JP";
  }
  export interface GetSubmissionDetailResponseDto {
    error?: "NO_SUCH_SUBMISSION" | "PERMISSION_DENIED";
    meta?: ApiTypes.SubmissionMetaDto;
    content?: {};
    result?: {};
    progress?: {};
    progressSubscriptionKey?: string;
    permissionRejudge?: boolean;
    permissionCancel?: boolean;
    permissionSetPublic?: boolean;
    permissionDelete?: boolean;
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
  export interface GetUserMetaRequestDto {
    userId?: number;
    username?: string;
    getPrivileges?: boolean;
  }
  export interface GetUserMetaResponseDto {
    error?: "NO_SUCH_USER";
    meta?: ApiTypes.UserMetaDto;
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
    avatarInfo?: string;
    information?: ApiTypes.UserInformationDto;
  }
  export interface GetUserSecuritySettingsRequestDto {
    userId: number;
  }
  export interface GetUserSecuritySettingsResponseDto {
    error?: "NO_SUCH_USER" | "PERMISSION_DENIED";
    meta?: ApiTypes.UserMetaDto;
  }
  export interface GroupMetaDto {
    id: number;
    name: string;
    memberCount: number;
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
  export interface ListUserSessionsRequestDto {
    userId: number;
  }
  export interface ListUserSessionsResponseDto {
    error?: "PERMISSION_DENIED";
    sessions?: ApiTypes.UserSessionDto[];
    /**
     * Only available when querying the current user
     */
    currentSessionId?: number;
  }
  export interface LocalizedProblemTagDto {
    id: number;
    name: string;
    color: string;
    nameLocale: "en_US" | "zh_CN" | "ja_JP";
  }
  export interface LoginRequestDto {
    username: string;
    password: string;
  }
  export interface LoginResponseDto {
    error?: "ALREADY_LOGGEDIN" | "NO_SUCH_USER" | "WRONG_PASSWORD";
    token?: string;
  }
  namespace Parameters {
    export type Email = string;
    export type GroupId = string;
    export type Jsonp = string;
    export type MaintainceKey = string;
    export type Query = string;
    export type Token = string;
    export type Username = string;
    export type Wildcard = "START" | "END" | "BOTH";
  }
  export interface PreferenceConfig {
    siteName: string;
    requireEmailVerification: boolean;
    allowUserChangeUsername: boolean;
    allowEveryoneCreateProblem: boolean;
    allowNonAdminEditPublicProblem: boolean;
    allowOwnerManageProblemPermission: boolean;
    allowOwnerDeleteProblem: boolean;
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
  export interface ProblemLastSubmissionDto {
    lastSubmission?: ApiTypes.SubmissionBasicMetaDto;
    lastSubmissionContent?: {};
    lastAcceptedSubmission?: ApiTypes.SubmissionBasicMetaDto;
  }
  export interface ProblemLocalizedContentDto {
    locale: "en_US" | "zh_CN" | "ja_JP";
    title: string;
    contentSections: ApiTypes.ProblemContentSectionDto[];
  }
  export interface ProblemMetaDto {
    id: number;
    displayId?: number;
    type: "TRADITIONAL" | "INTERACTION";
    isPublic: boolean;
    ownerId: number;
    locales: ("en_US" | "zh_CN" | "ja_JP")[];
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
  export interface ProblemPermissionsDto {
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
    locale: "en_US" | "zh_CN" | "ja_JP";
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
    locale: "en_US" | "zh_CN" | "ja_JP";
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
    resultLocale: "en_US" | "zh_CN" | "ja_JP";
    submission?: ApiTypes.SubmissionBasicMetaDto;
  }
  export interface QueryProblemSetResponsePermissionDto {
    createProblem?: boolean;
    manageTags?: boolean;
    filterByOwner?: boolean;
    filterNonpublic?: boolean;
  }
  export interface QuerySubmissionRequestDto {
    locale: "en_US" | "zh_CN" | "ja_JP";
    problemId: number;
    problemDisplayId: number;
    submitter: string;
    codeLanguage: string;
    status:
      | "Pending"
      | "ConfigurationError"
      | "SystemError"
      | "Canceled"
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
    locale: "en_US" | "zh_CN" | "ja_JP";
    problemId?: number;
    problemDisplayId?: number;
    statisticsType: "Fastest" | "MinMemory" | "MinAnswerSize" | "Earlist";
    skipCount: number;
    takeCount: number;
  }
  export interface QuerySubmissionStatisticsResponseDto {
    error?: "NO_SUCH_PROBLEM" | "PERMISSION_DENIED" | "TAKE_TOO_MANY";
    submissions?: ApiTypes.SubmissionMetaDto[];
    count?: number;
    scores?: number[];
  }
  export interface RegisterRequestDto {
    username: string;
    email: string;
    emailVerificationCode?: string;
    password: string;
  }
  export interface RegisterResponseDto {
    error?: "ALREADY_LOGGEDIN" | "DUPLICATE_USERNAME" | "DUPLICATE_EMAIL" | "INVALID_EMAIL_VERIFICATION_CODE";
    token?: string;
  }
  export interface RejudgeSubmissionRequestDto {
    submissionId: number;
  }
  export interface RejudgeSubmissionResponseDto {
    error?: "NO_SUCH_SUBMISSION" | "PERMISSION_DENIED";
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
      | "GROUP_ADMIN_CAN_NOT_BE_REMOVED";
  }
  export interface RenameGroupRequestDto {
    groupId: number;
    name: string;
  }
  export interface RenameGroupResponseDto {
    error?: "PERMISSION_DENIED" | "NO_SUCH_GROUP" | "DUPLICATE_GROUP_NAME";
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
  export interface ResetPasswordRequestDto {
    email: string;
    emailVerificationCode?: string;
    newPassword: string;
  }
  export interface ResetPasswordResponseDto {
    error?: "ALREADY_LOGGEDIN" | "NO_SUCH_USER" | "INVALID_EMAIL_VERIFICATION_CODE";
    token?: string;
  }
  namespace Responses {
    export type $200 = string;
    export type $201 = ApiTypes.ResetJudgeClientKeyResponseDto;
  }
  export interface RevokeUserSessionRequestDto {
    userId: number;
    /**
     * Falsy to revoke ALL sessions of the user (except the current session, if the user is current user)
     */
    sessionId?: number;
  }
  export interface RevokeUserSessionResponseDto {
    error?: "PERMISSION_DENIED" | "NO_SUCH_USER";
  }
  export interface SearchGroupResponseDto {
    groupMetas: ApiTypes.GroupMetaDto[];
  }
  export interface SearchUserResponseDto {
    userMetas: ApiTypes.UserMetaDto[];
  }
  export interface SendEmailVerificationCodeRequestDto {
    email: string;
    type: "Register" | "ChangeEmail" | "ResetPassword";
    locale: "en_US" | "zh_CN" | "ja_JP";
  }
  export interface SendEmailVerificationCodeResponseDto {
    error?:
      | "PERMISSION_DENIED"
      | "ALREADY_LOGGEDIN"
      | "NO_SUCH_USER"
      | "DUPLICATE_EMAIL"
      | "FAILED_TO_SEND"
      | "RATE_LIMITED";
    errorMessage?: string;
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
  export interface SetSubmissionPublicRequestDto {
    submissionId: number;
    isPublic: boolean;
  }
  export interface SetSubmissionPublicResponseDto {
    error?: "NO_SUCH_SUBMISSION" | "PERMISSION_DENIED";
  }
  export interface SetUserPrivilegesRequestDto {
    userId: number;
    privileges: ("MANAGE_USER" | "MANAGE_USER_GROUP" | "MANAGE_PROBLEM" | "MANAGE_CONTEST" | "MANAGE_DISCUSSION")[];
  }
  export interface SetUserPrivilegesResponseDto {
    error?: "PERMISSION_DENIED" | "NO_SUCH_USER" | "FAILED";
  }
  export interface SubmissionBasicMetaDto {
    id: number;
    isPublic: boolean;
    codeLanguage: string;
    answerSize: number;
    score: number;
    status:
      | "Pending"
      | "ConfigurationError"
      | "SystemError"
      | "Canceled"
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
      | "Canceled"
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
    error?: "NO_SUCH_PROBLEM" | "PERMISSION_DENIED" | "INVALID_JUDGE_INFO";
    judgeInfoError?: string[];
  }
  export interface UpdateProblemRequestUpdatingLocalizedContentDto {
    locale: "en_US" | "zh_CN" | "ja_JP";
    title: string;
    contentSections: ApiTypes.ProblemContentSectionDto[];
  }
  export interface UpdateProblemStatementRequestDto {
    problemId: number;
    localizedContents: ApiTypes.UpdateProblemRequestUpdatingLocalizedContentDto[];
    samples: ApiTypes.ProblemSampleDataMemberDto[];
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
  export interface UpdateUserPasswordRequestDto {
    userId: number;
    oldPassword?: string;
    password: string;
  }
  export interface UpdateUserPasswordResponseDto {
    error?: "PERMISSION_DENIED" | "NO_SUCH_USER" | "WRONG_OLD_PASSWORD";
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
    avatarInfo: string;
    bio: string;
    information: ApiTypes.UserInformationDto;
  }
  export interface UpdateUserProfileResponseDto {
    error?: "PERMISSION_DENIED" | "NO_SUCH_USER" | "DUPLICATE_USERNAME" | "DUPLICATE_EMAIL";
  }
  export interface UpdateUserSelfEmailRequestDto {
    email: string;
    emailVerificationCode?: string;
  }
  export interface UpdateUserSelfEmailResponseDto {
    error?: "PERMISSION_DENIED" | "DUPLICATE_EMAIL" | "INVALID_EMAIL_VERIFICATION_CODE";
  }
  export interface UserAvatarDto {
    type: "gravatar" | "github" | "qq";
    key: string;
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
    bio: string;
    avatar: ApiTypes.UserAvatarDto;
    isAdmin: boolean;
    acceptedProblemCount: number;
    submissionCount: number;
    rating: number;
    registrationTime: string; // date-time
  }
  export interface UserPreferenceDto {
    systemLocale?: "en_US" | "zh_CN" | "ja_JP";
    contentLocale?: "en_US" | "zh_CN" | "ja_JP";
    doNotFormatCodeByDefault?: boolean;
    codeFormatterOptions?: string;
    defaultCodeLanguage?: string;
    defaultCodeLanguageOptions?: {};
  }
  export interface UserSessionDto {
    sessionId: number;
    loginIp: string;
    loginIpLocation: string;
    userAgent: string;
    loginTime: number;
    lastAccessTime: number;
  }
}
