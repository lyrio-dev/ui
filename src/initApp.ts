import { appState, initAppStateStore } from "@/appState";
import { loadGoogleAnalytics, loadPlausible } from "@/misc/analytics";

// Wait for getSessionInfo JSONP API returns
async function waitForSessionInitialization() {
  const sessionInfo =
    window.sessionInfo ||
    (await new Promise(resolve => {
      window.getSessionInfoCallback = sessionInfo => {
        resolve(sessionInfo);
        delete window.getSessionInfoCallback;
      };
    }));

  delete window.sessionInfo;

  appState.currentUser = sessionInfo.userMeta;
  appState.currentUserJoinedGroupsCount = sessionInfo.joinedGroupsCount;
  appState.currentUserPrivileges = sessionInfo.userPrivileges || [];
  appState.userPreference = sessionInfo.userPreference || {};
  appState.serverPreference = sessionInfo.serverPreference;
  appState.serverVersion = sessionInfo.serverVersion;
}

export default async function initApp() {
  await Promise.all([initAppStateStore(), waitForSessionInitialization()]);
  loadGoogleAnalytics(appState.serverPreference.misc.googleAnalyticsId);
  loadPlausible(appState.serverPreference.misc.plausibleApiEndpoint);
}

export const refreshSession = async () => {
  window.refreshSession(appState.token);
  await waitForSessionInitialization();
};
