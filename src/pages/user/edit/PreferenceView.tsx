import React, { useState, useEffect } from "react";
import { Form, Header, Checkbox, TextArea, Button, Select, Flag, Icon, Input } from "semantic-ui-react";
import { observer } from "mobx-react";
import { set as setMobX } from "mobx";

import style from "./UserEdit.module.less";

import api from "@/api";
import { appState, browserDefaultLocale } from "@/appState";
import toast from "@/utils/toast";
import { useAsyncCallbackPending, useConfirmNavigation, useLocalizer, useNavigationChecked } from "@/utils/hooks";
import { Locale } from "@/interfaces/Locale";
import localeMeta from "@/locales/meta";
import * as CodeFormatter from "@/utils/CodeFormatter";
import { CodeLanguage, filterValidCompileAndRunOptions } from "@/interfaces/CodeLanguage";
import { CodeBox, HighlightedCodeBox } from "@/components/CodeBox";
import { RouteError } from "@/AppRouter";
import CodeLanguageAndOptions from "@/components/CodeLanguageAndOptions";
import { availableCodeFonts, availableContentFonts } from "@/misc/fonts";
import { makeToBeLocalizedText } from "@/locales";

export async function fetchData(username: string) {
  const { requestError, response } = await api.user.getUserPreference({ username });
  if (requestError) throw new RouteError(requestError, { showRefresh: true, showBack: true });
  else if (response.error) throw new RouteError(makeToBeLocalizedText(`user_edit.errors.${response.error}`));

  await CodeFormatter.ready;

  return response;
}

interface FontNameWithPreviewProps {
  fontFace: string;
}

const FontNameWithPreview: React.FC<FontNameWithPreviewProps> = props => (
  <span style={{ fontFamily: `"${props.fontFace}"` }}>{props.fontFace}</span>
);

interface PreferenceViewProps {
  meta?: ApiTypes.UserMetaDto;
  preference?: ApiTypes.UserPreferenceDto;
}

