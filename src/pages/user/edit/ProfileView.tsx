import React, { useState, useEffect } from "react";
import { Icon, Form, Header, Input, Checkbox, TextArea, Button, List, Radio } from "semantic-ui-react";
import { observer } from "mobx-react";
import { isURL } from "class-validator";
import md5 from "blueimp-md5";
import { FormattedMessage } from "react-intl";

import style from "./UserEdit.module.less";

import { UserApi } from "@/api";
import { appState } from "@/appState";
import toast from "@/utils/toast";
import { useIntlMessage, useFieldCheckSimple, useAsyncCallbackPending } from "@/utils/hooks";
import UserAvatar from "@/components/UserAvatar";
import { RouteError } from "@/AppRouter";
import { onEnterPress } from "@/utils/onEnterPress";

export async function fetchData(userId: number) {
  const { requestError, response } = await UserApi.getUserProfile({ userId });
  if (requestError) throw new RouteError(requestError, { showRefresh: true, showBack: true });
  else if (response.error) throw new RouteError(<FormattedMessage id={`user_edit.errors.${response.error}`} />);

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
  onChangeUsername: (newUsername: string) => void;
}

const ProfileView: React.FC<ProfileViewProps> = props => {
  const _ = useIntlMessage("user_edit.profile");

  const [titleUsername, setTitleUsername] = useState(props.meta.username);

  useEffect(() => {
    appState.enterNewPage(`${_(`.title`)} - ${titleUsername}`, null, false);
  }, [appState.locale, titleUsername]);

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

  const [checkUrl, urlInvalid] = useFieldCheckSimple(url, url => !url || isURL(url));

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

  const [pending, onSubmit] = useAsyncCallbackPending(async () => {
    if (urlInvalid) {
      toast.error(_(".error_invalid_url"));
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
      else if (response.error) toast.error(_(`user_edit.errors.${response.error}`));
      else {
        toast.success(_("user_edit.preference.success"));
        setTitleUsername(username);

        if (appState.currentUser.id === props.meta.id) {
          appState.currentUser.username = username;
          appState.currentUser.email = email;
          appState.currentUser.bio = bio;
        }

        if (username !== props.meta.username) props.onChangeUsername(username);
      }
    }
  });

  const hasPrivilege = appState.currentUser.isAdmin || appState.currentUserPrivileges.includes("ManageUser");
  const allowUserChangeUsername = appState.serverPreference.security.allowUserChangeUsername;

  return (
    <div className={style.profileContainer}>
      <div className={style.profileMain}>
        <Header className={style.header} size="tiny" content={_(".username")} />
        <Input
          readOnly={!(hasPrivilege || allowUserChangeUsername)}
          fluid
          value={username}
          onChange={(e, { value }) => !pending && setUsername(value)}
        />
        {!(allowUserChangeUsername && props.meta.id === appState.currentUser.id) && (
          <div className={style.notes}>{_(!hasPrivilege ? ".username_notes" : ".username_notes_admin")}</div>
        )}
        <Header className={style.header} size="tiny" content={_(".email")} />
        <Input readOnly={!hasPrivilege} fluid value={email} onChange={(e, { value }) => !pending && setEmail(value)} />
        <Checkbox
          className={style.checkbox}
          checked={publicEmail}
          label={_(".public_email")}
          onChange={(e, { checked }) => !pending && setPublicEmail(checked)}
        />
        <div className={style.notes}>{_(!hasPrivilege ? ".email_notes" : ".email_notes_admin")}</div>
        <Header className={style.header} size="tiny" content={_(".bio")} />
        <Form>
          <TextArea
            className={style.textarea}
            placeholder={_(".bio_placeholder")}
            value={bio}
            onChange={(e, { value }) => (value as string).length <= 190 && !pending && setBio(value as string)}
          />
        </Form>
        {bio.length >= 190 - 10 && <div className={style.notes}>{bio.length}/190</div>}
        <Header className={style.header} size="tiny" content={_(".organization")} />
        <Input
          fluid
          placeholder={_(".organization_placeholder")}
          value={organization}
          onChange={(e, { value }) => value.length < 80 && !pending && setOrganization(value)}
        />
        <Header className={style.header} size="tiny" content={_(".location")} />
        <Input
          fluid
          placeholder={_(".location_placeholder")}
          value={location}
          onChange={(e, { value }) => value.length < 80 && !pending && setLocation(value)}
        />
        <Header className={style.header} size="tiny" content={_(".url")} />
        <Input
          fluid
          placeholder={_(".url_placeholder")}
          value={url}
          error={urlInvalid}
          onBlur={checkUrl}
          onChange={(e, { value }) => value.length < 80 && !pending && setUrl(value.trim())}
        />
        <Header className={style.header} size="tiny" content={_(".qq")} />
        <Input
          fluid
          placeholder={_(".qq_placeholder")}
          value={qq}
          onChange={(e, { value }) => value.length < 30 && !pending && setQq(value.trim())}
        />
        {qq && (
          <div className={style.notes}>
            <Icon name="qq" />
            {_(".qq_notes")}
            <a href={`https://wpa.qq.com/msgrd?V=3&Uin=${qq}`} target="_blank">
              https://wpa.qq.com/msgrd?V=3&Uin={qq}
            </a>
          </div>
        )}
        <Header className={style.header} size="tiny" content={_(".telegram")} />
        <Input
          fluid
          placeholder={_(".telegram_placeholder")}
          value={telegram}
          onChange={(e, { value }) => value.length < 30 && !pending && setTelegram(value.trim())}
        />
        {telegram && (
          <div className={style.notes}>
            <Icon name="telegram" />
            {_(".telegram_notes")}
            <a href={`https://t.me/${telegram}`} target="_blank">
              https://t.me/{telegram}
            </a>
          </div>
        )}
        <Header className={style.header} size="tiny" content={_(".github")} />
        <Input
          fluid
          placeholder={_(".github_placeholder")}
          value={github}
          onChange={(e, { value }) => value.length < 30 && !pending && setGithub(value.trim())}
        />
        {github && (
          <div className={style.notes}>
            <Icon name="github" />
            {_(".github_notes")}
            <a href={`https://github.com/${github}`} target="_blank">
              https://github.com/{github}
            </a>
          </div>
        )}
        <Button className={style.submit} loading={pending} primary content={_(".submit")} onClick={onSubmit} />
      </div>
      <div className={style.profileAvatar}>
        <Header className={style.header} size="tiny" content={_(".avatar.header")} />
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
              label={_(".avatar.gravatar.name")}
            />
          </List.Item>
          <List.Item>
            <Radio
              checked={avatarType === AvatarType.QQ}
              onChange={(e, { checked }) => checked && changeAvatarType(AvatarType.QQ)}
              label={_(".avatar.qq.name")}
            />
          </List.Item>
          <List.Item>
            <Radio
              checked={avatarType === AvatarType.GitHub}
              onChange={(e, { checked }) => checked && changeAvatarType(AvatarType.GitHub)}
              label={_(".avatar.github.name")}
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
              ? _(".avatar.github.placeholder")
              : _(".avatar.qq.placeholder")
          }
          error={avatarError}
          value={avatarKeyValue}
          onChange={(e, { value }) => value.length <= 40 && setAvatarKeyValue(value.trim())}
          onBlur={applyAvatarKey}
          onKeyPress={onEnterPress(() => applyAvatarKey())}
        />
        {avatarError && (
          <div className={style.notes}>
            <Icon name="warning sign" />
            {_(".avatar.error")}
          </div>
        )}
      </div>
    </div>
  );
};

export const View = observer(ProfileView);
