import React from "react";
import { useGoogleReCaptcha } from "react-google-recaptcha-v3";

import { appState } from "@/appState";
import { useLocalizer } from "./useLocalizer";

export function useRecaptcha() {
  const { executeRecaptcha } = useGoogleReCaptcha();
  const _ = useLocalizer("common.recaptcha");

  const recaptcha = appState.serverPreference.security.recaptchaEnabled
    ? appState.currentUserHasPrivilege("SkipRecaptcha")
      ? async () => "skip"
      : async (action: string) => {
          try {
            return await executeRecaptcha(action);
          } catch (e) {
            console.error("Recaptcha Error:", e);
            return null;
          }
        }
    : async () => "";

  return Object.assign(recaptcha, {
    getCopyrightMessage: (className: string) =>
      appState.serverPreference.security.recaptchaEnabled ? (
        <span className={className} dangerouslySetInnerHTML={{ __html: _(".copyright") }} />
      ) : null
  });
}
