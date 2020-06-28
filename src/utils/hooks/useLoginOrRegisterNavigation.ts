import { useNavigation, useCurrentRoute } from "react-navi";

export function useLoginOrRegisterNavigation(bindLoginOrRegister?: "login" | "register") {
  const navigation = useNavigation();
  const currentRoute = useCurrentRoute();

  return (loginOrRegister?: "login" | "register") => {
    if (!loginOrRegister) loginOrRegister = bindLoginOrRegister;

    // Save the current url for redirecting back
    let loginRedirectUrl: string;
    if (currentRoute.url.pathname !== "/login" && currentRoute.url.pathname !== "/register") {
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
