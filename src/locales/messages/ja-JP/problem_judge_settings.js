module.exports = {
  title: "ジャッジ設定",
  header: "ジャッジ設定",
  back_to_problem: "戻る",
  confirm_back_to_problem: "保存せず戻る",
  submit: "保存する",
  no_submit_permission: "権限がありません",
  submit_success: "保存に成功しました。",
  error: {
    NO_SUCH_PROBLEM: "問題が存在しません。",
    PERMISSION_DENIED: "権限がありません。"
  },
  edit_raw: {
    edit_raw: "コードを編集する",
    parse_error: "YAML パースに失敗しました",
    cancel: "キャンセル",
    ok: "保存"
  },
  problem_type: "問題のタイプ",
  problem_types: {
    TRADITIONAL: "Batch"
  },
  switch: "スイッチする",
  time_limit: "時間制限",
  memory_limit: "メモリ制限",
  input_file: "入力ファイル",
  output_file: "出力ファイル",
  use_standard_io: "標準入出力を使用する",
  standard_input: "標準入力",
  standard_output: "標準出力",
  run_samples: "入出力例をジャッジする",
  subtask: "サブタスク",
  single_subtask: "シングルサブタスク",
  subtask_testcases_count: "{count}",
  subtask_type: {
    Sum: "各得点の合計",
    GroupMin: "各得点の最小",
    GroupMul: "各得点に百分率を掛ける"
  },
  subtask_options: {
    sort: "並べ替える",
    move_up: "上に移動",
    move_down: "下に移動",
    add_before: "前に追加",
    add_after: "後に追加",
    add_testcase: "テストケースを追加",
    delete: "削除",
    confirm_delete: "削除する"
  },
  auto_add_testcases: {
    auto_add_testcases: "自動でテストケースを追加",
    subtask: "サブタスク",
    help: "正規表現を使って入力ファイルと出力ファイルを選択し，リンクしてテストケースを追加します。",
    input_file: "入力ファイル",
    output_file: "出力ファイル",
    can_not_compile_for_input: "入力ファイルの正規表現はコンパイルできません：{message}",
    can_not_compile_for_output: "出力ファイルの正規表現はコンパイルできません：{message}",
    no_capturing_groups:
      "ファイルが選択されていません。正規表現を使って入力ファイルと出力ファイルをリンクしてください。",
    capturing_groups_do_not_match:
      "選択されたファイルの数が違います。入力が {countInInputFilename} 個で，出力が {countInOutputFilename} 個選択されています。",
    empty_regex: "正規表現を入力してください。",
    matches_count: "{count}　個見つかりました。",
    column_input_file: "入力ファイル",
    column_output_file: "出力ファイル",
    close: "閉じる",
    append: "テストケースを追加",
    replace: "サブタスクを変更",
    confirm_replace: "変更する"
  },
  expand_testcases: "テストケースを表示",
  hide_testcases: "テストケースを隠す",
  no_testcases: "テストケースはありません",
  testcase: {
    input_file: "入力ファイル",
    output_file: "出力ファイル"
  },
  testcase_add: {
    before: "前に追加",
    after: "後に追加"
  },
  testcase_options: {
    move_up: "上に移動",
    move_down: "下に移動",
    delete: "削除",
    confirm_delete: "削除する"
  },
  dependencies: "このサブタスクに依存する"
};
