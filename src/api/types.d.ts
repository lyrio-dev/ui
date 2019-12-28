declare namespace Components {
  namespace Schemas {
    export interface AddUserToGroupRequestDto {
      userId: number;
      groupId: number;
    }
    export interface AddUserToGroupResponseDto {
      error: "PERMISSION_DENIED" | "NO_SUCH_USER" | "NO_SUCH_GROUP" | "USER_ALREADY_IN_GROUP";
    }
    export interface CheckAvailabilityResponseDto {
      usernameAvailable: boolean;
      emailAvailable: boolean;
    }
    export interface CreateGroupRequestDto {
      groupName: string;
    }
    export interface CreateGroupResponseDto {
      error: "PERMISSION_DENIED" | "DUPLICATE_GROUP_NAME";
      groupId: number;
    }
    export interface CreateProblemRequestDto {
      type: string;
      statement: ProblemStatementDto;
    }
    export interface CreateProblemResponseDto {
      error: "PERMISSION_DENIED" | "FAILED";
      id: number;
    }
    export interface DeleteGroupRequestDto {
      groupId: number;
      force: boolean;
    }
    export interface DeleteGroupResponseDto {
      error: "PERMISSION_DENIED" | "NO_SUCH_GROUP" | "GROUP_NOT_EMPTY" | "GROUP_HAVE_PRIVILIGE";
    }
    export interface GetGroupMetaResponseDto {
      error: "NO_SUCH_GROUP";
      groupMeta: GroupMetaDto;
    }
    export interface GetProblemDetailResponseDto {
      error: "PERMISSION_DENIED" | "NO_SUCH_PROBLEM";
      meta: ProblemMetaDto;
      permission: {};
      title: string;
      resultLocale: string;
      samples: ProblemSampleDataMemberDto[];
      contentSections: ProblemContentSectionDto[];
      judgeInfo: {};
    }
    export interface GetProblemPermissionsResponseDto {
      error: "NO_SUCH_PROBLEM" | "PERMISSION_DENIED";
      users: UserMetaDto[];
      groups: GroupMetaDto[];
    }
    export interface GetSelfMetaResponseDto {
      userMeta: UserMetaDto;
    }
    export interface GetUserMetaResponseDto {
      userMeta: UserMetaDto;
      privileges: string[];
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
      error: "ALREADY_LOGGEDIN" | "NO_SUCH_USER" | "WRONG_PASSWORD";
      userMeta: UserMetaDto;
      token: string;
    }
    export interface ProblemContentSectionDto {
      sectionTitle: string;
      type: string;
      sampleId: number;
      text: string;
    }
    export interface ProblemLocalizedContentDto {
      locale: string;
      title: string;
      contentSections: ProblemContentSectionDto[];
    }
    export interface ProblemMetaDto {
      id: number;
      displayId: number;
      type: string;
      isPublic: boolean;
      ownerId: number;
      locales: string[];
    }
    export interface ProblemSampleDataMemberDto {
      inputData: string;
      outputData: string;
    }
    export interface ProblemStatementDto {
      localizedContents: ProblemLocalizedContentDto[];
      samples: ProblemSampleDataMemberDto[];
    }
    export interface QueryProblemSetRequestDto {
      locale: "en_US" | "zh_CN";
      skipCount: number;
      takeCount: number;
    }
    export interface QueryProblemSetResponseDto {
      error: "TAKE_TOO_MANY";
      result: QueryProblemSetResponseItemDto[];
      count: number;
    }
    export interface QueryProblemSetResponseItemDto {
      meta: ProblemMetaDto;
      title: string;
      titleLocale: "en_US" | "zh_CN";
    }
    export interface RegisterRequestDto {
      username: string;
      email: string;
      password: string;
    }
    export interface RegisterResponseDto {
      error: "ALREADY_LOGGEDIN" | "DUPLICATE_USERNAME" | "DUPLICATE_EMAIL";
      userMeta: UserMetaDto;
      token: string;
    }
    export interface RemoveUserFromGroupRequestDto {
      userId: number;
      groupId: number;
    }
    export interface RemoveUserFromGroupResponseDto {
      error:
        | "PERMISSION_DENIED"
        | "NO_SUCH_USER"
        | "NO_SUCH_GROUP"
        | "USER_NOT_IN_GROUP"
        | "OWNER_OR_GROUP_ADMIN_CAN_NOT_BE_REMOVED";
    }
    export interface SetGroupAdminRequestDto {
      userId: number;
      groupId: number;
      isGroupAdmin: boolean;
    }
    export interface SetGroupAdminResponseDto {
      error: "PERMISSION_DENIED" | "NO_SUCH_USER" | "NO_SUCH_GROUP" | "USER_NOT_IN_GROUP";
    }
    export interface SetProblemDisplayIdRequestDto {
      problemId: number;
      displayId: number;
    }
    export interface SetProblemDisplayIdResponseDto {
      error: "PERMISSION_DENIED" | "NO_SUCH_PROBLEM" | "DUPLICATE_DISPLAY_ID" | "PUBLIC_PROBLEM_MUST_HAVE_DISPLAY_ID";
    }
    export interface SetProblemPermissionsRequestDto {
      problemId: number;
      permissionType: string;
      userIds: number[];
      groupIds: number[];
    }
    export interface SetProblemPermissionsResponseDto {
      error: "PERMISSION_DENIED" | "NO_SUCH_PROBLEM" | "NO_SUCH_USER" | "NO_SUCH_GROUP";
      errorObjectId: number;
    }
    export interface SetProblemPublicRequestDto {
      problemId: number;
      isPublic: boolean;
    }
    export interface SetProblemPublicResponseDto {
      error: "PERMISSION_DENIED" | "NO_SUCH_PROBLEM" | "NO_DISPLAY_ID";
    }
    export interface SetUserPrivilegesRequestDto {
      userId: number;
      privileges: string[];
    }
    export interface SetUserPrivilegesResponseDto {
      error: "PERMISSION_DENIED" | "NO_SUCH_USER" | "FAILED";
    }
    export interface UpdateProblemRequestUpdatingLocalizedContentDto {
      locale: string;
      title: string;
      contentSections: ProblemContentSectionDto[];
    }
    export interface UpdateProblemStatementRequestDto {
      problemId: number;
      localizedContents: UpdateProblemRequestUpdatingLocalizedContentDto[];
      samples: ProblemSampleDataMemberDto[];
    }
    export interface UpdateProblemStatementResponseDto {
      error: "PERMISSION_DENIED" | "NO_SUCH_PROBLEM" | "FAILED";
    }
    export interface UpdateUserProfileRequestDto {
      userId: number;
      username: string;
      email: string;
      bio: string;
      oldPassword: string;
      password: string;
    }
    export interface UpdateUserProfileResponseDto {
      error: "PERMISSION_DENIED" | "NO_SUCH_USER" | "WRONG_OLD_PASSWORD" | "DUPLICATE_USERNAME" | "DUPLICATE_EMAIL";
    }
    export interface UserMetaDto {
      id: number;
      username: string;
      email: string;
      bio: string;
      isAdmin: boolean;
    }
  }
}
declare namespace Paths {
  namespace AddMember {
    export type RequestBody = Components.Schemas.AddUserToGroupRequestDto;
    namespace Responses {
      export type $201 = Components.Schemas.AddUserToGroupResponseDto;
    }
  }
  namespace CheckAvailability {
    namespace Parameters {
      export type Email = string;
      export type Username = string;
    }
    export interface QueryParameters {
      username?: Parameters.Username;
      email?: Parameters.Email;
    }
    namespace Responses {
      export type $200 = Components.Schemas.CheckAvailabilityResponseDto;
    }
  }
  namespace Cors {
    namespace Responses {
      export type $200 = string;
    }
  }
  namespace CreateGroup {
    export type RequestBody = Components.Schemas.CreateGroupRequestDto;
    namespace Responses {
      export type $201 = Components.Schemas.CreateGroupResponseDto;
    }
  }
  namespace CreateProblem {
    export type RequestBody = Components.Schemas.CreateProblemRequestDto;
    namespace Responses {
      export type $201 = Components.Schemas.CreateProblemResponseDto;
    }
  }
  namespace DeleteGroup {
    export type RequestBody = Components.Schemas.DeleteGroupRequestDto;
    namespace Responses {
      export type $201 = Components.Schemas.DeleteGroupResponseDto;
    }
  }
  namespace GetGroupMeta {
    namespace Parameters {
      export type GroupId = string;
    }
    export interface QueryParameters {
      groupId: Parameters.GroupId;
    }
    namespace Responses {
      export type $200 = Components.Schemas.GetGroupMetaResponseDto;
    }
  }
  namespace GetProblemDetail {
    namespace Parameters {
      export type DisplayId = string;
      export type Id = string;
      export type Locale = string;
    }
    export interface QueryParameters {
      id?: Parameters.Id;
      displayId?: Parameters.DisplayId;
      locale: Parameters.Locale;
    }
    namespace Responses {
      export type $200 = Components.Schemas.GetProblemDetailResponseDto;
    }
  }
  namespace GetProblemPermissions {
    namespace Parameters {
      export type PermissionType = string;
      export type ProblemId = string;
    }
    export interface QueryParameters {
      problemId: Parameters.ProblemId;
      permissionType: Parameters.PermissionType;
    }
    namespace Responses {
      export type $200 = Components.Schemas.GetProblemPermissionsResponseDto;
    }
  }
  namespace GetSelfMeta {
    namespace Responses {
      export type $200 = Components.Schemas.GetSelfMetaResponseDto;
    }
  }
  namespace GetUserMeta {
    namespace Parameters {
      export type GetPrivileges = boolean;
      export type UserId = string;
      export type Username = string;
    }
    export interface QueryParameters {
      userId?: Parameters.UserId;
      username?: Parameters.Username;
      getPrivileges: Parameters.GetPrivileges;
    }
    namespace Responses {
      export type $200 = Components.Schemas.GetUserMetaResponseDto;
    }
  }
  namespace Login {
    export type RequestBody = Components.Schemas.LoginRequestDto;
    namespace Responses {
      export type $201 = Components.Schemas.LoginResponseDto;
    }
  }
  namespace QueryProblemSet {
    export type RequestBody = Components.Schemas.QueryProblemSetRequestDto;
    namespace Responses {
      export type $201 = Components.Schemas.QueryProblemSetResponseDto;
    }
  }
  namespace Register {
    export type RequestBody = Components.Schemas.RegisterRequestDto;
    namespace Responses {
      export type $201 = Components.Schemas.RegisterResponseDto;
    }
  }
  namespace RemoveMember {
    export type RequestBody = Components.Schemas.RemoveUserFromGroupRequestDto;
    namespace Responses {
      export type $201 = Components.Schemas.RemoveUserFromGroupResponseDto;
    }
  }
  namespace SetGroupAdmin {
    export type RequestBody = Components.Schemas.SetGroupAdminRequestDto;
    namespace Responses {
      export type $201 = Components.Schemas.SetGroupAdminResponseDto;
    }
  }
  namespace SetProblemDisplayId {
    export type RequestBody = Components.Schemas.SetProblemDisplayIdRequestDto;
    namespace Responses {
      export type $201 = Components.Schemas.SetProblemDisplayIdResponseDto;
    }
  }
  namespace SetProblemPermissions {
    export type RequestBody = Components.Schemas.SetProblemPermissionsRequestDto;
    namespace Responses {
      export type $201 = Components.Schemas.SetProblemPermissionsResponseDto;
    }
  }
  namespace SetProblemPublic {
    export type RequestBody = Components.Schemas.SetProblemPublicRequestDto;
    namespace Responses {
      export type $201 = Components.Schemas.SetProblemPublicResponseDto;
    }
  }
  namespace SetUserPrivileges {
    export type RequestBody = Components.Schemas.SetUserPrivilegesRequestDto;
    namespace Responses {
      export type $201 = Components.Schemas.SetUserPrivilegesResponseDto;
    }
  }
  namespace UpdateStatement {
    export type RequestBody = Components.Schemas.UpdateProblemStatementRequestDto;
    namespace Responses {
      export type $201 = Components.Schemas.UpdateProblemStatementResponseDto;
    }
  }
  namespace UpdateUserProfile {
    export type RequestBody = Components.Schemas.UpdateUserProfileRequestDto;
    namespace Responses {
      export type $201 = Components.Schemas.UpdateUserProfileResponseDto;
    }
  }
  namespace Xdomain {
    namespace Responses {
      export type $200 = string;
    }
  }
}
