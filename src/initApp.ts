import { appState, initAppStateStore } from "@/appState";

import { AuthApi } from "@/api";

export default async function initApp() {
  await initAppStateStore();

  // Get current logged in user's meta
  const { requestError, response } = await AuthApi.getCurrentUserAndPreference();
  if (requestError) throw new Error(requestError);
  appState.currentUser = response.userMeta;
  appState.currentUserJoinedGroupsCount = response.joinedGroupsCount;
  appState.currentUserPrivileges = response.userPrivileges || [];
  appState.userPreference = response.userPreference || {};
  appState.serverPreference = response.serverPreference;
}
