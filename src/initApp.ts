import { appState, initAppStateStore } from "@/appState";

import { AuthApi } from "@/api";

export default async function initApp() {
  await initAppStateStore();

  if (appState.token) {
    // Get current logged in user's meta
    const { requestError, response } = await AuthApi.getCurrentUserAndPreference();
    appState.currentUser = response.userMeta;
    appState.currentUserPrivileges = response.userPrivileges || [];
    appState.userPreference = response.userPreference || {};
    appState.serverPreference = response.serverPreference;
  }
}
