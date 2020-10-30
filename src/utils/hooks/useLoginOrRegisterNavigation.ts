import { useCurrentRoute } from "react-navi";
import { useNavigationChecked } from "@/utils/hooks";

export function useLoginOrRegisterNavigation(bindLoginOrRegister?: "login" | "register" | "forgot") {
  const navigation = useNavigationChecked();
  const currentRoute = useCurrentRoute();

  return (loginOrRegister?: "login" | "register" | "forgot") => {
    if (!loginOrRegister) loginOrRegister = bindLoginOrRegister;

    // Save the current url for redirecting back
    let loginRedirectUrl: string;
    if (!["/login", "/register", "/forgot"].includes(currentRoute.url.pathname)) {
      loginRedirectUrl = currentRoute.url.pathname + currentRoute.url.search + currentRoute.url.hash;
    } else {
      loginRedirectUrl = currentRoute.url.query.loginRedirectUrl;
    }

    navigation.navigate({
      pathname: "/" + loginOrRegister,
      query: loginRedirectUrl && {
        loginRedirectUrl
      }
    });
  };
}
