module.exports = {
  title: "問題",
  meta_labels: {
    non_public: "掲載しません",
    no_display_id: "IDはまだ与えない"
  },
  fileio: {
    fileio: "ファイル IO",
    input: "入力ファイル",
    output: "出力ファイル"
  },
  show_tags: "タッグはディスプレイする",
  hide_tags: "タッグを隠す",
  type: {
    TRADITIONAL: "伝統"
  },
  statistic: {
    submissions: "提出",
    accepted: "解決"
  },
  action: {
    submit: "提出",
    login_to_submit: "ログインして提出してください",
    submission: "提交歴史",
    statistics: "統計",
    discussion: "ディスカッション",
    files: "ファイル",
    edit: "エディット",
    judge_settings: "ジャッジ設定",
    permission_manage: "パーミッション管理",
    permission_manager_description: "問題 {idString}",
    set_display_id: "問題 IDを与える",
    set_display_id_new: "新しい ID（空またはゾロとしたら、IDは削除する）",
    set_display_id_submit: "設置",
    set_public: "掲載します",
    set_non_public: "不掲載をする",
    set_public_confirm: "掲載を確認する",
    set_non_public_confirm: "不掲載を確認する",
    delete: "削除"
  },
  action_error: {
    set_public: {
      PERMISSION_DENIED: "パーミッションは足りない。",
      NO_SUCH_PROBLEM: "問題は存在しません。",
      NO_DISPLAY_ID: "IDを設定してください。"
    },
    set_display_id: {
      INVALID_DISPLAY_ID: "IDは整数なければなりません。",
      PERMISSION_DENIED: "パーミッションは足りない。",
      NO_SUCH_PROBLEM: "問題は存在しません。",
      PUBLIC_PROBLEM_MUST_HAVE_DISPLAY_ID: "掲載する問題は IDを持たなければなりません。",
      DUPLICATE_DISPLAY_ID: "ID {displayId} をもう使っています。"
    },
    get_permissions: {
      PERMISSION_DENIED: "パーミッションは足りない。",
      NO_SUCH_PROBLEM: "この問題は存在しません。"
    },
    set_permissions: {
      NO_SUCH_PROBLEM: "この問題は存在しません。"
    },
    submit: {
      PERMISSION_DENIED: "パーミッションは足りない。",
      NO_SUCH_PROBLEM: "この問題は存在しません。"
    }
  },
  submit: {
    back_to_statement: "戻る",
    language: "言語",
    skip_samples: "例をすきっぷする",
    submit: "提出"
  },
  permission_level: {
    read: "リードオンリー",
    write: "write"
  },
  sample: {
    input: "入力",
    output: "出力",
    copy: "コピー",
    copied: "コピーは成功しました",
    failed_to_copy: "コピーは失敗しました"
  }
};
