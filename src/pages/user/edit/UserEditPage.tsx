import React, { useEffect, useState } from "react";
import {
  Grid,
  Menu,
  Icon,
  Image,
  Form,
  Header,
  Input,
  Checkbox,
  TextArea,
  Button,
  List,
  Radio,
  Dropdown,
  Select,
  Flag,
  Segment
} from "semantic-ui-react";
import { observer } from "mobx-react";
import { route } from "navi";
import { Link, useNavigation } from "react-navi";
import { Validator } from "class-validator";
import md5 from "blueimp-md5";

import style from "./UserEdit.module.less";

import { UserApi } from "@/api";
import { appState, browserDefaultLocale } from "@/appState";
import toast from "@/utils/toast";
import { useIntlMessage, useFieldCheckSimple } from "@/utils/hooks";
import UserAvatar from "@/components/UserAvatar";
import { Locale } from "@/interfaces/Locale";
import localeMeta from "@/locales/meta";
import * as CodeFormatter from "@/utils/CodeFormatter";
import {
  CodeLanguage,
  codeLanguageOptions,
  CodeLanguageOptionType,
  filterValidLanguageOptions,
  getDefaultCodeLanguageOptions
} from "@/interfaces/CodeLanguage";
import { HighlightedCodeBox } from "@/components/CodeBox";

enum EditType {
  Profile = "profile",
  Preference = "preference",
  Security = "security"
}

async function fetchDataProfile(userId: number) {
  const { requestError, response } = await UserApi.getUserProfile({ userId });
  if (requestError || response.error) {
    toast.error(requestError || response.error);
    return null;
  }

  return response;
}

async function fetchDataPreference(userId: number) {
  const { requestError, response } = await UserApi.getUserPreference({ userId });
  if (requestError || response.error) {
    toast.error(requestError || response.error);
    return null;
  }

  return response;
}

enum AvatarType {
  Gravatar = "gravatar",
  GitHub = "github",
  QQ = "qq"
}

interface ProfileViewProps {
  meta: ApiTypes.UserMetaDto;
  publicEmail: boolean;
  avatarInfo: string;
  information: ApiTypes.UserInformationDto;
}

