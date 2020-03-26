module.exports = {
  title: "ジャッジ設定",
  header: "ジャッジ設定",
  back_to_problem: "戻る",
  confirm_back_to_problem: "諦めて戻る",
  submit: "確認する",
  no_submit_permission: "パーミッションは足りない",
  submit_success: "成功で確認しました。",
  submit_error: {
    NO_SUCH_PROBLEM: "この問題は存在しません。",
    PERMISSION_DENIED: "パーミッションは足りない。"
  },
  edit_raw: {
    edit_raw: "コードをエディットする",
    parse_error: "YAML パースは失敗しました",
    cancel: "キャンセル",
    ok: "確認"
  },
  problem_type: "問題のタイプ",
  problem_types: {
    TRADITIONAL: "伝統"
  },
  switch: "スイッチする",
  time_limit: "時間制限",
  memory_limit: "メモリー制限",
  input_file: "入力ファイル",
  output_file: "出力ファイル",
  use_standard_io: "標準入力出力を使用する",
  standard_input: "標準入力",
  standard_output: "標準出力",
  run_samples: "入力出力例はジャッジしますか",
  subtask: "サブタスク",
  single_subtask: "シングルサブタスク",
  subtask_testcases_count: "サブタスク {count} ",
  subtask_type: {
    Sum: "各得点は足す",
    GroupMin: "各得点に最小の得点",
    GroupMul: "各得点は百分率で掛ける"
  },
  subtask_options: {
    sort: "並べ替える",
    move_up: "上に移る",
    move_down: "下に移る",
    add_before: "前にサブタスクを追加する",
    add_after: "後にサブタスクを追加する",
    add_testcase: "テスト点を追加する",
    delete: "削除する",
    confirm_delete: "削除を確認する"
  },
  auto_add_testcases: {
    auto_add_testcases: "オートにテスト点は追加する",
    subtask: "サブタスク",
    help:
      "正規表現を入力してテスト点は追加する",
    input_file: "入力ファイル",
    output_file: "出力ファイル",
    can_not_compile_for_input: "入力ファイルの正規表現はコンパイルできません：{message}",
    can_not_compile_for_output: "出力ファイルの正規表現はコンパイルできません：{message}",
    no_capturing_groups: "キャプチャグループは存在しません。正規表現の中は使って入力ファイルと出力ファイルをリンクする。",
    capturing_groups_do_not_match:
      "キャプチャグループ数は同じではありません，入力ファイルは {countInInputFilename} つである，出力ファイルは {countInOutputFilename} つです。",
    empty_regex: "正規表現を入力してください。",
    matches_count: "共にテスト点は {count} つ見つけました。",
    column_input_file: "入力ファイル",
    column_output_file: "出力ファイル",
    close: "クローズ",
    append: "テスト点は追加する",
    replace: "サブタスクは変更する",
    confirm_replace: "変更は確認する"
  },
  expand_testcases: "テスト点をディスプレイする",
  hide_testcases: "テスト点を隠す",
  no_testcases: "テスト点はまだない",
  testcase: {
    input_file: "入力ファイル",
    output_file: "出力ファイル"
  },
  testcase_add: {
    before: "このテスト点の前",
    after: "このテスト点の後"
  },
  testcase_options: {
    move_up: "上に移る",
    move_down: "下に移る",
    delete: "削除する",
    confirm_delete: "削除を確認する"
  },
  dependencies: "サブタスクに依存する"
};
