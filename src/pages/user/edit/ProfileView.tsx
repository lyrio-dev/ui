import React, { useState } from "react";
import { Icon, Form, Header, Input, Checkbox, TextArea, Button, List, Radio } from "semantic-ui-react";
import { observer } from "mobx-react";
import { Validator } from "class-validator";
import md5 from "blueimp-md5";

import style from "./UserEdit.module.less";

import { UserApi } from "@/api";
import { appState } from "@/appState";
import toast from "@/utils/toast";
import { useIntlMessage, useFieldCheckSimple } from "@/utils/hooks";
import UserAvatar from "@/components/UserAvatar";

export async function fetchData(userId: number) {
  const { requestError, response } = await UserApi.getUserProfile({ userId });
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

const ProfileView: React.FC<ProfileViewProps> = props => {
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

export const View = observer(ProfileView);
