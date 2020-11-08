import React, { useEffect, useState, useRef } from "react";
import {
  Dropdown,
  Grid,
  Icon,
  Header,
  Menu,
  Segment,
  Popup,
  Button,
  Form,
  Input,
  TextArea,
  Checkbox,
  Radio,
  Dimmer,
  List,
  Ref
} from "semantic-ui-react";
import TextAreaAutoSize from "react-textarea-autosize";
import { v4 as uuid } from "uuid";
import update from "immutability-helper";

import style from "./ProblemEditPage.module.less";

import api from "@/api";
import { Locale } from "@/interfaces/Locale";
import localeMeta from "@/locales/meta";
import { appState } from "@/appState";
import toast from "@/utils/toast";
import {
  useLocalizer,
  useConfirmNavigation,
  useAsyncCallbackPending,
  useRecaptcha,
  useNavigationChecked
} from "@/utils/hooks";
import { observer } from "mobx-react";
import { defineRoute, RouteError } from "@/AppRouter";
import { ProblemType } from "@/interfaces/ProblemType";
import MarkdownContent from "@/markdown/MarkdownContent";
import { getProblemIdString, getProblemUrl } from "../utils";
import { useProblemViewMarkdownContentPatcher } from "../view/ProblemViewPage";
import { makeToBeLocalizedText } from "@/locales";
import { LocalizeTab } from "@/components/LocalizeTab";
import { getMarkdownEditorFontClass } from "@/misc/fonts";

type Problem = ApiTypes.GetProblemResponseDto;

async function fetchData(idType: "id" | "displayId", id: number): Promise<Problem> {
  const { requestError, response } = await api.problem.getProblem({
    [idType]: id,
    localizedContentsOfAllLocales: true,
    tagsOfLocale: appState.locale,
    samples: true,
    permissionOfCurrentUser: true
  });

  if (requestError) throw new RouteError(requestError, { showRefresh: true, showBack: true });
  else if (response.error) throw new RouteError(makeToBeLocalizedText(`problem_edit.error.${response.error}`));

  return response;
}

async function fetchDataAllProblemTags(): Promise<ApiTypes.LocalizedProblemTagDto[]> {
  const { requestError, response } = await api.problem.getAllProblemTags({
    locale: appState.locale
  });

  if (requestError) throw new RouteError(requestError, { showRefresh: true, showBack: true });

  return response.tags;
}

interface LocalizedContentSection {
  uuid: string;
  sectionTitle: string;
  type: "Text" | "Sample";
  sampleId?: number;
  text?: string;
}

interface LocalizedContent {
  title: string;
  contentSections: LocalizedContentSection[];
}

interface Sample {
  uuid: string;
  inputData: string;
  outputData: string;
}

interface LocalizedContentEditorSectionProps {
  problemId: number;

  section: LocalizedContentSection;
  samples: Sample[];

  isPreview: boolean;
  isFirst: boolean;
  isLast: boolean;

  onChangeSectionValue: (type: "sectionTitle" | "text", newValue: string) => void;
  onChangeSectionType: (newType: "Text" | "Sample") => void;
  onChangeSectionSampleId: (newSampleId: number) => void;
  onChangeSampleData: (sampleId: number, type: "inputData" | "outputData", newData: string) => void;
  onAddSectionBefore: () => void;
  onAddSectionAfter: () => void;
  onMoveSectionUp: () => void;
  onMoveSectionDown: () => void;
  onDeleteSection: () => void;
}