let ProfileView: React.FC<ProfileViewProps> = props => {
  const _ = useIntlMessage();

  const [username, setUsername] = useState(props.meta.username);
  const [email, setEmail] = useState(props.meta.email);
  const [publicEmail, setPublicEmail] = useState(props.publicEmail);
  const [bio, setBio] = useState(props.meta.bio);

  const [organization, setOrganization] = useState(props.information.organization);
  const [location, setLocation] = useState(props.information.location);
  const [url, setUrl] = useState(props.information.url);
  const [telegram, setTelegram] = useState(props.information.telegram);
  const [qq, setQq] = useState(props.information.qq);
  const [github, setGithub] = useState(props.information.github);

  const [checkUrl, urlInvalid] = useFieldCheckSimple(url, url => !url || new Validator().isURL(url));

  const avatarTypeFromServer = props.avatarInfo.substr(0, props.avatarInfo.indexOf(":")) as AvatarType;

  const [avatarType, setAvatarType] = useState(
    Object.values(AvatarType).includes(avatarTypeFromServer) ? avatarTypeFromServer : AvatarType.Gravatar
  );
  const [avatarKey, setAvatarKey] = useState(props.avatarInfo.slice(props.avatarInfo.indexOf(":") + 1));

  // Don't let the avatar reload too quick, use another state to store the input's value
  const [avatarKeyValue, setAvatarKeyValue] = useState(avatarKey);

  function changeAvatarType(type: AvatarType) {
    setAvatarType(type);
    switch (type) {
      case AvatarType.Gravatar:
        resetAvatarKey("");
        break;
      case AvatarType.GitHub:
        resetAvatarKey(github);
        break;
      case AvatarType.QQ:
        resetAvatarKey(qq);
        break;
    }
  }

  function resetAvatarKey(value: string) {
    if (value !== avatarKey) {
      setAvatarKey(value);
      setAvatarKeyValue(value);
      setAvatarError(false);
    }
  }

  function applyAvatarKey() {
    if (avatarKeyValue !== avatarKey) {
      setAvatarKey(avatarKeyValue);
      setAvatarError(false);
    }
  }

  function getAvatar(): ApiTypes.UserAvatarDto {
    switch (avatarType) {
      case AvatarType.GitHub:
      case AvatarType.QQ:
        return {
          type: avatarType,
          key: avatarKey
        };
      case AvatarType.Gravatar:
      default:
        return {
          type: AvatarType.Gravatar,
          key: md5((avatarKey || email).trim().toLowerCase())
        };
    }
  }
  const avatar = getAvatar();

  const [avatarError, setAvatarError] = useState(false);

  const [pending, setPending] = useState(false);
  async function onSubmit() {
    if (pending) return;
    setPending(true);

    if (urlInvalid) {
      toast.error(_("user_edit.profile.error_invalid_url"));
    } else {
      const { requestError, response } = await UserApi.updateUserProfile({
        userId: props.meta.id,
        username,
        email,
        publicEmail,
        avatarInfo: avatarType + ":" + avatarKeyValue,
        bio,
        information: {
          organization,
          location,
          url,
          telegram,
          qq,
          github
        }
      });

      if (requestError) toast.error(requestError);
      else if (response.error) toast.error(_(`user_edit.error.${response.error}`));
      else {
        toast.success(_("user_edit.preference.success"));

        if (appState.loggedInUser.id === props.meta.id) {
          appState.loggedInUser.username = username;
          appState.loggedInUser.email = email;
          appState.loggedInUser.bio = bio;
        }
      }
    }

    setPending(false);
  }

  const hasPrivilege = appState.loggedInUser.isAdmin;

  return (
    <div className={style.profileContainer}>
      <div className={style.profileMain}>
        <Header className={style.header} size="tiny" content={_("user_edit.profile.username")} />
        <Input
          readOnly={!hasPrivilege}
          fluid
          value={username}
          onChange={(e, { value }) => !pending && setUsername(value)}
        />
        <div className={style.notes}>
          {_(!hasPrivilege ? "user_edit.profile.username_notes" : "user_edit.profile.username_notes_admin")}
        </div>
        <Header className={style.header} size="tiny" content={_("user_edit.profile.email")} />
        <Input readOnly={!hasPrivilege} fluid value={email} onChange={(e, { value }) => !pending && setEmail(value)} />
        <Checkbox
          className={style.checkbox}
          checked={publicEmail}
          label={_("user_edit.profile.public_email")}
          onChange={(e, { checked }) => !pending && setPublicEmail(checked)}
        />
        <div className={style.notes}>
          {_(!hasPrivilege ? "user_edit.profile.email_notes" : "user_edit.profile.email_notes_admin")}
        </div>
        <Header className={style.header} size="tiny" content={_("user_edit.profile.bio")} />
        <Form>
          <TextArea
            className={style.textarea}
            placeholder={_("user_edit.profile.bio_placeholder")}
            value={bio}
            onChange={(e, { value }) => (value as string).length <= 190 && !pending && setBio(value as string)}
          />
        </Form>
        {bio.length >= 190 - 10 && <div className={style.notes}>{bio.length}/190</div>}
        <Header className={style.header} size="tiny" content={_("user_edit.profile.organization")} />
        <Input
          fluid
          placeholder={_("user_edit.profile.organization_placeholder")}
          value={organization}
          onChange={(e, { value }) => value.length < 80 && !pending && setOrganization(value)}
        />
        <Header className={style.header} size="tiny" content={_("user_edit.profile.location")} />
        <Input
          fluid
          placeholder={_("user_edit.profile.location_placeholder")}
          value={location}
          onChange={(e, { value }) => value.length < 80 && !pending && setLocation(value)}
        />
        <Header className={style.header} size="tiny" content={_("user_edit.profile.url")} />
        <Input
          fluid
          placeholder={_("user_edit.profile.url_placeholder")}
          value={url}
          error={urlInvalid}
          onBlur={checkUrl}
          onChange={(e, { value }) => value.length < 80 && !pending && setUrl(value.trim())}
        />
        <Header className={style.header} size="tiny" content={_("user_edit.profile.qq")} />
        <Input
          fluid
          placeholder={_("user_edit.profile.qq_placeholder")}
          value={qq}
          onChange={(e, { value }) => value.length < 30 && !pending && setQq(value.trim())}
        />
        {qq && (
          <div className={style.notes}>
            <Icon name="qq" />
            {_("user_edit.profile.qq_notes")}
            <a href={`https://wpa.qq.com/msgrd?V=3&Uin=${qq}`} target="_blank">
              https://wpa.qq.com/msgrd?V=3&Uin={qq}
            </a>
          </div>
        )}
        <Header className={style.header} size="tiny" content={_("user_edit.profile.telegram")} />
        <Input
          fluid
          placeholder={_("user_edit.profile.telegram_placeholder")}
          value={telegram}
          onChange={(e, { value }) => value.length < 30 && !pending && setTelegram(value.trim())}
        />
        {telegram && (
          <div className={style.notes}>
            <Icon name="telegram" />
            {_("user_edit.profile.telegram_notes")}
            <a href={`https://t.me/${telegram}`} target="_blank">
              https://t.me/{telegram}
            </a>
          </div>
        )}
        <Header className={style.header} size="tiny" content={_("user_edit.profile.github")} />
        <Input
          fluid
          placeholder={_("user_edit.profile.github_placeholder")}
          value={github}
          onChange={(e, { value }) => value.length < 30 && !pending && setGithub(value.trim())}
        />
        {github && (
          <div className={style.notes}>
            <Icon name="github" />
            {_("user_edit.profile.github_notes")}
            <a href={`https://github.com/${github}`} target="_blank">
              https://github.com/{github}
            </a>
          </div>
        )}
        <Button
          className={style.submit}
          loading={pending}
          primary
          content={_("user_edit.profile.submit")}
          onClick={onSubmit}
        />
      </div>
      <div className={style.profileAvatar}>
        <Header className={style.header} size="tiny" content={_("user_edit.profile.avatar.header")} />
        <UserAvatar
          userAvatar={avatar}
          placeholder={!avatar.key}
          imageSize={480}
          className={style.avatar}
          onError={() => setAvatarError(true)}
        />
        <List className={style.avatarOptionList}>
          <List.Item>
            <Radio
              checked={avatarType === AvatarType.Gravatar}
              onChange={(e, { checked }) => checked && changeAvatarType(AvatarType.Gravatar)}
              label={_("user_edit.profile.avatar.gravatar.name")}
            />
          </List.Item>
          <List.Item>
            <Radio
              checked={avatarType === AvatarType.QQ}
              onChange={(e, { checked }) => checked && changeAvatarType(AvatarType.QQ)}
              label={_("user_edit.profile.avatar.qq.name")}
            />
          </List.Item>
          <List.Item>
            <Radio
              checked={avatarType === AvatarType.GitHub}
              onChange={(e, { checked }) => checked && changeAvatarType(AvatarType.GitHub)}
              label={_("user_edit.profile.avatar.github.name")}
            />
          </List.Item>
        </List>
        <Input
          className={style.avatarInput}
          fluid
          placeholder={
            avatarType === AvatarType.Gravatar
              ? email
              : avatarType === AvatarType.GitHub
              ? _("user_edit.profile.avatar.github.placeholder")
              : _("user_edit.profile.avatar.qq.placeholder")
          }
          error={avatarError}
          value={avatarKeyValue}
          onChange={(e, { value }) => value.length <= 40 && setAvatarKeyValue(value.trim())}
          onBlur={applyAvatarKey}
          onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
            if (e.keyCode === 13) {
              e.preventDefault();
              applyAvatarKey();
            }
          }}
        />
        {avatarError && (
          <div className={style.notes}>
            <Icon name="warning sign" />
            {_("user_edit.profile.avatar.error")}
          </div>
        )}
      </div>
    </div>
  );
};

