import React, { useEffect, useState, useRef } from "react";
import {
  Dropdown,
  Grid,
  Icon,
  Container,
  Header,
  Menu,
  Segment,
  Popup,
  Button,
  Form,
  Tab,
  Flag,
  Input,
  TextArea,
  Checkbox,
  Radio,
  Dimmer,
  List
} from "semantic-ui-react";
import TextAreaAutoSize from "react-textarea-autosize";
import { route } from "navi";
import { useNavigation } from "react-navi";
import uuid from "uuid/v4";
import update from "immutability-helper";

import style from "./ProblemEditPage.module.less";

import { ProblemApi } from "@/api";
import { Locale } from "@/interfaces/Locale";
import localeMeta from "@/locales/meta";
import { appState } from "@/appState";
import toast from "@/utils/toast";
import { useIntlMessage, useConfirmUnload } from "@/utils/hooks";
import { observer } from "mobx-react";

type ProblemEditDetail = ApiTypes.GetProblemStatementsAllLocalesResponseDto;

async function fetchData(idType: "id" | "displayId", id: number): Promise<ProblemEditDetail> {
  const { requestError, response } = await ProblemApi.getProblemStatementsAllLocales({
    [idType]: id
  });

  if (requestError || response.error) {
    toast.error(requestError || response.error);
    return null;
  }

  return response;
}

interface LocalizedContentSection {
  uuid: string;
  sectionTitle: string;
  type: "TEXT" | "SAMPLE";
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
  section: LocalizedContentSection;
  samples: Sample[];

  isPreview: boolean;
  isFirst: boolean;
  isLast: boolean;

  onChangeSectionValue: (type: "sectionTitle" | "text", newValue: string) => void;
  onChangeSectionType: (newType: "TEXT" | "SAMPLE") => void;
  onChangeSectionSampleId: (newSampleId: number) => void;
  onChangeSampleData: (sampleId: number, type: "inputData" | "outputData", newData: string) => void;
  onAddSectionBefore: () => void;
  onAddSectionAfter: () => void;
  onMoveSectionUp: () => void;
  onMoveSectionDown: () => void;
  onDeleteSection: () => void;
}

