return {
  title: "ジャッジ設定",
  header: "ジャッジ設定",
  back_to_problem: "戻る",
  confirm_back_to_problem: "保存せず戻る",
  submit: "保存する",
  no_submit_permission: "権限がありません",
  submit_success: "保存に成功しました。",
  error: {
    NO_SUCH_PROBLEM: "問題が存在しません。",
    PERMISSION_DENIED: "権限がありません。",
    PROBLEM_HAS_SUBMISSION: "[TBT] The type of a problem with submissions can't be switched.",
    INVALID_JUDGE_INFO: {
      INVALID_TIME_LIMIT_TASK: "[TBT] Invalid time limit.",
      TIME_LIMIT_TOO_LARGE_TASK: "[TBT] The time limit {3} ms is too large, please contact the admin.",
      INVALID_TIME_LIMIT_SUBTASK: "[TBT] The time limit of subtask {1} is invalid.",
      TIME_LIMIT_TOO_LARGE_SUBTASK:
        "[TBT] The time limit {3} ms of subtask {1} is too large, please contact the admin.",
      INVALID_TIME_LIMIT_TESTCASE: "[TBT] The time limit of subtask {1}'s testcase {2} is invalid.",
      TIME_LIMIT_TOO_LARGE_TESTCASE:
        "[TBT] The time limit {3} ms of subtask {1}'s testcase {2} is too large, please contact the admin.",
      INVALID_MEMORY_LIMIT_TASK: "[TBT] Invalid memory limit.",
      MEMORY_LIMIT_TOO_LARGE_TASK: "[TBT] The memory {3} MiB is too large, please contact the admin.",
      INVALID_MEMORY_LIMIT_SUBTASK: "[TBT] The memory limit of subtask {1} is invalid.",
      MEMORY_LIMIT_TOO_LARGE_SUBTASK:
        "[TBT] The memory limit {3} MiB of subtask {1} is too large, please contact the admin.",
      INVALID_MEMORY_LIMIT_TESTCASE: "[TBT] The memory limit of subtask {1}'s testcase {2} is invalid.",
      MEMORY_LIMIT_TOO_LARGE_TESTCASE:
        "[TBT] The memory limit {3} MiB of subtask {1}'s testcase {2} is too large, please contact the admin.",
      INVALID_FILEIO_FILENAME: "[TBT] The input or output filename {1} is invalid.",
      NO_TESTCASES: "[TBT] No testcases.",
      SUBTASK_HAS_NO_TESTCASES: "[TBT] Subtask {1} has no testcases.",
      INVALID_SCORING_TYPE: "[TBT] Unknown error.",
      INVALID_POINTS_SUBTASK: "[TBT] Subtask {1}'s percentage points {2} is invalid.",
      INVALID_POINTS_TESTCASE: "[TBT] Subtask {1}'s testcase {2}'s percentage points {2} is invalid.",
      POINTS_SUM_UP_TO_LARGER_THAN_100_SUBTASKS:
        "[TBT] The sum of all subtasks' points is {1}, exceeding the full points 100.",
      POINTS_SUM_UP_TO_LARGER_THAN_100_TESTCASES:
        "[TBT] The sum of subtask {1}'s all testcases' points is {2}, exceeding the full points 100.",
      INVALID_DEPENDENCY: "[TBT] Subtask {1}'s dependency subtask ID {2} is invalid",
      NO_SUCH_INPUT_FILE: "[TBT] Input file {3} referenced by subtask {1}'s testcase {2} doesn't exist.",
      NO_SUCH_OUTPUT_FILE: "[TBT] Output file {3} referenced by subtask {1}'s testcase {2} doesn't exist.",
      INVALID_CHECKER_TYPE: "[TBT] Unknown error.",
      INVALID_CHECKER_OPTIONS: "[TBT] Unknown error.",
      INVALID_CHECKER_INTERFACE: "[TBT] Unknown error.",
      INVALID_CHECKER_LANGUAGE: "[TBT] Unknown error.",
      NO_SUCH_CHECKER_FILE: "[TBT] The checker file {1} doesn't exist.",
      INVALID_CHECKER_COMPILE_AND_RUN_OPTIONS: "[TBT] Unknown error.",
      INVALID_TIME_LIMIT_CHECKER: "[TBT] Invalid time limit for checker.",
      INVALID_MEMORY_LIMIT_CHECKER: "[TBT] Invalid memory limit for checker.",
      TIME_LIMIT_TOO_LARGE_CHECKER: "[TBT] The time limit for checker {1} ms is too large, please contact the admin.",
      TIME_MEMORY_TOO_LARGE_CHECKER:
        "[TBT] The memory limit for checker {1} ms is too large, please contact the admin.",
      INVALID_INTERACTOR: "[TBT] Unknown error",
      INVALID_INTERACTOR_INTERFACE: "[TBT] Unknown error",
      INVALID_INTERACTOR_SHARED_MEMORY_SIZE: "[TBT] Unknown error",
      INVALID_INTERACTOR_COMPILE_AND_RUN_OPTIONS: "[TBT] Unknown error",
      INVALID_INTERACTOR_LANGUAGE: "[TBT] Unknown error",
      NO_SUCH_INTERACTOR_FILE: "[TBT] The interactor file {1} doesn't exist.",
      INVALID_TIME_LIMIT_INTERACTOR: "[TBT] Invalid time limit for interactor.",
      INVALID_MEMORY_LIMIT_INTERACTOR: "[TBT] Invalid time limit for interactor.",
      TIME_LIMIT_TOO_LARGE_INTERACTOR:
        "[TBT] The time limit for interactor {1} ms is too large, please contact the admin.",
      MEMORY_LIMIT_TOO_LARGE_INTERACTOR:
        "[TBT] The memory limit for interactor {1} ms is too large, please contact the admin.",
      INVALID_EXTRA_SOURCE_FILES: "[TBT] Unknown error.",
      INVALID_EXTRA_SOURCE_FILES_LANGUAGE: "[TBT] Unknown error.",
      INVALID_EXTRA_SOURCE_FILES_DST: "[TBT] Extra source files {3}'s destination filename is invalid.",
      NO_SUCH_EXTRA_SOURCE_FILES_SRC: "[TBT] Extra source files {3} doesn't exist.",
      CYCLICAL_SUBTASK_DEPENDENCY: "[TBT] Cyclical subtask dependency.",
      TOO_MANY_TESTCASES: "[TBT] Too many testcases, please contact the admin."
    }
  },
  edit_raw: {
    edit_raw: "コードを編集する",
    parse_error: "YAML パースに失敗しました",
    cancel: "キャンセル",
    confirm_cancel: "[TBT] Discard changes",
    ok: "保存"
  },
  problem_type: "問題のタイプ",
  switch_type: "スイッチする",
  submittable: "[TBT] Submittable",
  confirm_switch_type: "[TBT] Confirm switch type",
  switch_type_success: "[TBT] Successfully switched problem type.",
  meta: {
    time_limit: "時間制限",
    memory_limit: "メモリ制限",
    input_file: "入力ファイル",
    output_file: "出力ファイル",
    use_standard_io: "標準入出力を使用する",
    run_samples: "サンプルをジャッジする"
  },
  checker: {
    checker: "[TBT] Checker",
    types: {
      integers: "[TBT] Integers",
      floats: "[TBT] Floats",
      lines: "[TBT] Lines",
      binary: "[TBT] Binary",
      custom: "[TBT] Custom"
    },
    config: {
      floats: {
        precision: "[TBT] Precision",
        description:
          "[TBT] The participant's answer is considered correct if its absolute or relative error to the jury's answer is less than {value}."
      },
      lines: {
        case_sensitive: "[TBT] Case Sensitive",
        description:
          "[TBT] The blank characters in the end of each line and empty lines in the end of file are ignored."
      },
      custom: {
        interface: "[TBT] Interface",
        interfaces: {
          testlib: "[TBT] Testlib",
          legacy: "[TBT] SYZOJ 2",
          lemon: "[TBT] Lemon",
          hustoj: "[TBT] HustOJ",
          qduoj: "[TBT] QDUOJ",
          domjudge: "[TBT] DOMjudge"
        },
        filename: "[TBT] File",
        filename_no_file: "[TBT] No file"
      }
    }
  },
  interactor: {
    interactor: "[TBT] Interactor",
    interfaces: {
      stdio: "[TBT] Standard Input/Output",
      shm: "[TBT] Shared Memory"
    },
    shm_size: "[TBT] Shared Memory Size",
    filename: "[TBT] File",
    filename_no_file: "[TBT] No file"
  },
  subtasks: {
    auto_testcases:
      "[TBT] Detect testcases from testdata files (Match <code>.in</code> and <code>.out</code> files automatically)",
    auto_testcases_no_output: "[TBT] Detect testcases from testdata files (Match <code>.in</code> files automatically)",
    cannot_detect_testcases_from_testdata: "[TBT] Cannot detect testcases from testdata",
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
      help_no_output:
        "[TBT] Enter the regexes to match the filenames. Each matched file will become a testcase's input file.",
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
      output_file: "出力ファイル",
      output_file_not_needed: "[TBT] Output file is not needed"
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
  },
  file_selector: {
    no_matching_files: "[TBT] No matching files.",
    file_not_found_warning: "[TBT] File not found."
  },
  extra_source_files: {
    option: "[TBT] Add extra source files when compiling",
    title: "[TBT] Extra source files",
    src: "[TBT] Source",
    dst: "[TBT] Destination",
    delete: "[TBT] Delete",
    confirm_delete: "[TBT] Confirm delete"
  }
};