ProfileView = observer(ProfileView);

interface PreferenceViewProps {
  meta?: ApiTypes.UserMetaDto;
  preference?: ApiTypes.UserPreferenceDto;
}

const PreferenceView: React.FC<PreferenceViewProps> = props => {
  const _ = useIntlMessage();
  const navigation = useNavigation();

  const [systemLocale, setSystemLocale] = useState<Locale>((props.preference.systemLocale || null) as Locale);
  const [contentLocale, setContentLocale] = useState<Locale>((props.preference.contentLocale || null) as Locale);
  const [codeFormatterOptions, setCodeFormatterOptions] = useState(props.preference.codeFormatterOptions || "");
  const [doNotFormatCodeByDefault, setDoNotFormatCodeByDefault] = useState(!!props.preference.doNotFormatCodeByDefault);

  // Validate the code language and options value to prevent garbage data on server
  const [defaultCodeLanguage, setDefaultCodeLanguage] = useState(
    Object.values(CodeLanguage).includes(props.preference.defaultCodeLanguage as CodeLanguage)
      ? (props.preference.defaultCodeLanguage as CodeLanguage)
      : CodeLanguage.CPP
  );
  const [defaultCodeLanguageOptions, setDefaultCodeLanguageOptions] = useState(
    filterValidLanguageOptions(defaultCodeLanguage, props.preference.defaultCodeLanguageOptions)
  );
  function changeDefaultCodeLanguage(codeLanguage: CodeLanguage) {
    setDefaultCodeLanguage(codeLanguage);
    setDefaultCodeLanguageOptions(getDefaultCodeLanguageOptions(codeLanguage));
  }
  function setDefaultCodeLanguageOption(name: string, value: unknown) {
    setDefaultCodeLanguageOptions(
      Object.assign(defaultCodeLanguageOptions, {
        [name]: value
      })
    );
  }

  const defaultSystemLocale = browserDefaultLocale;
  const defaultContentLocale = systemLocale || browserDefaultLocale;

  const [pending, setPending] = useState(false);

  async function onSubmit() {
    if (pending) return;
    setPending(true);

    const { requestError, response } = await UserApi.updateUserPreference({
      userId: props.meta.id,
      preference: {
        systemLocale,
        contentLocale,
        codeFormatterOptions,
        doNotFormatCodeByDefault,
        defaultCodeLanguage,
        defaultCodeLanguageOptions
      }
    });

    if (requestError) toast.error(requestError);
    else if (response.error) toast.error(_(`user_edit.error.${response.error}`));
    else {
      toast.success(_("user_edit.preference.success"));

      if (appState.loggedInUser.id === props.meta.id) {
        if (appState.userPreference.systemLocale !== systemLocale) {
          appState.userPreference.systemLocale = systemLocale;
          navigation.refresh();
        }
        appState.userPreference.contentLocale = contentLocale;
        appState.userPreference.codeFormatterOptions = codeFormatterOptions;
        appState.userPreference.doNotFormatCodeByDefault = doNotFormatCodeByDefault;
        appState.userPreference.defaultCodeLanguage = defaultCodeLanguage;
        appState.userPreference.defaultCodeLanguageOptions = defaultCodeLanguageOptions;
      }
    }

    setPending(false);
  }

  const previewCode = `#include<cstdio>

class OrangeCat : public Cat {
public:
  template <typename T, std::enable_if_t<std::is_base_of<Fish, T>, int> = 0>
  void eat(T& fish) {
    fish.destory ();
  }

  virtual bool isFat() const {return true;}
}cat;

int main(int argc,char**argv)
{
    switch(argc) {
    case 1:
        if(**argv==' ')
            return 1;
        else{
            do
                {std::cout << *argv << std::endl;}
            while (1);
        }
        break;
    }
    return 0;
}`;

  const [formatPreviewSuccess, formattedPreviewResult] = CodeFormatter.format(
    previewCode,
    CodeLanguage.CPP,
    codeFormatterOptions || CodeFormatter.defaultOptions
  );

  return (
    <>
      <Header className={style.sectionHeader} size="large" content={_("user_edit.preference.locale.header")} />
      <Header className={style.header} size="tiny" content={_("user_edit.preference.locale.system")} />
      <Select
        className={style.notFullWidth}
        fluid
        value={systemLocale || "DEFAULT"}
        onChange={(e, { value }) => setSystemLocale((value === "DEFAULT" ? null : value) as Locale)}
        options={[
          {
            key: "DEFAULT",
            value: "DEFAULT",
            text: (
              <>
                <Flag name={localeMeta[defaultSystemLocale].flag as any} />
                {_("user_edit.preference.locale.system_default", { name: localeMeta[defaultSystemLocale].name })}
              </>
            )
          },
          ...Object.entries(localeMeta).map(([locale, meta]) => ({
            text: (
              <>
                <Flag name={meta.flag as any} />
                {meta.name}
              </>
            ),
            value: locale,
            key: locale
          }))
        ]}
      />
      <div className={style.notes}>{_("user_edit.preference.locale.system_notes")}</div>
      <Header className={style.header} size="tiny" content={_("user_edit.preference.locale.content")} />
      <Select
        className={style.notFullWidth}
        fluid
        value={contentLocale || "DEFAULT"}
        onChange={(e, { value }) => setContentLocale((value === "DEFAULT" ? null : value) as Locale)}
        options={[
          {
            key: "DEFAULT",
            value: "DEFAULT",
            text: (
              <>
                <Flag name={localeMeta[defaultContentLocale].flag as any} />
                {_("user_edit.preference.locale.content_default", { name: localeMeta[defaultContentLocale].name })}
              </>
            )
          },
          ...Object.entries(localeMeta).map(([locale, meta]) => ({
            text: (
              <>
                <Flag name={meta.flag as any} />
                {meta.name}
              </>
            ),
            value: locale,
            key: locale
          }))
        ]}
      />
      <div className={style.notes}>{_("user_edit.preference.locale.content_notes")}</div>
      <Header className={style.sectionHeader} size="large" content={_("user_edit.preference.code_language.header")} />
      <Header className={style.header} size="tiny" content={_("user_edit.preference.code_language.language")} />
      <Select
        className={style.notFullWidth}
        fluid
        value={defaultCodeLanguage}
        options={Object.keys(codeLanguageOptions).map(language => ({
          key: language,
          value: language,
          text: _(`code_language.${language}.name`)
        }))}
        onChange={(e, { value }) => changeDefaultCodeLanguage(value as CodeLanguage)}
      />
      <div className={style.notFullWidth}>
        {codeLanguageOptions[defaultCodeLanguage].map(option => {
          switch (option.type) {
            case CodeLanguageOptionType.Select:
              return (
                <div key={option.name} className={style.halfWidthFieldContainer}>
                  <Header
                    className={style.header}
                    size="tiny"
                    content={_(`code_language.${defaultCodeLanguage}.options.${option.name}.name`)}
                  />
                  <Select
                    fluid
                    value={
                      defaultCodeLanguageOptions[option.name] == null
                        ? option.defaultValue
                        : (defaultCodeLanguageOptions[option.name] as string)
                    }
                    options={option.values.map(value => ({
                      key: value,
                      value: value,
                      text: _(`code_language.${defaultCodeLanguage}.options.${option.name}.values.${value}`)
                    }))}
                    onChange={(e, { value }) => setDefaultCodeLanguageOption(option.name, value)}
                  />
                </div>
              );
          }
        })}
      </div>
      <div className={style.notes}>{_("user_edit.preference.code_language.content_notes")}</div>
      <Header className={style.sectionHeader} size="large" content={_("user_edit.preference.code_formatter.header")} />
      <Header className={style.header} size="tiny" content={_("user_edit.preference.code_formatter.astyle_options")} />
      <Form>
        <TextArea
          className={style.textarea}
          rows="5"
          placeholder={CodeFormatter.defaultOptions}
          value={codeFormatterOptions}
          onChange={(e, { value }: { value: string }) =>
            value.length < 1024 && !pending && setCodeFormatterOptions(value)
          }
        />
      </Form>
      <div className={style.notes}>
        {_("user_edit.preference.code_formatter.notes_before")}
        <a href="http://astyle.sourceforge.net/astyle.html" target="_blank">
          &nbsp;{_("user_edit.preference.code_formatter.notes_link")}&nbsp;
        </a>
        {_("user_edit.preference.code_formatter.notes_after")}
      </div>
      <Checkbox
        className={style.checkbox}
        checked={!doNotFormatCodeByDefault}
        label={_("user_edit.preference.code_formatter.format_code_by_default")}
        onChange={(e, { checked }) => !pending && setDoNotFormatCodeByDefault(!checked)}
      />
      <Header
        className={style.header}
        size="tiny"
        content={_(
          formatPreviewSuccess
            ? "user_edit.preference.code_formatter.preview"
            : "user_edit.preference.code_formatter.error"
        )}
      />
      <HighlightedCodeBox
        segment={{
          color: formatPreviewSuccess ? "green" : "red"
        }}
        language={formatPreviewSuccess ? "cpp" : null}
        code={formattedPreviewResult}
      />
      <Button
        className={style.submit}
        loading={pending}
        disabled={!formatPreviewSuccess}
        primary
        content={_("user_edit.preference.submit")}
        onClick={onSubmit}
      />
    </>
  );
};

