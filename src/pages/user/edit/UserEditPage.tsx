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
  Radio
} from "semantic-ui-react";
import { observer } from "mobx-react";
import { route } from "navi";
import { Link } from "react-navi";
import { Validator } from "class-validator";

import style from "./UserEdit.module.less";

import { UserApi } from "@/api";
import { appState } from "@/appState";
import toast from "@/utils/toast";
import { useIntlMessage, useFieldCheckSimple } from "@/utils/hooks";
import getUserAvatar from "@/utils/getUserAvatar";

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

interface ProfileViewProps {
  meta: ApiTypes.UserMetaDto;
  publicEmail: boolean;
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
        toast.success(_("user_edit.profile.success"));

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
        <Header className={style.header} size="tiny" content={_("user_edit.profile.telegram")} />
        <Input
          fluid
          placeholder={_("user_edit.profile.telegram_placeholder")}
          value={telegram}
          onChange={(e, { value }) => value.length < 30 && !pending && setTelegram(value.trim())}
        />
        {telegram && (
          <div className={style.notes}>
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
        <Image src={getUserAvatar(props.meta, 480)} className={style.avatar} />
        <List className={style.avatarOptionList}>
          <List.Item>
            <Radio checked label={_("user_edit.profile.avatar.gravatar")} />
          </List.Item>
          <List.Item>
            <Radio checked={false} label={_("user_edit.profile.avatar.qq")} />
          </List.Item>
          <List.Item>
            <Radio checked={false} label={_("user_edit.profile.avatar.github")} />
          </List.Item>
        </List>
        <Input className={style.avatarInput} fluid readOnly placeholder={email} />
      </div>
    </div>
  );
};

ProfileView = observer(ProfileView);

interface UserEditPageProps {
  type: EditType;
  meta?: ApiTypes.UserMetaDto;

  // profile
  publicEmail?: boolean;
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
            <Menu.Item active={props.type === EditType.Security} as={Link} href="../security">
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
            <ProfileView meta={props.meta} publicEmail={props.publicEmail} information={props.information} />
          ) : props.type === EditType.Preference ? null : null}
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