const LocalizedContentEditorSection: React.FC<LocalizedContentEditorSectionProps> = props => {
  const _ = useLocalizer("problem_edit");

  const [preview, setPreview] = useState(false);

  const [refOptionsButton, setRefOptionsButton] = useState<HTMLElement>();

  const problemViewMarkdownContentPatcher = useProblemViewMarkdownContentPatcher(props.problemId);

  return (
    <>
      <Menu attached="top" className={style.toolbarMenu}>
        <Menu.Item className={style.toolbarMenuInputItem}>
          <Input
            className={style.boldInput}
            fluid
            transparent
            placeholder={_(".content_editor.section_title")}
            value={props.section.sectionTitle}
            onChange={(e, { value }) => props.onChangeSectionValue("sectionTitle", value)}
          />
        </Menu.Item>
        <Menu.Menu position="right">
          <Menu.Item>
            <Checkbox
              fitted
              label={_(".content_editor.preview")}
              checked={preview || props.isPreview}
              disabled={props.isPreview}
              onChange={(e, { checked }) => setPreview(checked)}
            />
          </Menu.Item>
          {props.section.type === "Sample" && (
            <Dropdown
              item
              value={props.section.sampleId}
              options={[
                ...props.samples.map((sample, id) => ({
                  key: id,
                  text: id + 1,
                  value: id,
                  onClick: () => props.onChangeSectionSampleId(id)
                })),
                {
                  key: "new",
                  text: (
                    <>
                      <Icon name="add" />
                      {_(".content_editor.new_sample")}
                    </>
                  ),
                  value: "new",
                  onClick: () => props.onChangeSectionSampleId(null)
                }
              ]}
            />
          )}
          <Dropdown
            item
            closeOnChange
            value={props.section.type}
            options={[
              {
                key: "Text",
                text: (
                  <>
                    <Icon name="sticky note" />
                    {_(".content_editor.section_type.text")}
                  </>
                ),
                value: "Text",
                onClick: () => props.section.type === "Text" || props.onChangeSectionType("Text")
              },
              {
                key: "Sample",
                text: (
                  <>
                    <Icon name="sticky note outline" />
                    {_(".content_editor.section_type.sample")}
                  </>
                ),
                value: "Sample",
                onClick: () => props.section.type === "Sample" || props.onChangeSectionType("Sample")
              }
            ]}
          />
          <Dropdown item closeOnChange icon="add" className={`icon ${style.toolbarMenuIconItem}`}>
            <Dropdown.Menu>
              <Dropdown.Item
                icon="arrow up"
                text={_(".content_editor.add_section.before_this_section")}
                onClick={() => props.onAddSectionBefore()}
              />
              <Dropdown.Item
                icon="arrow down"
                text={_(".content_editor.add_section.after_this_section")}
                onClick={() => props.onAddSectionAfter()}
              />
            </Dropdown.Menu>
          </Dropdown>
          <Ref innerRef={setRefOptionsButton}>
            <Dropdown item icon="bars" className={`icon ${style.toolbarMenuIconItem}`}>
              <Dropdown.Menu>
                <Dropdown.Item
                  disabled={props.isFirst}
                  icon="angle double up"
                  text={_(".content_editor.section_options.move_up")}
                  onClick={() => props.onMoveSectionUp()}
                />
                <Dropdown.Item
                  disabled={props.isLast}
                  icon="angle double down"
                  text={_(".content_editor.section_options.move_down")}
                  onClick={() => props.onMoveSectionDown()}
                />
                <Popup
                  trigger={
                    <Dropdown.Item
                      disabled={props.isFirst && props.isLast}
                      icon="delete"
                      text={_(".content_editor.section_options.delete")}
                    />
                  }
                  context={refOptionsButton}
                  content={
                    <Button
                      color="red"
                      content={_(".content_editor.section_options.confirm_delete")}
                      onClick={() => props.onDeleteSection()}
                    />
                  }
                  on="click"
                  position="bottom right"
                />
              </Dropdown.Menu>
            </Dropdown>
          </Ref>
        </Menu.Menu>
      </Menu>
      <Segment attached="bottom" className={style.sectionSegment} data-type={props.section.type}>
        {props.section.type === "Sample" ? (
          <Grid columns="equal" className={style.sampleEditorGrid}>
            <Grid.Row>
              <Grid.Column>
                <Form>
                  <TextArea
                    className="monospace"
                    rows={4}
                    value={props.samples[props.section.sampleId].inputData}
                    placeholder={_(".content_editor.sample_input")}
                    onChange={(e, { value }) =>
                      props.onChangeSampleData(props.section.sampleId, "inputData", value as string)
                    }
                  />
                </Form>
              </Grid.Column>
              <Grid.Column>
                <Form>
                  <TextArea
                    className="monospace"
                    rows={4}
                    value={props.samples[props.section.sampleId].outputData}
                    placeholder={_(".content_editor.sample_output")}
                    onChange={(e, { value }) =>
                      props.onChangeSampleData(props.section.sampleId, "outputData", value as string)
                    }
                  />
                </Form>
              </Grid.Column>
            </Grid.Row>
            <Grid.Row>
              <Grid.Column>
                {preview || props.isPreview ? (
                  <Segment basic>
                    <MarkdownContent content={props.section.text} patcher={problemViewMarkdownContentPatcher} />
                  </Segment>
                ) : (
                  <Form>
                    <TextArea
                      className={getMarkdownEditorFontClass()}
                      as={TextAreaAutoSize}
                      minRows={6}
                      maxRows={16}
                      value={props.section.text}
                      placeholder={_(".content_editor.sample_explanation")}
                      onChange={(e, { value }) => props.onChangeSectionValue("text", value as string)}
                    />
                  </Form>
                )}
              </Grid.Column>
            </Grid.Row>
          </Grid>
        ) : preview || props.isPreview ? (
          <Segment basic>
            <MarkdownContent content={props.section.text} patcher={problemViewMarkdownContentPatcher} />
          </Segment>
        ) : (
          <Form>
            <TextArea
              className={getMarkdownEditorFontClass()}
              as={TextAreaAutoSize}
              minRows={6}
              maxRows={16}
              value={props.section.text}
              placeholder={_(".content_editor.section_content")}
              onChange={(e, { value }) => props.onChangeSectionValue("text", value as string)}
            />
          </Form>
        )}
      </Segment>
    </>
  );
};

interface LocalizedContentEditorProps {
  problemId: number;

  localizedContent: LocalizedContent;
  samples: Sample[];

  isOnly: boolean;
  isDefault: boolean;
  onMakeDefault: () => void;
  onApplyTemplate: () => void;
  onDelete: () => void;