const PreferenceView: React.FC<PreferenceViewProps> = props => {
  const _ = useLocalizer("user_edit.preference");
  const navigation = useNavigationChecked();

  useEffect(() => {
    appState.enterNewPage(`${_(`.title`)} - ${props.meta.username}`, null, false);
  }, [appState.locale, props.meta]);

  const [modified, setModified] = useConfirmNavigation();

  const [systemLocale, setSystemLocale] = useState<Locale>((props.preference.locale?.system || null) as Locale);
  const [contentLocale, setContentLocale] = useState<Locale>((props.preference.locale?.content || null) as Locale);
  const [contentFontFace, setContentFontFace] = useState(
    props.preference.font?.contentFontFace || availableContentFonts[0] || "sans-serif"
  );
  const [codeFontFace, setCodeFontFace] = useState(
    props.preference.font?.codeFontFace || availableCodeFonts[0] || "monospace"
  );
  const [codeFontSize, setCodeFontSize] = useState(props.preference.font?.codeFontSize || 14);
  const [codeLineHeight, setCodeLineHeight] = useState(props.preference.font?.codeLineHeight || 1.3);
  const [codeFontLigatures, setCodeFontLigatures] = useState(props.preference.font?.codeFontLigatures !== false);
  const [markdownEditorFont, setMarkdownEditorFont] = useState(
    (props.preference.font?.markdownEditorFont || "content") as "content" | "code"
  );
  const [codeFormatterOptions, setCodeFormatterOptions] = useState(props.preference.codeFormatter?.options || "");
  const [doNotFormatCodeByDefault, setDoNotFormatCodeByDefault] = useState(
    !!props.preference.codeFormatter?.disableByDefault
  );

  // Validate the code language and options value to prevent garbage data on server
  const [defaultCodeLanguage, setDefaultCodeLanguage] = useState(
    Object.values(CodeLanguage).includes(props.preference.code?.defaultLanguage as CodeLanguage)
      ? (props.preference.code?.defaultLanguage as CodeLanguage)
      : CodeLanguage.Cpp
  );
  const [defaultCompileAndRunOptions, setDefaultCompileAndRunOptions] = useState(
    filterValidCompileAndRunOptions(defaultCodeLanguage, props.preference.code?.defaultCompileAndRunOptions)
  );

  const defaultSystemLocale = browserDefaultLocale;
  const defaultContentLocale = systemLocale || browserDefaultLocale;

  const [pending, onSubmit] = useAsyncCallbackPending(async () => {
    const preference: ApiTypes.UserPreferenceDto = {
      locale: {
        system: systemLocale,
        content: contentLocale
      },
      font: {
        contentFontFace,
        codeFontFace,
        codeFontSize,
        codeLineHeight,
        codeFontLigatures,
        markdownEditorFont
      },
      codeFormatter: {
        options: codeFormatterOptions,
        disableByDefault: doNotFormatCodeByDefault
      },
      code: {
        defaultLanguage: defaultCodeLanguage,
        defaultCompileAndRunOptions: defaultCompileAndRunOptions
      }
    };

    const { requestError, response } = await api.user.updateUserPreference({
      userId: props.meta.id,
      preference
    });

    if (requestError) toast.error(requestError(_));
    else if (response.error) toast.error(_(`.${response.error}`));
    else {
      setModified(false);

      toast.success(_(".success"));

      if (appState.currentUser.id === props.meta.id) {
        const systemLocaleChanged = appState.userPreference.locale?.system !== systemLocale;
        setMobX(appState.userPreference, preference);
        if (systemLocaleChanged) {
          navigation.refresh();
        }
      }
    }
  });

  const fontPreviewContent = `<h2>A Harmony of LIGHT</h2><p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. A scelerisque purus semper eget duis at tellus at. Adipiscing elit duis tristique sollicitudin nibh.</p><h2>Awaits You in a Lost WORLD</h2><p>Velit sed ullamcorper morbi tincidunt ornare. Suscipit tellus mauris a diam maecenas. Tellus integer feugiat scelerisque varius morbi enim nunc. Eget aliquet nibh praesent tristique. Interdum posuere lorem ipsum dolor sit. Sed sed risus pretium quam vulputate dignissim suspendisse in est.</p><p>Elementum sagittis vitae et leo duis. Neque convallis a cras semper auctor. Justo eget magna fermentum iaculis eu non diam.</p>`;

  // XD I write this because I'm studying the course -- Introduction to Database Systems
  const fontPreviewCode = `puts("Tell me something about Menci~www");
std::shared_ptr<Student> Menci = readRecord<Student>();
if (Menci->age >= 0x14 && Menci->gender == "M" && Menci->major == "CS") {
  puts("#### Test passed qwq. Orz %%");
}`;

  const formatPreviewCode = `#include<cstdio>

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

  const [formatPreviewSuccess, formattedPreviewCode] = CodeFormatter.format(
    formatPreviewCode,
    CodeLanguage.Cpp,
    codeFormatterOptions || CodeFormatter.defaultOptions
  );

  return (
    <>
      <Header className={style.sectionHeader} size="large" content={_(".locale.header")} />
      <Header className={style.header} size="tiny" content={_(".locale.system")} />
      <Select
        className={style.notFullWidth + " " + style.localeSelect}
        fluid
        value={systemLocale || "DEFAULT"}
        onChange={(e, { value }) => (
          setModified(true), setSystemLocale((value === "DEFAULT" ? null : value) as Locale)
        )}
        options={[
          {
            key: "DEFAULT",
            value: "DEFAULT",
            text:
              props.meta.id === appState.currentUser.id ? (
                <>
                  <Flag name={localeMeta[defaultSystemLocale].flag as any} />
                  {_(".locale.system_default_name", { name: localeMeta[defaultSystemLocale].name })}
                </>
              ) : (
                <>
                  <Icon name="globe" />
                  {_(".locale.system_default")}
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
      <div className={style.notes}>{_(".locale.system_notes")}</div>
      <Header className={style.header} size="tiny" content={_(".locale.content")} />
      <Select
        className={style.notFullWidth + " " + style.localeSelect}
        fluid
        value={contentLocale || "DEFAULT"}
        onChange={(e, { value }) => (
          setModified(true), setContentLocale((value === "DEFAULT" ? null : value) as Locale)
        )}
        options={[
          {
            key: "DEFAULT",
            value: "DEFAULT",
            text:
              props.meta.id === appState.currentUser.id ? (
                <>
                  <Flag name={localeMeta[defaultContentLocale].flag as any} />
                  {_(".locale.content_default_name", { name: localeMeta[defaultContentLocale].name })}
                </>
              ) : (
                <>
                  <Icon name="globe" />
                  {_(".locale.content_default")}
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
      <div className={style.notes}>{_(".locale.content_notes")}</div>
      <Header className={style.sectionHeader} size="large" content={_(".font.header")} />
      <Header className={style.header} size="tiny" content={_(".font.content_font_face")} />
      {/* The browser may won't load the webfonts until the user open the select. */}
      <div className={style.forceLoadFonts}>
        {[...availableCodeFonts, ...availableContentFonts].map(fontFace => (
          <FontNameWithPreview key={fontFace} fontFace={fontFace} />
        ))}
      </div>
      <Select
        className={style.notFullWidth + " " + style.fontSelect}
        fluid
        value={contentFontFace}
        onChange={(e, { value }) => (setModified(true), setContentFontFace(value as string))}
        options={[
          {
            key: "sans-serif",
            value: "sans-serif",
            text: <span style={{ fontFamily: "sans-serif" }}>{_(".font.system_default_sans_serif")}</span>
          },
          {
            key: "serif",
            value: "serif",
            text: <span style={{ fontFamily: "serif" }}>{_(".font.system_default_serif")}</span>
          },
          ...availableContentFonts.map(fontFace => ({
            text: <FontNameWithPreview fontFace={fontFace} />,
            value: fontFace,
            key: fontFace
          }))
        ]}
      />
      <Header className={style.header} size="tiny" content={_(".font.content_preview")} />
      <CodeBox
        className="content-font"
        segment={{
          color: "pink"
        }}
        html={fontPreviewContent}
        fontFaceOverride={contentFontFace}
        wrap
      />
      <Header className={style.header} size="tiny" content={_(".font.code_font_face")} />
      <Select
        className={style.notFullWidth + " " + style.fontSelect}
        fluid
        value={codeFontFace}
        onChange={(e, { value }) => (setModified(true), setCodeFontFace(value as string))}
        options={[
          {
            key: "monospace",
            value: "monospace",
            text: <span style={{ fontFamily: "monospace" }}>{_(".font.system_default")}</span>
          },
          ...availableCodeFonts.map(fontFace => ({
            text: <FontNameWithPreview fontFace={fontFace} />,
            value: fontFace,
            key: fontFace
          }))
        ]}
      />
      <Header className={style.header} size="tiny" content={_(".font.code_font_size")} />
      <Input
        className={style.notFullWidth}
        fluid
        value={codeFontSize}
        type="number"
        min={5}
        max={20}
        step={0.5}
        onChange={(e, { value }) => {
          const x = Number(value);
          if (x >= 5 && x <= 20) setModified(true), setCodeFontSize(x);
        }}
      />
      <Header className={style.header} size="tiny" content={_(".font.code_line_height")} />
      <Input
        className={style.notFullWidth}
        fluid
        value={codeLineHeight}
        type="number"
        min={1}
        max={2}
        step={0.05}
        onChange={(e, { value }) => {
          const x = Number(value);
          if (x >= 1 && x <= 2) setModified(true), setCodeLineHeight(x);
        }}
      />
      <Checkbox
        className={style.checkbox + " " + style.largeMargin}
        checked={codeFontLigatures}
        label={_(".font.code_font_ligatures")}
        onChange={(e, { checked }) => !pending && (setModified(true), setCodeFontLigatures(checked))}
      />
      <div className={style.notes}>{_(".font.code_font_ligatures_notes")}</div>
      <Header className={style.header} size="tiny" content={_(".font.code_preview")} />
      <HighlightedCodeBox
        segment={{
          color: "blue"
        }}
        language={"cpp"}
        code={fontPreviewCode}
        fontFaceOverride={codeFontFace}
        fontSizeOverride={codeFontSize}
        lineHeightOverride={codeLineHeight}
        fontLigaturesOverride={codeFontLigatures}
      />
      <Form>
        <Form.Group inline>
          <label className={style.formLabel}>{_(".font.markdown_editor_font.markdown_editor")}</label>
          <Form.Radio
            label={_(".font.markdown_editor_font.content_font")}
            value="content"
            checked={markdownEditorFont === "content"}
            onChange={() => setMarkdownEditorFont("content")}
          />
          <Form.Radio
            label={_(".font.markdown_editor_font.code_font")}
            value="code"
            checked={markdownEditorFont === "code"}
            onChange={() => setMarkdownEditorFont("code")}
          />
        </Form.Group>
      </Form>
      <Header className={style.sectionHeader} size="large" content={_(".code_language.header")} />
      <Form className={style.notFullWidth}>
        <CodeLanguageAndOptions
          headerForLanguage={_(".code_language.language")}
          classNameForCompileAndRunOptions={style.halfWidthFieldContainer}
          language={defaultCodeLanguage}
          compileAndRunOptions={defaultCompileAndRunOptions}
          onUpdateLanguage={codeLanguage => (setModified(true), setDefaultCodeLanguage(codeLanguage))}
          onUpdateCompileAndRunOptions={options => (setModified(true), setDefaultCompileAndRunOptions(options))}
        />
      </Form>
      <div className={style.notes}>{_(".code_language.content_notes")}</div>
      <Header className={style.sectionHeader} size="large" content={_(".code_formatter.header")} />
      <Header className={style.header} size="tiny" content={_(".code_formatter.astyle_options")} />
      <Form>
        <TextArea
          className={style.textarea + " monospace"}
          rows="5"
          placeholder={CodeFormatter.defaultOptions}
          value={codeFormatterOptions}
          onChange={(e, { value }: { value: string }) =>
            value.length < 1024 && !pending && (setModified(true), setCodeFormatterOptions(value))
          }
        />
      </Form>
      <div className={style.notes}>
        {_(".code_formatter.notes_before")}
        <a href="http://astyle.sourceforge.net/astyle.html" target="_blank" rel="noreferrer noopener">
          &nbsp;{_(".code_formatter.notes_link")}&nbsp;
        </a>
        {_(".code_formatter.notes_after")}
      </div>
      <Checkbox
        className={style.checkbox}
        checked={!doNotFormatCodeByDefault}
        label={_(".code_formatter.format_code_by_default")}
        onChange={(e, { checked }) => !pending && (setModified(true), setDoNotFormatCodeByDefault(!checked))}
      />
      <Header
        className={style.header}
        size="tiny"
        content={_(formatPreviewSuccess ? ".code_formatter.preview" : ".code_formatter.error")}
      />
      <HighlightedCodeBox
        segment={{
          color: formatPreviewSuccess ? "green" : "red"
        }}
        language={formatPreviewSuccess ? "cpp" : null}
        code={formattedPreviewCode}
      />
      <Button
        className={style.submit}
        loading={pending}
        disabled={!formatPreviewSuccess}
        primary
        content={_(".submit")}
        onClick={onSubmit}
      />
    </>
  );
};

export const View = observer(PreferenceView);
