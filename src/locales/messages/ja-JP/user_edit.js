module.exports = {
  menu: {
    profile: "プロファイル",
    preference: "環境設定",
    security: "セキュリティ",
    privilege: "[TBT] Privileges"
  },
  back_to_profile: "ユーザページに戻る",
  back_to_profile_of_user: "このユーザのプロファイルに戻る",
  admin_warning: "管理者権限で他のユーザのプロファイルを閲覧しています",
  errors: {
    PERMISSION_DENIED: "権限がありません。",
    NO_SUCH_USER: "ユーザが存在しません。",
    DUPLICATE_USERNAME: "このユーザ名はすでに使用されています。",
    DUPLICATE_EMAIL: "このメールアドレスはすでに使用されています。",
    FAILED: "[TBT] Unknown error.",
    FAILED_TO_SEND: "[TBT] Failed to send mail: {errorMessage}",
    RATE_LIMITED: "[TBT] Your operations are too frequent. Please try again later."
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
    error_invalid_url: "無効な URL です。",
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
      email_verification_code: "[TBT] Email verification code",
      send_email_verification_code: "[TBT] Send",
      verification_code_sent: "[TBT] Email verification code sent.",
      invalid_email_verification_code: "[TBT] Invalid email verification code",
      success: "メールアドレス変更に成功しました。",
      submit: "変更"
    },
    sessions: {
      header: "[TBT] Sessions",
      revoke_all: "[TBT] Logout all",
      confirm_revoke_all: "[TBT] Confirm logout all",
      success_revoke_all: "[TBT] Successfully logged out all sessions of this user.",
      success_revoke_all_current_user: "[TBT] Successfully logged out all your other sessions.",
      current: "[TBT] Current session",
      last_active: "[TBT] Last seen {time}",
      revoke: "[TBT] Logout",
      confirm_revoke: "[TBT] Confirm logout",
      success_revoke: "[TBT] Successfully logged out the session.",
      login_ip: "[TBT] Logged-in on {ip}   ·   ",
      login_ip_location: "[TBT] Logged-in on {ip}   ·   ", // Currently we don't support IP location in other languages
      no_sessions: "[TBT] This user has no sessions",
      unknown_os_browser: "[TBT] Unknown browser and OS",
      notes_current_user:
        '[TBT] All logged-in sessions of your account are above. If you see a session used by others, logout it and change your password immediately.\nChanging your password in "Reset your password" page will logout ALL your sessions automatically.'
    }
  },
  privilege: {
    // NOTE: "Privilege" is NOT "Permission"
    // "Permission" is granted easily to anyone by a manager/admin or problem's owner to view or edit a problem
    // "Privilege" is granted to a managers by the admin to take control of a part of the app.
    title: "[TBT] Privileges",
    header: "[TBT] Privileges",
    privileges: {
      MANAGE_USER: {
        name: "[TBT] Manage user",
        notes: "[TBT] Modify other user's profile, preference and security settings."
      },
      MANAGE_USER_GROUP: {
        name: "[TBT] Manage user group",
        notes: "[TBT] Create, edit and delete user groups. Manage user groups' members."
      },
      MANAGE_PROBLEM: {
        name: "[TBT] Manage problem",
        notes: "[TBT] View, edit all problems and submissions, set problem public or not and delete problems."
      },
      MANAGE_CONTEST: {
        name: "[TBT] Manage contest",
        notes: "[TBT] Placeholder."
      },
      MANAGE_DISCUSSION: {
        name: "[TBT] Manage discussion",
        notes: "[TBT] Placeholder."
      }
    },
    admin_only: "[TBT] Only admins can change user's privileges.",
    submit: "[TBT] Submit",
    success: "[TBT] Privileges updated successfully"
  }
};