  onChangeTitle: (newTitle: string) => void;

  onChangeSectionValue: (index: number, type: "sectionTitle" | "text", newValue: string) => void;
  onChangeSectionType: (index: number, newType: "Text" | "Sample") => void;
  onChangeSectionSampleId: (index: number, newSampleId: number) => void;
  onChangeSampleData: (sampleId: number, type: "inputData" | "outputData", newData: string) => void;
  onAddSection: (index: number, type: "Text" | "Sample") => void;
  onDeleteSection: (index: number) => void;
  onMoveSection: (index: number, direction: "UP" | "DOWN") => void;
}

const LocalizedContentEditor: React.FC<LocalizedContentEditorProps> = props => {
  const _ = useLocalizer("problem_edit");

  const [preview, setPreview] = useState(false);

  const safeToApplyTemplate = props.localizedContent.contentSections.every(
    section => !section.sectionTitle && section.type === "Text" && !section.text
  );
  const [applyTemplatePopupOpen, setApplyTemplatePopupOpen] = useState(false);

  return (
    <>
      <Menu attached="top" className={style.toolbarMenu}>
        <Menu.Item className={style.toolbarMenuInputItem}>
          <Input
            className={style.boldInput}
            fluid
            transparent
            placeholder={_(".content_editor.title")}
            value={props.localizedContent.title}
            onChange={(e, { value }) => props.onChangeTitle(value)}
          />
        </Menu.Item>
        <Menu.Menu position="right">
          <Menu.Item>
            <Checkbox
              label={_(".content_editor.preview_all")}
              checked={preview}
              onChange={(e, { checked }) => setPreview(checked)}
            />
          </Menu.Item>
          {!props.isOnly && (
            <>
              <Menu.Item>
                <Radio
                  label={_(".content_editor.default")}
                  checked={props.isDefault}
                  onChange={(e, { checked }) => checked && props.onMakeDefault()}
                />
              </Menu.Item>
            </>
          )}
          <Popup
            trigger={
              <Menu.Item
                as="a"
                icon="file alternate outline"
                className={style.toolbarMenuIconItem}
                onClick={() => safeToApplyTemplate && props.onApplyTemplate()}
              />
            }
            disabled={safeToApplyTemplate}
            open={applyTemplatePopupOpen}
            onOpen={() => setApplyTemplatePopupOpen(true)}
            onClose={() => setApplyTemplatePopupOpen(false)}
            content={
              <Button
                color="green"
                content={_(".content_editor.confirm_apply_template")}
                onClick={() => {
                  setApplyTemplatePopupOpen(false);
                  props.onApplyTemplate();
                }}
              />
            }
            on="click"
            position="top right"
          />
          {!props.isOnly && (
            <>
              <Popup
                trigger={<Menu.Item as="a" icon="delete" className={style.toolbarMenuIconItem} />}
                content={
                  <Button color="red" content={_(".content_editor.confirm_delete")} onClick={() => props.onDelete()} />
                }
                on="click"
                position="top right"
              />
            </>
          )}
        </Menu.Menu>
      </Menu>
      {props.localizedContent.contentSections.map((section, index) => (
        <LocalizedContentEditorSection
          key={section.uuid}
          problemId={props.problemId}
          section={section}
          samples={props.samples}
          isPreview={preview}
          isFirst={index === 0}
          isLast={index === props.localizedContent.contentSections.length - 1}
          onChangeSectionValue={(type, newValue) => props.onChangeSectionValue(index, type, newValue)}
          onChangeSectionType={newType => props.onChangeSectionType(index, newType)}
          onChangeSectionSampleId={newSampleId => props.onChangeSectionSampleId(index, newSampleId)}
          onChangeSampleData={props.onChangeSampleData}
          onAddSectionBefore={() => props.onAddSection(index, section.type)}
          onAddSectionAfter={() => props.onAddSection(index + 1, section.type)}
          onMoveSectionUp={() => props.onMoveSection(index, "UP")}
          onMoveSectionDown={() => props.onMoveSection(index, "DOWN")}
          onDeleteSection={() => props.onDeleteSection(index)}
        />
      ))}
    </>
  );
};

interface SampleEditorProps {
  sampleId: number;
  sample: Sample;
  warningMessage: {
    locale: Locale;
    referenceCount: number;
  }[];

  isFirst: boolean;
  isLast: boolean;

  onChangeSampleData: (type: "inputData" | "outputData", newData: string) => void;
  onAddSampleBefore: () => void;
  onAddSampleAfter: () => void;
  onMoveSampleUp: () => void;
  onMoveSampleDown: () => void;
  onDeleteSample: () => void;
}