const LocalizedContentEditorSection: React.FC<LocalizedContentEditorSectionProps> = props => {
  const _ = useIntlMessage();

  const [preview, setPreview] = useState(false);

  const refOptionsButton = useRef(null);

  return (
    <>
      <Menu attached="top" className={style.toolbarMenu}>
        <Menu.Item className={style.toolbarMenuInputItem}>
          <Input
            className={style.boldInput}
            fluid
            transparent
            placeholder={_("problem_edit.content_editor.section_title")}
            value={props.section.sectionTitle}
            onChange={(e, { value }) => props.onChangeSectionValue("sectionTitle", value)}
          />
        </Menu.Item>
        <Menu.Menu position="right">
          <Menu.Item>
            <Checkbox
              fitted
              label={_("problem_edit.content_editor.preview")}
              checked={preview || props.isPreview}
              disabled={props.isPreview}
              onChange={(e, { checked }) => setPreview(checked)}
            />
          </Menu.Item>
          {props.section.type === "SAMPLE" && (
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
                      {_("problem_edit.content_editor.new_sample")}
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
                key: "TEXT",
                text: (
                  <>
                    <Icon name="sticky note" />
                    {_("problem_edit.content_editor.section_type.text")}
                  </>
                ),
                value: "TEXT",
                onClick: () => props.section.type === "TEXT" || props.onChangeSectionType("TEXT")
              },
              {
                key: "SAMPLE",
                text: (
                  <>
                    <Icon name="sticky note outline" />
                    {_("problem_edit.content_editor.section_type.sample")}
                  </>
                ),
                value: "SAMPLE",
                onClick: () => props.section.type === "SAMPLE" || props.onChangeSectionType("SAMPLE")
              }
            ]}
          />
          <Dropdown item closeOnChange icon="add" className={`icon ${style.toolbarMenuIconItem}`}>
            <Dropdown.Menu>
              <Dropdown.Item
                icon="arrow up"
                text={_("problem_edit.content_editor.add_section.before_this_section")}
                onClick={() => props.onAddSectionBefore()}
              />
              <Dropdown.Item
                icon="arrow down"
                text={_("problem_edit.content_editor.add_section.after_this_section")}
                onClick={() => props.onAddSectionAfter()}
              />
            </Dropdown.Menu>
          </Dropdown>
          <Dropdown
            item
            icon="bars"
            className={`icon ${style.toolbarMenuIconItem}`}
            // Semantic UI doesn't forward ref
            ref={ref => (refOptionsButton.current = ref && (ref as any).ref.current)}
          >
            <Dropdown.Menu>
              <Dropdown.Item
                disabled={props.isFirst}
                icon="angle double up"
                text={_("problem_edit.content_editor.section_options.move_up")}
                onClick={() => props.onMoveSectionUp()}
              />
              <Dropdown.Item
                disabled={props.isLast}
                icon="angle double down"
                text={_("problem_edit.content_editor.section_options.move_down")}
                onClick={() => props.onMoveSectionDown()}
              />
              <Popup
                trigger={
                  <Dropdown.Item
                    disabled={props.isFirst && props.isLast}
                    icon="delete"
                    text={_("problem_edit.content_editor.section_options.delete")}
                  />
                }
                context={refOptionsButton}
                content={
                  <Button
                    color="red"
                    content={_("problem_edit.content_editor.section_options.confirm_delete")}
                    onClick={() => props.onDeleteSection()}
                  />
                }
                on="click"
                position="top right"
              />
            </Dropdown.Menu>
          </Dropdown>
        </Menu.Menu>
      </Menu>
      <Segment attached="bottom" className={style.sectionSegment} data-type={props.section.type}>
        {props.section.type === "SAMPLE" ? (
          <Grid columns="equal" className={style.sampleEditorGrid}>
            <Grid.Row>
              <Grid.Column>
                <Form>
                  <TextArea
                    rows={4}
                    value={props.samples[props.section.sampleId].inputData}
                    placeholder={_("problem_edit.content_editor.sample_input")}
                    onChange={(e, { value }) =>
                      props.onChangeSampleData(props.section.sampleId, "inputData", value as string)
                    }
                  />
                </Form>
              </Grid.Column>
              <Grid.Column>
                <Form>
                  <TextArea
                    rows={4}
                    value={props.samples[props.section.sampleId].outputData}
                    placeholder={_("problem_edit.content_editor.sample_output")}
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
                  <Segment basic>{props.section.text}</Segment>
                ) : (
                  <Form>
                    <TextArea
                      as={TextAreaAutoSize}
                      minRows={4}
                      maxRows={16}
                      value={props.section.text}
                      placeholder={_("problem_edit.content_editor.sample_explanation")}
                      onChange={(e, { value }) => props.onChangeSectionValue("text", value as string)}
                    />
                  </Form>
                )}
              </Grid.Column>
            </Grid.Row>
          </Grid>
        ) : preview || props.isPreview ? (
          <Segment basic>{props.section.text}</Segment>
        ) : (
          <Form>
            <TextArea
              as={TextAreaAutoSize}
              minRows={4}
              maxRows={16}
              value={props.section.text}
              placeholder={_("problem_edit.content_editor.section_content")}
              onChange={(e, { value }) => props.onChangeSectionValue("text", value as string)}
            />
          </Form>
        )}
      </Segment>
    </>
  );
};

interface LocalizedContentEditorProps {
  localizedContent: LocalizedContent;
  samples: Sample[];

  isOnly: boolean;
  isDefault: boolean;
  onMakeDefault: () => void;
  onApplyTemplate: () => void;
  onDelete: () => void;

  onChangeTitle: (newTitle: string) => void;

  onChangeSectionValue: (index: number, type: "sectionTitle" | "text", newValue: string) => void;
  onChangeSectionType: (index: number, newType: "TEXT" | "SAMPLE") => void;
  onChangeSectionSampleId: (index: number, newSampleId: number) => void;
  onChangeSampleData: (sampleId: number, type: "inputData" | "outputData", newData: string) => void;
  onAddSection: (index: number) => void;
  onDeleteSection: (index: number) => void;
  onMoveSection: (index: number, direction: "UP" | "DOWN") => void;
}