interface UserEditPageProps {
  type: EditType;
  meta?: ApiTypes.UserMetaDto;

  // profile
  publicEmail?: boolean;
  avatarInfo?: string;
  information?: ApiTypes.UserInformationDto;

  // preference
  preference?: ApiTypes.UserPreferenceDto;
}

let UserEditPage: React.FC<UserEditPageProps> = props => {
  const _ = useIntlMessage();

  useEffect(() => {
    appState.enterNewPage(`${_(`user_edit.title.${props.type}`)} - ${props.meta.username}`, false);
  }, [appState.locale]);

  return (
    <>
      <div className={style.container}>
        <div className={style.menu}>
          <Menu secondary vertical>
            <Menu.Item active={props.type === EditType.Profile} as={Link} href="../profile">
              <Icon name="user" />
              {_("user_edit.menu.profile")}
            </Menu.Item>
            <Menu.Item active={props.type === EditType.Preference} as={Link} href="../preference">
              <Icon name="setting" />
              {_("user_edit.menu.preference")}
            </Menu.Item>
            <Menu.Item active={props.type === EditType.Security} as={Link} /* href="../security" */>
              <Icon name="lock" />
              {_("user_edit.menu.security")}
            </Menu.Item>
          </Menu>
          <Link href="../..">
            <Icon name="arrow left" />
            {_("user_edit.back_to_profile")}
          </Link>
        </div>
        <div className={style.main}>
          {props.type === EditType.Profile ? (
            <ProfileView
              meta={props.meta}
              publicEmail={props.publicEmail}
              avatarInfo={props.avatarInfo}
              information={props.information}
            />
          ) : props.type === EditType.Preference ? (
            <PreferenceView meta={props.meta} preference={props.preference} />
          ) : null}
        </div>
      </div>
    </>
  );
};

UserEditPage = observer(UserEditPage);

export default route({
  async getView(request) {
    let type = request.params.type as EditType;
    if (!Object.values(EditType).includes(type)) type = EditType.Profile;

    const fetchData: (userId: number) => Promise<Omit<UserEditPageProps, "type">> = {
      [EditType.Profile]: fetchDataProfile,
      [EditType.Preference]: fetchDataPreference
    }[type];

    const response = await fetchData(parseInt(request.params.userId) || 0);
    if (!response) return null;
    return <UserEditPage type={type} {...response} />;
  }
});