const SampleEditor: React.FC<SampleEditorProps> = props => {
  const _ = useLocalizer("problem_edit");

  const refOptionsButton = useRef(null);

  return (
    <>
      <Menu attached="top" className={style.toolbarMenu}>
        <Menu.Item className={style.toolbarMenuInputItem}>
          <Input
            className={style.boldInput}
            fluid
            transparent
            placeholder={_(".sample_editor.sample_id")}
            value={props.sampleId == null ? "" : props.sampleId + 1}
            readOnly
          />
        </Menu.Item>
        <Menu.Menu position="right">
          {props.warningMessage.length > 0 && (
            <Popup
              trigger={<Menu.Item icon="warning sign" className={style.toolbarMenuIconItem} />}
              position="top right"
              content={
                <List bulleted className={style.sampleWarningMessage}>
                  {props.warningMessage.map((warningMessage, index) => (
                    <List.Item key={index}>
                      {warningMessage.referenceCount === 0
                        ? _(".sample_editor.warning.not_referenced", {
                            language: localeMeta[warningMessage.locale].name
                          })
                        : _(".sample_editor.warning.multiple_references", {
                            language: localeMeta[warningMessage.locale].name,
                            referenceCount: warningMessage.referenceCount.toString()
                          })}
                    </List.Item>
                  ))}
                </List>
              }
            />
          )}
          <Dropdown item closeOnChange icon="add" className={`icon ${style.toolbarMenuIconItem}`}>
            <Dropdown.Menu>
              <Dropdown.Item
                icon="arrow up"
                text={_(".sample_editor.add_sample.before_this_sample")}
                onClick={() => props.onAddSampleBefore()}
              />
              <Dropdown.Item
                icon="arrow down"
                text={_(".sample_editor.add_sample.after_this_sample")}
                onClick={() => props.onAddSampleAfter()}
              />
            </Dropdown.Menu>
          </Dropdown>
          <Ref innerRef={refOptionsButton}>
            <Dropdown item icon="bars" className={`icon ${style.toolbarMenuIconItem}`}>
              <Dropdown.Menu>
                <Dropdown.Item
                  disabled={props.isFirst}
                  icon="angle double up"
                  text={_(".sample_editor.options.move_up")}
                  onClick={() => props.onMoveSampleUp()}
                />
                <Dropdown.Item
                  disabled={props.isLast}
                  icon="angle double down"
                  text={_(".sample_editor.options.move_down")}
                  onClick={() => props.onMoveSampleDown()}
                />
                <Popup
                  trigger={<Dropdown.Item icon="delete" text={_(".sample_editor.options.delete")} />}
                  context={refOptionsButton}
                  content={
                    <Button
                      color="red"
                      content={_(".sample_editor.options.confirm_delete")}
                      onClick={() => props.onDeleteSample()}
                    />
                  }
                  on="click"
                  position="bottom right"
                />
              </Dropdown.Menu>
            </Dropdown>
          </Ref>
        </Menu.Menu>
      </Menu>
      <Segment attached="bottom" className={style.sectionSegment}>
        <Grid columns="equal" className={style.sampleEditorGrid}>
          <Grid.Row>
            <Grid.Column>
              <Form>
                <TextArea
                  className="monospace"
                  rows={4}
                  value={props.sample ? props.sample.inputData : ""}
                  placeholder={_(".content_editor.sample_input")}
                  onChange={(e, { value }) => props.onChangeSampleData("inputData", value as string)}
                />
              </Form>
            </Grid.Column>
            <Grid.Column>
              <Form>
                <TextArea
                  className="monospace"
                  rows={4}
                  value={props.sample ? props.sample.outputData : ""}
                  placeholder={_(".content_editor.sample_output")}
                  onChange={(e, { value }) => props.onChangeSampleData("outputData", value as string)}
                />
              </Form>
            </Grid.Column>
          </Grid.Row>
        </Grid>
      </Segment>
    </>
  );
};

// FIXME: Don't write localized text in code
const sectionsTemplate: Record<Locale, LocalizedContentSection[]> = {
  [Locale.zh_CN]: [
    {
      uuid: uuid(),
      sectionTitle: "题目描述",
      type: "Text",
      text: ""
    },
    {
      uuid: uuid(),
      sectionTitle: "输入格式",
      type: "Text",
      text: ""
    },
    {
      uuid: uuid(),
      sectionTitle: "输出格式",
      type: "Text",
      text: ""
    },
    {
      uuid: uuid(),
      sectionTitle: "样例",
      type: "Sample",
      sampleId: 0,
      text: ""
    },
    {
      uuid: uuid(),
      sectionTitle: "数据范围与提示",
      type: "Text",
      text: ""
    }
  ],
  [Locale.en_US]: [
    {
      uuid: uuid(),
      sectionTitle: "Description",
      type: "Text",
      text: ""
    },
    {
      uuid: uuid(),
      sectionTitle: "Input",
      type: "Text",
      text: ""
    },
    {
      uuid: uuid(),
      sectionTitle: "Output",
      type: "Text",
      text: ""
    },
    {
      uuid: uuid(),
      sectionTitle: "Sample",
      type: "Sample",
      sampleId: 0,
      text: ""
    },
    {
      uuid: uuid(),
      sectionTitle: "Limits And Hints",
      type: "Text",
      text: ""
    }
  ],
  [Locale.ja_JP]: [
    {
      uuid: uuid(),
      sectionTitle: "問題文",
      type: "Text",
      text: ""
    },
    {
      uuid: uuid(),
      sectionTitle: "入力",
      type: "Text",
      text: ""
    },
    {
      uuid: uuid(),
      sectionTitle: "出力",
      type: "Text",
      text: ""
    },
    {
      uuid: uuid(),
      sectionTitle: "例",
      type: "Sample",
      sampleId: 0,
      text: ""
    },
    {
      uuid: uuid(),
      sectionTitle: "制約",
      type: "Text",
      text: ""
    }
  ]
};

