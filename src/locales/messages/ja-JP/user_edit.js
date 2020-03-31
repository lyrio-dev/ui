module.exports = {
  menu: {
    profile: "プロファイル",
    preference: "環境設定",
    security: "セキュリティ"
  },
  back_to_profile: "ユーザページに戻る",
  back_to_profile_of_user: "このユーザのプロファイルに戻る",
  admin_warning: "管理者権限で他のユーザのプロファイルを閲覧しています",
  error: {
    PERMISSION_DENIED: "権限がありません。",
    NO_SUCH_USER: "ユーザが存在しません。",
    DUPLICATE_USERNAME: "このユーザ名はすでに使用されています。",
    DUPLICATE_EMAIL: "このメールアドレスはすでに使用されています。"
  },
  profile: {
    title: "プロファイル設定",
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
      error: "アイコンを取得できませんでした。ユーザ名が正しいか確認してください。"
    },
    username: "ユーザ名",
    username_notes: "ユーザ名は変更できません。",
    username_notes_admin: "管理者は全員のユーザ名を変更できます。",
    email: "メールアドレス",
    public_email: "メールアドレスを公開する",
    email_notes: "セキュリティのページでメールアドレスを変更できます。",
    email_notes_admin: "管理者は全員のメールアドレスを変更できます",
    bio: "自己紹介",
    bio_placeholder: "自己紹介、お気に入りの言葉など",
    organization: "所属",
    organization_placeholder: "学校、会社など",
    location: "場所",
    location_placeholder: "国や地域",
    url: "ウェブページ",
    url_placeholder: "あなたのブログ、ホームページなど",
    qq: "QQ",
    qq_placeholder: "例：12345678",
    qq_notes: "あなたの QQ リンクは：",
    telegram: "Telegram",
    telegram_placeholder: " @ を含めない",
    telegram_notes: "あなたの Telegram リンクは：",
    github: "GitHub",
    github_placeholder: " @ を含めない",
    github_notes: "あなたの GitHub リンクは：",
    submit: "保存",
    error_invalid_url: "無効なURLです。",
    success: "保存に成功しました。"
  },
  preference: {
    title: "環境設定",
    locale: {
      header: "言語",
      system: "言語設定",
      system_default: "ブラウザのデフォルト（{name}）",
      system_notes:
        "フッターで言語を選択すると現在のブラウザにだけ適用されます。ここでの設定はアカウントに適用されます。",
      content: "問題文の言語",
      content_default: "システムのデフォルト（{name}）",
      content_notes: "選択した言語の問題文がない場合は、問題のデフォルト言語で表示します"
    },
    code_language: {
      header: "プログラミング言語",
      language: "プログラミング言語",
      content_notes: "提出言語のデフォルト設定。"
    },
    code_formatter: {
      header: "コードフォーマット",
      astyle_options: "Astyle オプション",
      format_code_by_default: "デフォルトでコードをフォーマットして表示",
      notes_before: "提出ページのコードのフォーマットに使用します。",
      notes_link: "Astyle のリファレンス",
      notes_after: "を参照してください",
      preview: "プレビュー",
      error: "オプションが間違っています"
    },
    submit: "保存",
    success: "保存に成功しました。"
  },
  security: {
    title: "セキュリティ設定",
    password: {
      header: "パスワード変更",
      old: "現在のパスワード",
      new: "新しいパスワード",
      retype: "新しいパスワードを再入力",
      invalid_password: "無効なパスワードです。",
      empty_new_password: "新しいパスワードを入力してください。",
      empty_retype_password: "新しいパスワードを再入力してください。",
      wrong_old_password: "現在のパスワードが違います。",
      passwords_do_not_match: "パスワードが一致しません。",
      success: "パスワード変更に成功しました。",
      submit: "変更"
    },
    email: {
      header: "メールアドレス変更",
      email: "メールアドレス",
      invalid_email: "無効なメールアドレスです。",
      duplicate_email: "このメールアドレスはすでに使用されています。",
      success: "メールアドレス変更に成功しました。",
      submit: "変更"
    }
  }
};
