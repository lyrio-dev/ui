return {
  menu: {
    profile: "プロファイル",
    preference: "環境設定",
    security: "セキュリティ",
    privilege: "[TBT] Privileges",
    audit: "[TBT] Audit log"
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
    nickname: "Nickname",
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
    error_invalid_username: "[TBT] Invalid username.",
    error_invalid_email: "[TBT] Invalid email address.",
    error_invalid_url: "無効な URL です。",
    success: "保存に成功しました。"
  },
  preference: {
    title: "環境設定",
    locale: {
      header: "言語",
      system: "言語設定",
      system_default: "ブラウザのデフォルト",
      system_default_name: "ブラウザのデフォルト（{name}）",
      system_notes:
        "フッターで言語を選択すると現在のブラウザにだけ適用されます。ここでの設定はアカウントに適用されます。",
      content: "問題文の言語",
      content_default: "システムのデフォルト",
      content_default_name: "システムのデフォルト（{name}）",
      content_notes: "選択した言語の問題文がない場合は、問題のデフォルト言語で表示します",
      hide_unavailable_message: '[TBT] Hide "this content is not available in your preferred language" message'
    },
    appearance: {
      header: "[TBT] Appearance",
      theme: "[TBT] Theme",
      themes: {
        auto: {
          name: "[TBT] Auto",
          description: "[TBT] Use light (PURE) or dark (FAR) theme based on browser or system preference"
        },
        pure: {
          name: "[TBT] PURE",
          description: "[TBT] Light theme"
        },
        far: {
          name: "[TBT] FAR",
          description: "[TBT] Dark theme"
        }
      },
      content_font_face: "[TBT] Content Font",
      system_default_sans_serif: "[TBT] sans-serif (browser default)",
      system_default_serif: "[TBT] serif (browser default)",
      content_preview: "[TBT] Preview",
      code_font_face: "[TBT] Code Font",
      system_default: "[TBT] monospace (browser default)",
      code_font_size: "[TBT] Code Font Size",
      code_line_height: "[TBT] Code Line Height",
      code_font_ligatures: "[TBT] Enable Ligatures",
      code_font_ligatures_notes:
        "[TBT] Ligatures could display some combining symbols in a more readable form. Only several fonts support this feature.",
      code_preview: "[TBT] Preview",
      markdown_editor_font: {
        markdown_editor: "[TBT] Markdown Editor",
        content_font: "[TBT] Content Font",
        code_font: "[TBT] Code Font"
      }
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
      EditHomepage: {
        name: "[TBT] Edit Homepage",
        notes: "[TBT] Modify the configuration and contents of homepage. e.g. notice and annnouncements."
      },
      ManageUser: {
        name: "[TBT] Manage user",
        notes: "[TBT] Modify other user's profile, preference and security settings."
      },
      ManageUserGroup: {
        name: "[TBT] Manage user group",
        notes: "[TBT] Create, edit and delete user groups. Manage user groups' members."
      },
      ManageProblem: {
        name: "[TBT] Manage problem",
        notes: "[TBT] View, edit all problems and submissions, manage problems' permissions and delete problems."
      },
      ManageContest: {
        name: "[TBT] Manage contest",
        notes: "[TBT] Placeholder."
      },
      ManageDiscussion: {
        name: "[TBT] Manage discussion",
        notes:
          "[TBT] View, edit all discussions and replies, manage discussions' permissions and delete discussions or replies."
      },
      SkipRecaptcha: {
        name: "[TBT] Skip reCAPTCHA",
        notes:
          "[TBT] Submit any requests without verifying reCAPTCHA (if enabled). Useful for robots and virtual judge."
      }
    },
    admin_only: "[TBT] Only admins can change user's privileges.",
    submit: "[TBT] Submit",
    success: "[TBT] Privileges updated successfully"
  },
  audit: {
    title: "[TBT] Audit log",
    header: "[TBT] Audit log",
    query: {
      action_query: "[TBT] Action",
      ip: "[TBT] IP Address",
      first_object_id: "[TBT] Object 1",
      second_object_id: "[TBT] Object 2",
      filter: "[TBT] Filter"
    },
    no_audit_log: "[TBT] No audit log",
    no_matched_audit_log: "[TBT] No matched audit log",
    copy_details: "[TBT] Copy details",
    goback: "[TBT] Go back"
  }
};
