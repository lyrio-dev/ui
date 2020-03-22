import React, { useState } from "react";
import { Form, Header, Checkbox, TextArea, Button, Select, Flag } from "semantic-ui-react";
import { observer } from "mobx-react";
import { useNavigation } from "react-navi";

import style from "./UserEdit.module.less";

import { UserApi } from "@/api";
import { appState, browserDefaultLocale } from "@/appState";
import toast from "@/utils/toast";
import { useIntlMessage } from "@/utils/hooks";
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

export async function fetchData(userId: number) {
  const { requestError, response } = await UserApi.getUserPreference({ userId });
  if (requestError || response.error) {
    toast.error(requestError || response.error);
    return null;
  }

  await CodeFormatter.ready;

  return response;
}

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
      Object.assign({}, defaultCodeLanguageOptions, {
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

export const View = observer(PreferenceView);
