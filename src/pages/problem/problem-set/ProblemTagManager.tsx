import React, { useState, useRef } from "react";
import {
  Header,
  Button,
  Popup,
  Segment,
  Label,
  Icon,
  Form,
  Menu,
  Flag,
  Input,
  Radio,
  Dropdown
} from "semantic-ui-react";
import { observer } from "mobx-react";

import style from "./ProblemTagManager.module.less";

import { useDialog, useLocalizer, useConfirmUnload } from "@/utils/hooks";
import { ProblemApi } from "@/api-generated";
import toast from "@/utils/toast";
import { appState } from "@/appState";
import { Locale } from "@/interfaces/Locale";
import localeMeta from "@/locales/meta";
import { tagColors, sortTagColors } from "../problemTag";

interface TagProps {
  disabled: boolean;
  promptEdit: boolean;
  editing: boolean;
  color: string;
  name: string;
  onEdit: () => void;
  onDelete: () => void;
}

const Tag: React.FC<TagProps> = props => {
  const _ = useLocalizer("problem_tag_manager");

  // Prevent the clicks on delete icon or delete icon's popup trigger an click event on the label
  const refClickDisabled = useRef(false);

  const [editPromptOpened, setEditPromptOpened] = useState(false);
  return (
    <Popup
      open={editPromptOpened}
      onClose={() => setEditPromptOpened(false)}
      popperModifiers={[
        {
          name: "preventOverflow",
          options: { enabled: false }
        }
      ]}
      trigger={
        <Label
          as="a"
          className={style.tag}
          content={props.name}
          color={props.color as any}
          removeIcon={
            <Popup
              className={style.deleteTagPopup}
              popperModifiers={[
                {
                  name: "preventOverflow",
                  options: { enabled: false }
                }
              ]}
              trigger={
                <Icon
                  name="delete"
                  disabled={props.disabled}
                  onClick={() => {
                    refClickDisabled.current = true;
                    setTimeout(() => (refClickDisabled.current = false), 0);
                  }}
                />
              }
              disabled={props.disabled}
              content={
                <Button
                  negative
                  content={_(".confirm_delete_tag")}
                  loading={props.disabled}
                  onClick={() => {
                    refClickDisabled.current = true;
                    setTimeout(() => (refClickDisabled.current = false), 0);
                    props.onDelete();
                  }}
                />
              }
              position="right center"
              on="click"
            />
          }
          onClick={() => {
            if (refClickDisabled.current) return;
            if (props.editing) return;
            if (props.promptEdit) setEditPromptOpened(true);
            else props.onEdit();
          }}
          onRemove={() => undefined}
        />
      }
      disabled={!props.promptEdit}
      content={
        <Button
          negative
          content={_(".confirm_discard_unsaved")}
          onClick={() => {
            if (props.editing) return;
            props.onEdit();
            setEditPromptOpened(false);
          }}
        />
      }
      position="bottom center"
      on="click"
    />
  );
};

interface ProblemTagManagerProps {
  refOpen: React.MutableRefObject<() => Promise<boolean>>;
}