interface ProblemEditPageProps {
  idType?: "id" | "displayId";
  problem?: Problem;
  new?: boolean;
  allProblemTags: ApiTypes.LocalizedProblemTagDto[];
  requestedLocale?: Locale;
}

let ProblemEditPage: React.FC<ProblemEditPageProps> = props => {
  const _ = useLocalizer("problem_edit");
  const navigation = useNavigationChecked();

  const idString = !props.new && getProblemIdString(props.problem.meta);

  useEffect(() => {
    appState.enterNewPage(props.new ? `${_(".title_new")}` : `${_(".title_edit")} ${idString}`, "problem_set", false);
  }, [appState.locale, props.new, props.problem]);

  const recaptcha = useRecaptcha();

  const [localizedContents, setLocalizedContents] = useState(
    (() => {
      const converted: Partial<Record<Locale, LocalizedContent>> = {};
      if (!props.new) {
        for (const content of props.problem.localizedContentsOfAllLocales) {
          converted[content.locale] = {
            title: content.title,
            contentSections: content.contentSections.map(section => ({
              uuid: uuid(),
              ...section
            }))
          };
        }
      } else {
        // For a new problem, use the user's preferred locale
        converted[appState.locale] = {
          title: "",
          contentSections: [
            {
              uuid: uuid(),
              sectionTitle: "",
              type: "Text",
              text: ""
            }
          ]
        };
      }
      return converted;
    })()
  );

  const [newProblemType, setNewProblemType] = useState(ProblemType.Traditional);

  const [modified, setModified] = useConfirmNavigation();
  const [pendingSubmit, onSubmit] = useAsyncCallbackPending(async () => {
    // Swap the default locale to the first of the array.
    const localizedContentsPayload = Object.keys(localizedContents)
      .map((locale: Locale, index, locales: Locale[]) => {
        if (index === 0) return defaultLocale;
        if (locale === defaultLocale) return locales[0];
        return locale;
      })
      .map(
        (locale): ApiTypes.ProblemLocalizedContentDto => ({
          locale: locale,
          title: localizedContents[locale].title,
          contentSections: localizedContents[locale].contentSections.map(section =>
            section.type === "Text"
              ? {
                  sectionTitle: section.sectionTitle,
                  type: "Text",
                  text: section.text
                }
              : {
                  sectionTitle: section.sectionTitle,
                  type: "Sample",
                  sampleId: section.sampleId,
                  text: section.text
                }
          )
        })
      );

    const hasEmpty = localizedContentsPayload.some(
      locaizedContents =>
        !locaizedContents.title ||
        locaizedContents.contentSections.some(
          section => !section.sectionTitle || (section.type === "Text" && !section.text)
        )
    );
    if (hasEmpty) {
      toast.error(_(".something_empty"));
      return;
    }

    const samplesPayload = samples.map(sample => ({
      inputData: sample.inputData,
      outputData: sample.outputData
    }));

    if (props.new) {
      const { requestError, response } = await api.problem.createProblem(
        {
          type: newProblemType,
          statement: {
            localizedContents: localizedContentsPayload,
            samples: samplesPayload,
            problemTagIds: tagIds
          }
        },
        recaptcha("CreateProblem")
      );

      if (requestError) toast.error(requestError(_));
      else if (response.error) {
        toast.error(_(`.error.${response.error}`));
      } else {
        setModified(false);
        navigation.navigate(getProblemUrl(response.id));
      }
    } else {
      const { requestError, response } = await api.problem.updateStatement({
        problemId: props.problem.meta.id,
        localizedContents: localizedContentsPayload,
        samples: samplesPayload,
        problemTagIds: tagIds
      });

      if (requestError) toast.error(requestError(_));
      else if (response.error) {
        toast.error(_(`.error.${response.error}`));
      } else {
        toast.success(_(".submit_success"));
        setModified(false);
      }
    }
  });

  function onBackToProblem() {
    setModified(false);

    if (props.new) {
      navigation.navigate("/p");
    } else {
      navigation.navigate({
        pathname: getProblemUrl(props.problem.meta, { use: props.idType }),
        query: props.requestedLocale
          ? {
              locale: props.requestedLocale
            }
          : null
      });
    }
  }

  function onApplyTemplateToLocale(locale: Locale) {
    if (pendingSubmit) return;
    setModified(true);

    if (samples.length === 0) onAddSample();
    setLocalizedContents(
      update(localizedContents, {
        [locale]: {
          contentSections: { $set: sectionsTemplate[locale] }
        }
      })
    );
  }

  function onDeleteLocale(locale: Locale) {
    if (pendingSubmit) return;
    setModified(true);

    const locales = Object.keys(localizedContents) as Locale[];

    // Select first non-deleting locale as default
    locales.some((nextLocale: Locale) => {
      if (nextLocale !== locale) {
        setDefaultLocale(nextLocale);
        return true;
      }
    });

    // Select the one next to the deleting as active
    const deleteingIndex = locales.indexOf(locale);
    if (deleteingIndex === locales.length - 1) {
      setActiveLocale(locales[deleteingIndex - 1]);
    } else {
      setActiveLocale(locales[deleteingIndex + 1]);
    }

    setLocalizedContents(
      update(localizedContents, {
        $unset: [locale]
      })
    );
  }

  function onAddLocale(locale: Locale) {
    if (pendingSubmit) return;
    setModified(true);

    setLocalizedContents(
      update(localizedContents, {
        [locale]: {
          $set: {
            title: "",
            contentSections: [
              {
                uuid: uuid(),
                sectionTitle: "",
                type: "Text",
                text: ""
              }
            ]
          }
        }
      })
    );

    setActiveLocale(locale);
  }

  function onAddSample() {
    if (pendingSubmit) return;
    setModified(true);

    setSamples(
      update(samples, {
        $push: [
          {
            uuid: uuid(),
            inputData: "",
            outputData: ""
          }
        ]
      })
    );
  }

  function ensureFirstNotReferencedSampleId(locale: Locale) {
    const id = [...samples.keys()].find(
      i => !localizedContents[locale].contentSections.some(section => section.sampleId === i)
    );
    if (id != null) return id;
    onAddSample();
    return samples.length; // This still references to the old "samples" array
  }

  function onAddSection(locale: Locale, index: number, type: "Text" | "Sample") {
    if (pendingSubmit) return;
    setModified(true);

    setLocalizedContents(
      update(localizedContents, {
        [locale]: {
          contentSections: {
            $splice: [
              [
                index,
                0,
                {
                  uuid: uuid(),
                  sectionTitle: "",
                  type,
                  text: "",
                  ...(type === "Sample" ? { sampleId: ensureFirstNotReferencedSampleId(locale) } : {})
                }
              ]
            ]
          }
        }
      })
    );
  }

  function onMoveSection(locale: Locale, index: number, direction: "UP" | "DOWN") {
    if (pendingSubmit) return;
    setModified(true);

    const section = localizedContents[locale].contentSections[index];
    setLocalizedContents(
      update(localizedContents, {
        [locale]: {
          contentSections: {
            $splice: [
              [index, 1],
              [index + (direction === "UP" ? -1 : +1), 0, section]
            ]
          }
        }
      })
    );
  }

  function onDeleteSection(locale: Locale, index: number) {
    if (pendingSubmit) return;
    setModified(true);

    setLocalizedContents(
      update(localizedContents, {
        [locale]: {
          contentSections: {
            $splice: [[index, 1]]
          }
        }
      })
    );
  }

  function onChangeTitle(locale: Locale, title: string) {
    if (pendingSubmit) return;
    setModified(true);

    setLocalizedContents(
      update(localizedContents, {
        [locale]: {
          title: {
            $set: title
          }
        }
      })
    );
  }

  // change title / text
  function onChangeSectionValue(locale: Locale, index: number, type: "sectionTitle" | "text", newValue: string) {
    if (pendingSubmit) return;
    setModified(true);

    setLocalizedContents(
      update(localizedContents, {
        [locale]: {
          contentSections: {
            [index]: {
              [type]: { $set: newValue }
            }
          }
        }
      })
    );
  }

  function onChangeSectionType(locale: Locale, index: number, newType: "Text" | "Sample") {
    if (pendingSubmit) return;
    setModified(true);

    setLocalizedContents(
      update(localizedContents, {
        [locale]: {
          contentSections: {
            [index]: {
              type: { $set: newType },
              sampleId: newType === "Sample" ? { $set: ensureFirstNotReferencedSampleId(locale) } : {},
              $unset: newType === "Text" ? ["sampleId"] : []
            }
          }
        }
      })
    );
  }

  function onChangeSectionSampleId(locale: Locale, index: number, newSampleId: number) {
    if (pendingSubmit) return;
    setModified(true);

    if (newSampleId == null) {
      // Add new sample
      newSampleId = samples.length;
      onAddSample();
    }

    setLocalizedContents(
      update(localizedContents, {
        [locale]: {
          contentSections: {
            [index]: {
              sampleId: { $set: newSampleId }
            }
          }
        }
      })
    );
  }

  function onChangeSampleData(sampleId: number, type: "inputData" | "outputData", newData: string) {
    if (pendingSubmit) return;
    setModified(true);

    setSamples(
      update(samples, {
        [sampleId]: {
          [type]: { $set: newData }
        }
      })
    );
  }

  function updateSampleIdReference(callback: (sampleId: number) => number) {
    const spec: any = {};
    Object.keys(localizedContents).forEach((locale: Locale) => {
      spec[locale] = {
        contentSections: localizedContents[locale].contentSections.map(section => {
          if (section.type !== "Sample") return {};
          const newSampleId = callback(section.sampleId);

          // Not modified
          if (newSampleId === section.sampleId) return {};

          // Deleted
          if (newSampleId == null)
            return {
              $unset: ["sampleId"],
              type: { $set: "Text" }
            };

          // Modified
          return {
            sampleId: {
              $set: callback(section.sampleId)
            }
          };
        })
      };
    });
    setLocalizedContents(update(localizedContents, spec));
  }

  function onAddSampleAt(index: number) {
    if (pendingSubmit) return;
    setModified(true);

    setSamples(
      update(samples, {
        $splice: [
          [
            index,
            0,
            {
              uuid: uuid(),
              inputData: "",
              outputData: ""
            }
          ]
        ]
      })
    );

    updateSampleIdReference(id => {
      if (id >= index) return id + 1;
      return id;
    });
  }

  function onMoveSample(sampleId: number, direction: "UP" | "DOWN") {
    if (pendingSubmit) return;
    setModified(true);

    const swappingSampleId = sampleId + (direction === "UP" ? -1 : +1);

    updateSampleIdReference(id => {
      if (id === sampleId) return swappingSampleId;
      if (id === swappingSampleId) return sampleId;
      return id;
    });

    setSamples(
      samples.map((sample, id) => {
        if (id === sampleId) return samples[swappingSampleId];
        if (id === swappingSampleId) return samples[sampleId];
        return sample;
      })
    );
  }

  function onDeleteSample(sampleId: number) {
    if (pendingSubmit) return;
    setModified(true);

    updateSampleIdReference(id => {
      if (id === sampleId) return null;
      if (id > sampleId) return id - 1;
      return id;
    });

    setSamples(samples.filter((sample, id) => id !== sampleId));
  }

  const [samples, setSamples] = useState<Sample[]>(
    props.new
      ? []
      : props.problem.samples.map(sample => ({
          uuid: uuid(),
          ...sample
        }))
  );

  const [activeLocale, setActiveLocale] = useState(() => {
    const locale = props.requestedLocale || appState.locale;
    return locale in localizedContents ? locale : (Object.keys(localizedContents)[0] as Locale);
  });

  const [tagIds, setTagIds] = useState(
    !props.problem ? [] : props.problem.tagsOfLocale.map(problemTag => problemTag.id)
  );

  function searchTags(options: { text: string }[], query: string) {
    query = query.toLowerCase();
    const result = options
      .filter(option => option.text.toLowerCase().indexOf(query) !== -1)
      .sort((a, b) => (a.text < b.text ? -1 : a.text > b.text ? 1 : 0));
    return [
      ...result.filter(option => option.text.toLowerCase().startsWith(query)),
      ...result.filter(option => !option.text.toLowerCase().startsWith(query))
    ];
  }

  const [defaultLocale, setDefaultLocale] = useState(
    props.new ? appState.locale : (props.problem.meta.locales[0] as Locale)
  );

  const haveSubmitPermission = props.new ? true : props.problem.permissionOfCurrentUser.includes("Modify");

  return (
    <>
      <Grid>
        <Grid.Row className={style.row}>
          <Grid.Column width={11}>
            <Header as="h1" className={style.headerContainer + " withIcon"}>
              <Icon name="edit" className={style.icon} />
              {props.new ? `${_(".header_new")}` : `${_(".header_edit", { idString })}`}
              {props.new && (
                <Menu compact className={style.typeDropdown}>
                  <Dropdown
                    item
                    value={newProblemType}
                    options={Object.values(ProblemType).map(type => ({
                      text: _(`problem.type.${type}`),
                      value: type,
                      key: type
                    }))}
                    onChange={(e, { value }) => setNewProblemType(value as ProblemType)}
                  />
                </Menu>
              )}
              <Popup
                trigger={
                  <Button
                    className={style.backButton}
                    disabled={pendingSubmit}
                    content={_(".back_to_problem")}
                    onClick={() => !modified && onBackToProblem()}
                  />
                }
                // It's safe to redirect if not modified, don't confirm
                disabled={!modified}
                content={<Button negative content={_(".confirm_back_to_problem")} onClick={onBackToProblem} />}
                on="click"
                position="bottom center"
              />
              <Button primary disabled={!haveSubmitPermission} loading={pendingSubmit} onClick={onSubmit}>
                {haveSubmitPermission ? _(".submit") : _(".no_submit_permission")}
              </Button>
            </Header>
          </Grid.Column>
          <Grid.Column width={5}>
            <Header icon="sticky note outline" className="withIcon" as="h1" content={_(".header_samples")} />
          </Grid.Column>
        </Grid.Row>
        <Grid.Row className={style.row}>
          <Grid.Column width={11}>
            <LocalizeTab
              locales={Object.keys(localizedContents) as Locale[]}
              activeLocale={activeLocale}
              item={locale => (
                <LocalizedContentEditor
                  problemId={props.problem?.meta?.id}
                  localizedContent={localizedContents[locale]}
                  samples={samples}
                  isOnly={Object.keys(localizedContents).length === 1}
                  isDefault={defaultLocale === locale}
                  onMakeDefault={() => setDefaultLocale(locale)}
                  onApplyTemplate={() => onApplyTemplateToLocale(locale)}
                  onDelete={() => onDeleteLocale(locale)}
                  onChangeTitle={title => onChangeTitle(locale, title)}
                  onChangeSectionValue={(index, type, newValue) => onChangeSectionValue(locale, index, type, newValue)}
                  onChangeSectionType={(index, newType) => onChangeSectionType(locale, index, newType)}
                  onChangeSectionSampleId={(index, newSampleId) => onChangeSectionSampleId(locale, index, newSampleId)}
                  onChangeSampleData={onChangeSampleData}
                  onAddSection={(index, type) => onAddSection(locale, index, type)}
                  onDeleteSection={index => onDeleteSection(locale, index)}
                  onMoveSection={(index, direction) => onMoveSection(locale, index, direction)}
                />
              )}
              onAddLocale={onAddLocale}
              onSetActiveLocale={setActiveLocale}
            />
          </Grid.Column>
          <Grid.Column width={5}>
            {samples.length === 0 ? (
              <Dimmer.Dimmable dimmed={true} className={style.noSampleDimmer}>
                <SampleEditor
                  sampleId={null}
                  sample={null}
                  warningMessage={[]}
                  isFirst={null}
                  isLast={null}
                  onChangeSampleData={null}
                  onMoveSampleUp={null}
                  onMoveSampleDown={null}
                  onAddSampleBefore={null}
                  onAddSampleAfter={null}
                  onDeleteSample={null}
                />
                <Dimmer active={true}>
                  <Button primary onClick={() => onAddSample()}>
                    {_(".sample_editor.add_sample_when_empty")}
                  </Button>
                </Dimmer>
              </Dimmer.Dimmable>
            ) : (
              samples.map((sample, sampleId) => (
                <SampleEditor
                  key={sample.uuid}
                  sampleId={sampleId}
                  sample={sample}
                  warningMessage={Object.keys(localizedContents)
                    .map((locale: Locale) => {
                      const referenceCount = localizedContents[locale].contentSections.filter(
                        section => section.type === "Sample" && section.sampleId === sampleId
                      ).length;

                      if (referenceCount === 1) return null;
                      return { locale, referenceCount };
                    })
                    .filter(x => x)}
                  isFirst={sampleId === 0}
                  isLast={sampleId === samples.length - 1}
                  onChangeSampleData={(type, newData) => onChangeSampleData(sampleId, type, newData)}
                  onMoveSampleUp={() => onMoveSample(sampleId, "UP")}
                  onMoveSampleDown={() => onMoveSample(sampleId, "DOWN")}
                  onAddSampleBefore={() => onAddSampleAt(sampleId)}
                  onAddSampleAfter={() => onAddSampleAt(sampleId + 1)}
                  onDeleteSample={() => onDeleteSample(sampleId)}
                />
              ))
            )}
            <Header icon="tag" className="withIcon" as="h1" content={_(".header_tags")} />
            <Dropdown
              search={searchTags}
              fluid
              multiple
              value={tagIds}
              placeholder={_(".tags_placeholder")}
              selection
              noResultsMessage={_(".no_addable_tags")}
              onChange={(e, { value }: { value: number[] }) => {
                if (value.length <= 20) {
                  setModified(true);
                  setTagIds(value);
                }
              }}
              options={props.allProblemTags.map(problemTag => ({
                key: problemTag.id,
                value: problemTag.id,
                text: problemTag.name
              }))}
            />
          </Grid.Column>
        </Grid.Row>
      </Grid>
    </>
  );
};

