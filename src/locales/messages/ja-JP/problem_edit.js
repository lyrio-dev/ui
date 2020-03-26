module.exports = {
  title_edit: "問題編集",
  title_new: "新規作成",
  header_edit: "問題を編集する {idString}",
  header_new: "题目を新規作成",
  back_to_problem: "戻る",
  confirm_back_to_problem: "諦めて戻る",
  submit: "アプロード",
  no_submit_permission: "パーミッションは足りない",
  submit_success: "成功でアプロードしました。",
  submit_error: {
    create: {
      FAILED: "失敗しました。",
      PERMISSION_DENIED: "パーミッションは足りない。"
    },
    update: {
      FAILED: "失敗しました。",
      NO_SUCH_PROBLEM: "この問題はない。",
      PERMISSION_DENIED: "パーミッションは足りない。"
    }
  },
  header_samples: "入力出力例",
  header_tags: "タッグ",
  tags_placeholder: "タッグを検索する …",
  no_addable_tags: "制限を満すタッグは存在しません。",
  content_editor: {
    title: "タイトル",
    preview_all: "プレビュー",
    default: "デフォルト言語を設置します",
    confirm_apply_template: "テンプレートの使用を確認する",
    confirm_delete: "言語の削除を確認する",
    section_title: "セクションのタイトル",
    preview: "プレビュー",
    add_section: {
      before_this_section: "セクションの前",
      after_this_section: "セクションの後"
    },
    section_content: "セクションの内容",
    new_sample: "例を追加します",
    sample_input: "入力例",
    sample_output: "出力例",
    sample_explanation: "例の解釈",
    section_options: {
      move_up: "上に移る",
      move_down: "下に移る",
      delete: "削除",
      confirm_delete: "削除を確認する"
    },
    section_type: {
      text: "テキスト",
      sample: "例"
    }
  },
  sample_editor: {
    add_sample_when_empty: "样例を追加する",
    sample_id: "例の番号",
    warning: {
      not_referenced: "言語「{language}」で参照されない",
      multiple_references: "言語「{language}」で {referenceCount} 回参照される"
    },
    add_sample: {
      before_this_sample: "例の前に位置する",
      after_this_sample: "例の后に位置する"
    },
    options: {
      move_up: "上に移る",
      move_down: "下に移る",
      delete: "削除",
      confirm_delete: "削除を確認する"
    }
  }
};
