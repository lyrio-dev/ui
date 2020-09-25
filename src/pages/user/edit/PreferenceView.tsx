import React, { useState, useEffect } from "react";
import { Form, Header, Checkbox, TextArea, Button, Select, Flag, Icon } from "semantic-ui-react";
import { observer } from "mobx-react";
import { useNavigation } from "react-navi";
import { FormattedMessage } from "react-intl";

import style from "./UserEdit.module.less";

import { UserApi } from "@/api";
import { appState, browserDefaultLocale } from "@/appState";
import toast from "@/utils/toast";
import { useIntlMessage } from "@/utils/hooks";
import { Locale } from "@/interfaces/Locale";
import localeMeta from "@/locales/meta";
import * as CodeFormatter from "@/utils/CodeFormatter";
import { CodeLanguage, filterValidCompileAndRunOptions } from "@/interfaces/CodeLanguage";
import { HighlightedCodeBox } from "@/components/CodeBox";
import { RouteError } from "@/AppRouter";
import CodeLanguageAndOptions from "@/components/CodeLanguageAndOptions";

export async function fetchData(userId: number) {
  const { requestError, response } = await UserApi.getUserPreference({ userId });
  if (requestError) throw new RouteError(requestError, { showRefresh: true, showBack: true });
  else if (response.error) throw new RouteError(<FormattedMessage id={`user_edit.errors.${response.error}`} />);

  await CodeFormatter.ready;

  return response;
}

interface PreferenceViewProps {
  meta?: ApiTypes.UserMetaDto;
  preference?: ApiTypes.UserPreferenceDto;
}

const PreferenceView: React.FC<PreferenceViewProps> = props => {
  const _ = useIntlMessage("user_edit.preference");
  const navigation = useNavigation();

  useEffect(() => {
    appState.enterNewPage(`${_(`.title`)} - ${props.meta.username}`, null, false);
  }, [appState.locale]);

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
  const [defaultCompileAndRunOptions, setDefaultCompileAndRunOptions] = useState(
    filterValidCompileAndRunOptions(defaultCodeLanguage, props.preference.defaultCompileAndRunOptions)
  );

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
        defaultCompileAndRunOptions
      }
    });

    if (requestError) toast.error(requestError);
    else if (response.error) toast.error(_(`.${response.error}`));
    else {
      toast.success(_(".success"));

      if (appState.currentUser.id === props.meta.id) {
        if (appState.userPreference.systemLocale !== systemLocale) {
          appState.userPreference.systemLocale = systemLocale;
          navigation.refresh();
        }
        appState.userPreference.contentLocale = contentLocale;
        appState.userPreference.codeFormatterOptions = codeFormatterOptions;
        appState.userPreference.doNotFormatCodeByDefault = doNotFormatCodeByDefault;
        appState.userPreference.defaultCodeLanguage = defaultCodeLanguage;
        appState.userPreference.defaultCompileAndRunOptions = defaultCompileAndRunOptions;
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
      <Header className={style.sectionHeader} size="large" content={_(".locale.header")} />
      <Header className={style.header} size="tiny" content={_(".locale.system")} />
      <Select
        className={style.notFullWidth + " " + style.localeSelect}
        fluid
        value={systemLocale || "DEFAULT"}
        onChange={(e, { value }) => setSystemLocale((value === "DEFAULT" ? null : value) as Locale)}
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
        onChange={(e, { value }) => setContentLocale((value === "DEFAULT" ? null : value) as Locale)}
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
      <Header className={style.sectionHeader} size="large" content={_(".code_language.header")} />
      <Form className={style.notFullWidth}>
        <CodeLanguageAndOptions
          headerForLanguage={_(".code_language.language")}
          classNameForCompileAndRunOptions={style.halfWidthFieldContainer}
          language={defaultCodeLanguage}
          compileAndRunOptions={defaultCompileAndRunOptions}
          onUpdateLanguage={setDefaultCodeLanguage}
          onUpdateCompileAndRunOptions={setDefaultCompileAndRunOptions}
        />
      </Form>
      <div className={style.notes}>{_(".code_language.content_notes")}</div>
      <Header className={style.sectionHeader} size="large" content={_(".code_formatter.header")} />
      <Header className={style.header} size="tiny" content={_(".code_formatter.astyle_options")} />
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
        {_(".code_formatter.notes_before")}
        <a href="http://astyle.sourceforge.net/astyle.html" target="_blank">
          &nbsp;{_(".code_formatter.notes_link")}&nbsp;
        </a>
        {_(".code_formatter.notes_after")}
      </div>
      <Checkbox
        className={style.checkbox}
        checked={!doNotFormatCodeByDefault}
        label={_(".code_formatter.format_code_by_default")}
        onChange={(e, { checked }) => !pending && setDoNotFormatCodeByDefault(!checked)}
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
        code={formattedPreviewResult}
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