const LocalizedContentEditor: React.FC<LocalizedContentEditorProps> = props => {
  const _ = useIntlMessage();

  const [preview, setPreview] = useState(false);

  const safeToApplyTemplate = props.localizedContent.contentSections.every(
    section => !section.sectionTitle && section.type === "TEXT" && !section.text
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
            placeholder={_("problem_edit.content_editor.title")}
            value={props.localizedContent.title}
            onChange={(e, { value }) => props.onChangeTitle(value)}
          />
        </Menu.Item>
        <Menu.Menu position="right">
          <Menu.Item>
            <Checkbox
              label={_("problem_edit.content_editor.preview_all")}
              checked={preview}
              onChange={(e, { checked }) => setPreview(checked)}
            />
          </Menu.Item>
          {!props.isOnly && (
            <>
              <Menu.Item>
                <Radio
                  label={_("problem_edit.content_editor.default")}
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
                content={_("problem_edit.content_editor.confirm_apply_template")}
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
                  <Button
                    color="red"
                    content={_("problem_edit.content_editor.confirm_delete")}
                    onClick={() => props.onDelete()}
                  />
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
          section={section}
          samples={props.samples}
          isPreview={preview}
          isFirst={index === 0}
          isLast={index === props.localizedContent.contentSections.length - 1}
          onChangeSectionValue={(type, newValue) => props.onChangeSectionValue(index, type, newValue)}
          onChangeSectionType={newType => props.onChangeSectionType(index, newType)}
          onChangeSectionSampleId={newSampleId => props.onChangeSectionSampleId(index, newSampleId)}
          onChangeSampleData={props.onChangeSampleData}
          onAddSectionBefore={() => props.onAddSection(index)}
          onAddSectionAfter={() => props.onAddSection(index + 1)}
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
  const _ = useIntlMessage();

  const refOptionsButton = useRef(null);

  return (
    <>
      <Menu attached="top" className={style.toolbarMenu}>
        <Menu.Item className={style.toolbarMenuInputItem}>
          <Input
            className={style.boldInput}
            fluid
            transparent
            placeholder={_("problem_edit.sample_editor.sample_id")}
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
                        ? _("problem_edit.sample_editor.warning.not_referenced", {
                            language: localeMeta[warningMessage.locale].name
                          })
                        : _("problem_edit.sample_editor.warning.multiple_references", {
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
                text={_("problem_edit.sample_editor.add_sample.before_this_sample")}
                onClick={() => props.onAddSampleBefore()}
              />
              <Dropdown.Item
                icon="arrow down"
                text={_("problem_edit.sample_editor.add_sample.after_this_sample")}
                onClick={() => props.onAddSampleAfter()}
              />
            </Dropdown.Menu>
          </Dropdown>
          <Dropdown
            item
            icon="bars"
            className={`icon ${style.toolbarMenuIconItem}`}
            // Semantic UI doesn't forward ref
            ref={ref => (refOptionsButton.current = ref && (ref as any).ref.current)}
          >
            <Dropdown.Menu>
              <Dropdown.Item
                disabled={props.isFirst}
                icon="angle double up"
                text={_("problem_edit.sample_editor.options.move_up")}
                onClick={() => props.onMoveSampleUp()}
              />
              <Dropdown.Item
                disabled={props.isLast}
                icon="angle double down"
                text={_("problem_edit.sample_editor.options.move_down")}
                onClick={() => props.onMoveSampleDown()}
              />
              <Popup
                trigger={<Dropdown.Item icon="delete" text={_("problem_edit.sample_editor.options.delete")} />}
                context={refOptionsButton}
                content={
                  <Button
                    color="red"
                    content={_("problem_edit.sample_editor.options.confirm_delete")}
                    onClick={() => props.onDeleteSample()}
                  />
                }
                on="click"
                position="top right"
              />
            </Dropdown.Menu>
          </Dropdown>
        </Menu.Menu>
      </Menu>
      <Segment attached="bottom" className={style.sectionSegment}>
        <Grid columns="equal" className={style.sampleEditorGrid}>
          <Grid.Row>
            <Grid.Column>
              <Form>
                <TextArea
                  rows={4}
                  value={props.sample ? props.sample.inputData : ""}
                  placeholder={_("problem_edit.content_editor.sample_input")}
                  onChange={(e, { value }) => props.onChangeSampleData("inputData", value as string)}
                />
              </Form>
            </Grid.Column>
            <Grid.Column>
              <Form>
                <TextArea
                  rows={4}
                  value={props.sample ? props.sample.outputData : ""}
                  placeholder={_("problem_edit.content_editor.sample_output")}
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
      type: "TEXT",
      text: ""
    },
    {
      uuid: uuid(),
      sectionTitle: "输入格式",
      type: "TEXT",
      text: ""
    },
    {
      uuid: uuid(),
      sectionTitle: "输出格式",
      type: "TEXT",
      text: ""
    },
    {
      uuid: uuid(),
      sectionTitle: "样例",
      type: "SAMPLE",
      sampleId: 0,
      text: ""
    },
    {
      uuid: uuid(),
      sectionTitle: "数据范围与提示",
      type: "TEXT",
      text: ""
    }
  ],
  [Locale.en_US]: [
    {
      uuid: uuid(),
      sectionTitle: "Description",
      type: "TEXT",
      text: ""
    },
    {
      uuid: uuid(),
      sectionTitle: "Input",
      type: "TEXT",
      text: ""
    },
    {
      uuid: uuid(),
      sectionTitle: "Output",
      type: "TEXT",
      text: ""
    },
    {
      uuid: uuid(),
      sectionTitle: "Sample",
      type: "SAMPLE",
      sampleId: 0,
      text: ""
    },
    {
      uuid: uuid(),
      sectionTitle: "Limits And Hints",
      type: "TEXT",
      text: ""
    }
  ]
};

interface ProblemEditPageProps {
  idType?: "id" | "displayId";
  problem?: ProblemEditDetail;
  new?: boolean;
  requestedLocale?: Locale;
}

let ProblemEditPage: React.FC<ProblemEditPageProps> = props => {
  const _ = useIntlMessage();
  const navigation = useNavigation();

  const idString =
    !props.new && (props.idType === "id" ? `P${props.problem.meta.id}` : `#${props.problem.meta.displayId}`);

  useEffect(() => {
    if (props.new) {
      appState.title = `${_("problem_edit.title_new")}`;
    } else {
      appState.title = `${idString} - ${_("problem_edit.title_edit")}`;
    }
  }, [appState.locale]);

  const [localizedContents, setLocalizedContents] = useState(
    (() => {
      const converted: Partial<Record<Locale, LocalizedContent>> = {};
      if (!props.new) {
        for (const content of props.problem.statement.localizedContents) {
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
              type: "TEXT",
              text: ""
            }
          ]
        };
      }
      return converted;
    })()
  );

  const [modified, setModified] = useState(false);
  const [pendingSubmit, setPendingSubmit] = useState(false);
  async function onSubmit() {
    if (pendingSubmit) return;

    setPendingSubmit(true);

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
            section.type === "TEXT"
              ? {
                  sectionTitle: section.sectionTitle,
                  type: "TEXT",
                  text: section.text
                }
              : {
                  sectionTitle: section.sectionTitle,
                  type: "SAMPLE",
                  sampleId: section.sampleId,
                  text: section.text
                }
          )
        })
      );

    const samplesPayload = samples.map(sample => ({
      inputData: sample.inputData,
      outputData: sample.outputData
    }));

    if (props.new) {
      const { requestError, response } = await ProblemApi.createProblem({
        type: "TRADITIONAL",
        statement: {
          localizedContents: localizedContentsPayload,
          samples: samplesPayload
        }
      });

      if (requestError) toast.error(requestError);
      else if (response.error) {
        toast.error(_(`problem_edit.submit_error.create.${response.error}`));
      } else {
        navigation.navigate(`/problem/by-id/${response.id}`);
      }
    } else {
      const { requestError, response } = await ProblemApi.updateStatement({
        problemId: props.problem.meta.id,
        localizedContents: localizedContentsPayload,
        samples: samplesPayload
      });

      if (requestError) toast.error(requestError);
      else if (response.error) {
        toast.error(_(`problem_edit.submit_error.update.${response.error}`));
      } else {
        toast.success(_("problem_edit.submit_success"));
        setModified(false);
      }
    }

    setPendingSubmit(false);
  }

  function onBackToProblem() {
    if (props.new) {
      navigation.navigate("/problems");
    } else if (props.idType === "displayId") {
      navigation.navigate({
        pathname: `/problem/${props.problem.meta.displayId}`,
        query: props.requestedLocale
          ? {
              locale: props.requestedLocale
            }
          : null
      });
    } else {
      navigation.navigate({
        pathname: `/problem/by-id/${props.problem.meta.id}`,
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

    const locales = Object.keys(localizedContents);

    // Select first non-deleting locale as default
    locales.some((nextLocale: Locale) => {
      if (nextLocale !== locale) {
        setDefaultLocale(nextLocale);
        return true;
      }
    });

    // Select the one next to the deleting as active
    const deleteingIndex = locales.indexOf(locale);
    if (deleteingIndex === 0) {
      // If deleting the leftist, select the right side as active
      // The right side is 0 after deleting the current 0
    } else {
      // Select the left side as active
      setLanguageTabActiveIndex(deleteingIndex - 1);
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

    const index = Object.keys(localizedContents).length;

    setLocalizedContents(
      update(localizedContents, {
        [locale]: {
          $set: {
            title: "",
            contentSections: [
              {
                uuid: uuid(),
                sectionTitle: "",
                type: "TEXT",
                text: ""
              }
            ]
          }
        }
      })
    );

    setLanguageTabActiveIndex(index);
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

  function onAddSection(locale: Locale, index: number) {
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
                  type: "TEXT",
                  text: ""
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

  function onChangeSectionType(locale: Locale, index: number, newType: "TEXT" | "SAMPLE") {
    if (pendingSubmit) return;
    setModified(true);

    if (newType === "SAMPLE" && !samples.length) onAddSample();
    setLocalizedContents(
      update(localizedContents, {
        [locale]: {
          contentSections: {
            [index]: {
              type: { $set: newType },
              sampleId: newType === "SAMPLE" ? { $set: 0 } : {},
              $unset: newType === "TEXT" ? ["sampleId"] : []
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
          if (section.type !== "SAMPLE") return {};
          const newSampleId = callback(section.sampleId);

          // Not modified
          if (newSampleId === section.sampleId) return {};

          // Deleted
          if (newSampleId == null)
            return {
              $unset: ["sampleId"],
              type: { $set: "TEXT" }
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
      : props.problem.statement.samples.map(sample => ({
          uuid: uuid(),
          ...sample
        }))
  );

  const defaultEditingLocaleIndex = props.new
    ? 0
    : Object.keys(localizedContents).indexOf(props.requestedLocale || appState.locale);
  const [languageTabActiveIndex, setLanguageTabActiveIndex] = useState(
    defaultEditingLocaleIndex == -1 ? 0 : defaultEditingLocaleIndex
  );

  const [defaultLocale, setDefaultLocale] = useState(
    props.new ? appState.locale : (props.problem.meta.locales[0] as Locale)
  );

  // TODO: Request permission from server for creating new problems
  const haveSubmitPermission = props.new ? true : props.problem.permission["WRITE"];

  useConfirmUnload(() => modified);

  return (
    <>
      <Grid>
        <Grid.Row>
          <Grid.Column width={11}>
            <Header as="h1" className={style.headerContainer}>
              {props.new ? `${_("problem_edit.header_new")}` : `${_("problem_edit.header_edit", { idString })}`}
              <Popup
                trigger={
                  <Button
                    className={style.backButton}
                    disabled={pendingSubmit}
                    content={_("problem_edit.back_to_problem")}
                    onClick={() => !modified && onBackToProblem()}
                  />
                }
                // It's safe to redirect if not modified, don't confirm
                disabled={!modified}
                content={
                  <Button negative content={_("problem_edit.confirm_back_to_problem")} onClick={onBackToProblem} />
                }
                on="click"
                position="bottom center"
              />
              <Button primary disabled={!haveSubmitPermission} loading={pendingSubmit} onClick={onSubmit}>
                {haveSubmitPermission ? _("problem_edit.submit") : _("problem_edit.no_submit_permission")}
              </Button>
            </Header>
          </Grid.Column>
          <Grid.Column width={5}>
            <Header as="h1">
              <strong>{_("problem_edit.header_samples")}</strong>
            </Header>
          </Grid.Column>
        </Grid.Row>
        <Grid.Row>
          <Grid.Column width={11}>
            <Tab
              activeIndex={languageTabActiveIndex}
              onTabChange={(e, { activeIndex }) =>
                activeIndex !== Object.keys(localizedContents).length &&
                setLanguageTabActiveIndex(activeIndex as number)
              }
              menu={{ pointing: true }}
              panes={[
                ...Object.keys(localizedContents).map((locale: Locale) => ({
                  menuItem: (
                    <Menu.Item key={locale}>
                      <Flag name={localeMeta[locale].flag as any} />
                      {_(`language.${locale}`)}
                    </Menu.Item>
                  ),
                  pane: {
                    key: locale,
                    className: style.localeTabPane,
                    content: (
                      <LocalizedContentEditor
                        localizedContent={localizedContents[locale]}
                        samples={samples}
                        isOnly={Object.keys(localizedContents).length === 1}
                        isDefault={defaultLocale === locale}
                        onMakeDefault={() => setDefaultLocale(locale)}
                        onApplyTemplate={() => onApplyTemplateToLocale(locale)}
                        onDelete={() => onDeleteLocale(locale)}
                        onChangeTitle={title => onChangeTitle(locale, title)}
                        onChangeSectionValue={(index, type, newValue) =>
                          onChangeSectionValue(locale, index, type, newValue)
                        }
                        onChangeSectionType={(index, newType) => onChangeSectionType(locale, index, newType)}
                        onChangeSectionSampleId={(index, newSampleId) =>
                          onChangeSectionSampleId(locale, index, newSampleId)
                        }
                        onChangeSampleData={onChangeSampleData}
                        onAddSection={index => onAddSection(locale, index)}
                        onDeleteSection={index => onDeleteSection(locale, index)}
                        onMoveSection={(index, direction) => onMoveSection(locale, index, direction)}
                      />
                    )
                  }
                })),
                {
                  menuItem: (
                    <Dropdown
                      key="add"
                      item
                      icon="add"
                      // Fix Semantic UI attempts to pass a active={false} to this menu item
                      active=""
                      disabled={Object.keys(localizedContents).length === Object.keys(localeMeta).length}
                      className={`icon ${style.toolbarMenuIconItem}`}
                    >
                      <Dropdown.Menu>
                        {Object.keys(localeMeta)
                          .filter((locale: Locale) => !(locale in localizedContents))
                          .map((locale: Locale) => (
                            <Dropdown.Item
                              key={locale}
                              flag={localeMeta[locale].flag}
                              text={_(`language.${locale}`)}
                              onClick={() => onAddLocale(locale)}
                            />
                          ))}
                      </Dropdown.Menu>
                    </Dropdown>
                  ),
                  pane: {
                    key: "add",
                    content: null
                  }
                }
              ]}
              renderActiveOnly={false}
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
                <Dimmer active={true} inverted>
                  <Button primary onClick={() => onAddSample()}>
                    {_("problem_edit.sample_editor.add_sample_when_empty")}
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
                        section => section.type === "SAMPLE" && section.sampleId === sampleId
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
          </Grid.Column>
        </Grid.Row>
      </Grid>
    </>
  );
};

ProblemEditPage = observer(ProblemEditPage);

export default {
  new: route({
    async getView(request) {
      return <ProblemEditPage key={Math.random()} new={true} />;
    }
  }),
  byId: route({
    async getView(request) {
      const id = parseInt(request.params["id"]);
      const requestedLocale: Locale = request.query["locale"] in Locale && (request.query["locale"] as Locale);
      const problem = await fetchData("id", id);
      if (problem === null) {
        // TODO: Display an error page
        return null;
      }

      return <ProblemEditPage key={Math.random()} idType="id" problem={problem} requestedLocale={requestedLocale} />;
    }
  }),
  byDisplayId: route({
    async getView(request) {
      const displayId = parseInt(request.params["displayId"]);
      const requestedLocale: Locale = request.query["locale"] in Locale && (request.query["locale"] as Locale);
      const problem = await fetchData("displayId", displayId);
      if (problem === null) {
        // TODO: Display an error page
        return null;
      }

      return (
        <ProblemEditPage key={Math.random()} idType="displayId" problem={problem} requestedLocale={requestedLocale} />
      );
    }
  })
};