let ProblemTagManager: React.FC<ProblemTagManagerProps> = props => {
  const _ = useLocalizer("problem_tag_manager");

  const [modified, setModified] = useState(false);
  useConfirmUnload(() => modified);

  const [tags, setTags] = useState<Record<number, ApiTypes.ProblemTagWithAllLocalesDto>>({});
  const tagsCount = Object.keys(tags).length;

  const tagLocalizedNames = Object.fromEntries(
    Object.entries(tags).map(([i, tag]) => {
      const matching = tag.localizedNames.find(localizedName => localizedName.locale === appState.locale);
      if (matching) return [i, matching.name];
      return [i, tag.localizedNames[0].name];
    })
  );

  const colors = sortTagColors(Array.from(new Set(Object.values(tags).map(tag => tag.color))));
  const tagsByColor = Object.fromEntries(
    colors.map(color => [
      color,
      Object.entries(tags)
        .map(([i, tag]) => (tag.color === color ? Number(i) : null))
        .filter(x => x != null)
        .sort((i, j) =>
          tagLocalizedNames[i] < tagLocalizedNames[j] ? -1 : tagLocalizedNames[i] > tagLocalizedNames[j] ? 1 : 0
        )
    ])
  );

  const [pendingDelete, setPendingDelete] = useState(false);
  const [pendingSubmit, setPendingSubmit] = useState(false);

  const pending = pendingDelete || pendingSubmit;

  async function onDeleteTag(tagId: number) {
    if (pending) return;
    setPendingDelete(true);

    const { requestError, response } = await ProblemApi.deleteProblemTag({
      id: tagId
    });
    if (requestError) toast.error(requestError(_));
    else if (response.error) toast.error(`.error.${response.error}`);
    else {
      const newTags = Object.assign({}, tags);
      delete newTags[tagId];
      setTimeout(() => setTags(newTags), 0);
      if (tagId === editingTagId) initNewTag();
    }

    setPendingDelete(false);
  }

  const [editingTagId, setEditingTagId] = useState<number>(null);
  const [editingTagColor, setEditingTagColor] = useState<string>("blue");
  const [editingTagLocalizedNames, setEditingTagLocalizedNames] = useState<Partial<Record<Locale, string>>>({
    [appState.locale]: ""
  });
  const [editingTagDefaultLocale, setEditingTagDefaultLocale] = useState(appState.locale);

  async function onSubmit() {
    if (pending) return;
    setPendingSubmit(true);

    const localizedNames: ApiTypes.ProblemTagLocalizedNameDto[] = Object.entries(editingTagLocalizedNames).map(
      ([locale, name]) => ({
        locale: locale as any,
        name
      })
    );
    if (localizedNames[0].locale !== editingTagDefaultLocale) {
      const i = localizedNames.findIndex(localizedName => localizedName.locale === editingTagDefaultLocale);
      const defaultLocalizedName = localizedNames[i];
      localizedNames.splice(i, 1);
      localizedNames.unshift(defaultLocalizedName);
    }

    if (editingTagId == null) {
      const { requestError, response } = await ProblemApi.createProblemTag({
        color: editingTagColor,
        localizedNames: localizedNames
      });
      if (requestError) toast.error(requestError(_));
      else if (response.error) toast.error(`.error.${response.error}`);
      else {
        setTags(
          Object.assign({}, tags, {
            [response.id]: {
              id: response.id,
              color: editingTagColor,
              localizedNames: localizedNames
            }
          })
        );
        toast.success(_(".success_create"));
        setModified(false);
        initNewTag();
      }
    } else {
      const { requestError, response } = await ProblemApi.updateProblemTag({
        id: editingTagId,
        color: editingTagColor,
        localizedNames: localizedNames
      });
      if (requestError) toast.error(requestError(_));
      else if (response.error) toast.error(`.error.${response.error}`);
      else {
        setTags(
          Object.assign({}, tags, {
            [editingTagId]: {
              id: editingTagId,
              color: editingTagColor,
              localizedNames: localizedNames
            }
          })
        );
        toast.success(_(".success_update"));
        setModified(false);
      }
    }

    setPendingSubmit(false);
  }

  function initNewTag() {
    setModified(false);
    setEditingTagId(null);
    setEditingTagColor("blue");
    setEditingTagLocalizedNames({
      [appState.locale]: ""
    });
    setEditingTagDefaultLocale(appState.locale);
  }

  function onNewTag() {
    if (pending) return;
    setModified(false);

    initNewTag();
  }

  function onEditTag(tagId: number) {
    if (pending) return;
    if (tagId === editingTagId) return;
    setModified(false);

    setEditingTagId(tagId);
    setEditingTagColor(tags[tagId].color);
    setEditingTagLocalizedNames(
      Object.fromEntries(tags[tagId].localizedNames.map(({ locale, name }) => [locale, name]))
    );
    setEditingTagDefaultLocale(tags[tagId].localizedNames[0].locale as Locale);
  }

  function onChangeColor(newColor: string) {
    if (pending) return;
    setModified(true);

    setEditingTagColor(newColor);
  }

  function onChangeName(locale: Locale, newName: string) {
    if (pending) return;
    setModified(true);

    setEditingTagLocalizedNames(
      Object.assign({}, editingTagLocalizedNames, {
        [locale]: newName
      })
    );
  }

  function onAddLocale(locale: Locale) {
    if (pending) return;
    setModified(true);

    onChangeName(locale, "");
  }

  function onDeleteLocale(deletingLocale: Locale) {
    if (pending) return;
    if (Object.keys(editingTagLocalizedNames).length === 1) return;
    setModified(true);

    if (deletingLocale === editingTagDefaultLocale)
      setEditingTagDefaultLocale(
        Object.keys(editingTagLocalizedNames).find(locale => locale !== deletingLocale) as Locale
      );
    setEditingTagLocalizedNames(
      Object.fromEntries(Object.entries(editingTagLocalizedNames).filter(([locale]) => locale != deletingLocale))
    );
  }

  function onSetDefaultLocale(locale: Locale) {
    if (pending) return;
    setModified(true);

    setEditingTagDefaultLocale(locale);
  }

  const getTagLabel = (i: number) => (
    <Tag
      key={i}
      name={tagLocalizedNames[i]}
      color={tags[i].color}
      disabled={pending}
      promptEdit={modified}
      editing={editingTagId === i}
      onEdit={() => onEditTag(i)}
      onDelete={() => onDeleteTag(i)}
    />
  );

  const existingLocales = Object.values(Locale).filter(locale => locale in editingTagLocalizedNames);

  const dialog = useDialog(
    {},
    <Header
      className={style.dialogHeader}
      icon="tag"
      content={
        <>
          {_(".title")}
          <div className={style.dialogHeaderInfo}>{_(".tag_count", { count: tagsCount.toString() })}</div>
        </>
      }
    />,
    <>
      <div className={style.tagsSegment + (tagsCount === 0 ? " " + style.noTags : "")}>
        {tagsCount === 0 ? (
          <div>{_(".no_tags")}</div>
        ) : (
          Object.entries(tagsByColor).map(([color, tagIDs]) => <p key={color}>{tagIDs.map(i => getTagLabel(i))}</p>)
        )}
      </div>
      <Form>
        <div className={style.headerContainer}>
          <Header
            className={style.header}
            content={
              editingTagId == null ? (
                _(".new_tag")
              ) : (
                <>
                  {_(".edit_tag")}
                  {getTagLabel(editingTagId)}
                </>
              )
            }
          />
          <Form.Dropdown
            className={style.colorDropdown}
            selection
            inline
            value={editingTagColor}
            options={tagColors.map(color => ({
              key: color,
              value: color,
              text: (
                <>
                  <Label circular empty color={color as any} />
                  {color}
                </>
              )
            }))}
            onChange={(e, { value }) => onChangeColor(value as string)}
          />
        </div>
      </Form>
      {existingLocales.map((locale, i) => (
        <Menu
          key={locale}
          attached={(() => {
            let top = true,
              bottom = true;
            if (i === 0) top = false;
            if (i === existingLocales.length - 1) bottom = false;
            if (top && bottom) return true;
            if (top && !bottom) return "bottom";
            if (!top && bottom) return "top";
            if (!top && !bottom) return false;
          })()}
          className={style.menu}
        >
          <Menu.Item className={style.itemLocale}>
            <Flag name={localeMeta[locale].flag as any} />
            {_(`language.${locale}`)}
          </Menu.Item>
          <Menu.Item className={style.itemName}>
            <Input
              transparent
              placeholder={_(".name_placeholder")}
              value={editingTagLocalizedNames[locale]}
              onChange={(e, { value }) => onChangeName(locale, value)}
            />
          </Menu.Item>
          {existingLocales.length > 1 && (
            <>
              <Menu.Item className={style.itemDefault}>
                <Radio
                  disabled={pending}
                  checked={editingTagDefaultLocale === locale}
                  onChange={(e, { checked }) => checked && onSetDefaultLocale(locale)}
                  label={_(".default_language")}
                />
              </Menu.Item>
              <Popup
                trigger={<Menu.Item as="a" icon="delete" className={style.itemIcon} disabled={pending} />}
                disabled={pending}
                content={
                  <Button negative content={_(".confirm_delete_language")} onClick={() => onDeleteLocale(locale)} />
                }
                on="click"
                position="bottom center"
              />
            </>
          )}
        </Menu>
      ))}
      <div className={style.divAddLanguageAndSubmit}>
        <Dropdown disabled={existingLocales.length === Object.keys(localeMeta).length} text={_(".add_language")}>
          <Dropdown.Menu>
            {Object.values(Locale)
              .filter(locale => !existingLocales.includes(locale))
              .map(locale => (
                <Dropdown.Item
                  key={locale}
                  flag={localeMeta[locale].flag}
                  text={_(`language.${locale}`)}
                  onClick={() => onAddLocale(locale)}
                />
              ))}
          </Dropdown.Menu>
        </Dropdown>
        {editingTagId != null && (
          <Popup
            trigger={
              <Button
                className={style.addButton}
                positive
                content={_(".new_tag_button")}
                onClick={() => !modified && onNewTag()}
              />
            }
            disabled={!modified}
            content={<Button negative content={_(".confirm_discard_unsaved")} onClick={() => onNewTag()} />}
            position="bottom center"
            on="click"
          />
        )}
        <Button
          className={style.submitButton}
          primary
          loading={pendingSubmit}
          disabled={pending}
          content={_(".submit")}
          onClick={() => !pending && onSubmit()}
        />
      </div>
    </>,
    <>
      <Popup
        trigger={
          <Button
            className={style.closeButton}
            content={_(".close")}
            onClick={() => {
              if (pending) return;
              if (!modified) {
                setOpened(false);
                dialog.close();
              }
            }}
          />
        }
        disabled={!modified}
        content={
          <Button
            negative
            content={_(".confirm_discard_unsaved")}
            onClick={() => {
              if (pending) return;
              setModified(false);
              setOpened(false);
              dialog.close();
            }}
          />
        }
        position="bottom center"
        on="click"
      />
    </>
  );

  const [opened, setOpened] = useState(false);
  const [pendingOpen, setPendingOpen] = useState(false);
  props.refOpen.current = async () => {
    if (opened || pendingOpen) return;

    setPendingOpen(true);

    const { requestError, response } = await ProblemApi.getAllProblemTagsOfAllLocales();
    if (requestError) toast.error(requestError(_));
    else if (response.error) toast.error(_(`.error.${response.error}`));

    setPendingOpen(false);

    if (!response || !response.tags) return false;

    setOpened(true);
    setModified(false);
    setTags(Object.fromEntries(response.tags.map(tag => [tag.id, tag])));
    initNewTag();

    dialog.open();
    return true;
  };

  return dialog.element;
};

ProblemTagManager = observer(ProblemTagManager);

export default ProblemTagManager;
