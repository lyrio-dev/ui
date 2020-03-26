module.exports = {
  menu: {
    profile: "プロファイル",
    preference: "お気に入り管理",
    security: "安全"
  },
  back_to_profile: "マイプロファイルに戻る",
  back_to_profile_of_user: "このユザーのプロファイルに戻る",
  admin_warning: "受け持ちのパーミッションで他のユザーのプロファイルをブラウズと管理をしています",
  error: {
    PERMISSION_DENIED: "パーミッションは足りない。",
    NO_SUCH_USER: "このユザーは存在しない。",
    DUPLICATE_USERNAME: "このユザー名をつかうユザーはもう存在します。",
    DUPLICATE_EMAIL: "このメールアドレスを使うユザーはもう存在します。"
  },
  profile: {
    title: "プロファイル管理",
    avatar: {
      header: "アイコン設定",
      gravatar: {
        name: "Gravatar"
      },
      qq: {
        name: "QQ アイコン",
        placeholder: "QQ ID"
      },
      github: {
        name: "GitHub アイコン",
        placeholder: "GitHub ID"
      },
      error: "無効なアイコン，ユーザなが正しいか確認してください。"
    },
    username: "ユーザ名",
    username_notes: "ユザーなは変更できない。",
    username_notes_admin: "管理者は誰ものユザーなを変更できます。",
    email: "メイルアドレス",
    public_email: "メイルアドレスは掲載する",
    email_notes: "「安全」のページはメールアドレスを変更してください。",
    email_notes_admin: "管理者は誰ものメールアドレスを変更できます",
    bio: "自己紹介",
    bio_placeholder: "自己紹介、または気に入るの言葉",
    organization: "所属",
    organization_placeholder: "学校、会社など",
    location: "国",
    location_placeholder: "地域",
    url: "あなたのウェブ",
    url_placeholder: "あなたのブログ、ホームページなど。",
    qq: "QQ",
    qq_placeholder: "例：12345678",
    qq_notes: "あなたの QQ リンクは：",
    telegram: "Telegram",
    telegram_placeholder: " @ を含めない",
    telegram_notes: "あなたの Telegram リンクは：",
    github: "GitHub",
    github_placeholder: " @ を含めない",
    github_notes: "あなたの GitHub リンクは：",
    submit: "確認",
    error_invalid_url: "無効なウェブ。",
    success: "設定は成功で完了しました。"
  },
  preference: {
    title: "お気に入り管理",
    locale: {
      header: "言語",
      system: "言語設定",
      system_default: "ブラウザの同じ（{name}）",
      system_notes: "ウェブの下で言語を選択のは当前のブラウザだけに適用する，ここではこのアカウントに適用する。",
      content: "お気に入りの言語",
      content_default: "システムの同じ（{name}）",
      content_notes: "選択する言語の内容がないと、デフォルト言語で掲載します"
    },
    code_language: {
      header: "プログラミング言語",
      language: "デフォルト言語",
      content_notes: "提出のデフォルト言語。"
    },
    code_formatter: {
      header: "コード格式化",
      astyle_options: "Astyle 変数",
      format_code_by_default: "デフォルトコード格式化",
      notes_before: "ここの変数は提出ページのコード掲載に使います",
      notes_link: "Astyle ファイル",
      notes_after: "ガイド",
      preview: "プレビュー",
      error: "変数は正しくないです"
    },
    submit: "確認",
    success: "お気に入り管理は成功で完了しました。"
  },
  security: {
    title: "安全管理",
    password: {
      header: "パスウード変更",
      old: "現在のパスワード",
      new: "新しいパスワード",
      retype: "パスワードの確認",
      invalid_password: "無効なパスウード。",
      empty_new_password: "新しいパスウードは入力してください。",
      empty_retype_password: "確認のパスウードは入力してください。",
      wrong_old_password: "現在のパスウードは正しくないです。",
      passwords_do_not_match: "確認のパスウードは新しいパスウードに異なる。",
      success: "パスウード変更は成功で完了しました。",
      submit: "確認"
    },
    email: {
      header: "メール変更",
      email: "メール",
      invalid_email: "無効なメール。",
      duplicate_email: "このメールを使うユザーはもう存在しまス。",
      success: "メール変更は成功で完了しました。",
      submit: "確認"
    }
  }
};