ProblemEditPage = observer(ProblemEditPage);

export default {
  new: defineRoute(async request => {
    const allProblemTags = await fetchDataAllProblemTags();

    return <ProblemEditPage key={uuid()} new={true} allProblemTags={allProblemTags} />;
  }),
  byId: defineRoute(async request => {
    const id = parseInt(request.params["id"]);
    const requestedLocale: Locale = request.query["locale"] in Locale && (request.query["locale"] as Locale);
    const [problem, allProblemTags] = await Promise.all([fetchData("id", id), fetchDataAllProblemTags()]);

    return (
      <ProblemEditPage
        key={uuid()}
        idType="id"
        problem={problem}
        allProblemTags={allProblemTags}
        requestedLocale={requestedLocale}
      />
    );
  }),
  byDisplayId: defineRoute(async request => {
    const displayId = parseInt(request.params["displayId"]);
    const requestedLocale: Locale = request.query["locale"] in Locale && (request.query["locale"] as Locale);
    const [problem, allProblemTags] = await Promise.all([fetchData("displayId", displayId), fetchDataAllProblemTags()]);

    return (
      <ProblemEditPage
        key={uuid()}
        idType="displayId"
        problem={problem}
        allProblemTags={allProblemTags}
        requestedLocale={requestedLocale}
      />
    );
  })
};
