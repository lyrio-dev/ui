module.exports = {
  title: "Judge Settings",
  header: "Judge Settings",
  back_to_problem: "Back",
  confirm_back_to_problem: "Discard Changes and Back",
  submit: "Submit",
  no_submit_permission: "No Permission",
  submit_success: "Successfully submitted.",
  error: {
    NO_SUCH_PROBLEM: "No such problem.",
    PERMISSION_DENIED: "Permission denied.",
    INVALID_JUDGE_INFO: {
      INVALID_TIME_LIMIT_TASK: "Invalid time limit.",
      TIME_LIMIT_TOO_LARGE_TASK: "The time {3} ms is too large, please contact the admin.",
      INVALID_TIME_LIMIT_SUBTASK: "The time limit of subtask {1} is invalid.",
      TIME_LIMIT_TOO_LARGE_SUBTASK: "The time limit {3} ms of subtask {1} is too large, please contact the admin.",
      INVALID_TIME_LIMIT_TESTCASE: "The time limit of subtask {1}'s testcase {2} is invalid.",
      TIME_LIMIT_TOO_LARGE_TESTCASE:
        "The time limit {3} ms of subtask {1}'s testcase {2} is too large, please contact the admin.",
      INVALID_MEMORY_LIMIT_TASK: "Invalid memory limit.",
      MEMORY_LIMIT_TOO_LARGE_TASK: "The memory {3} MiB is too large, please contact the admin.",
      INVALID_MEMORY_LIMIT_SUBTASK: "The memory limit of subtask {1} is invalid.",
      MEMORY_LIMIT_TOO_LARGE_SUBTASK: "The memory limit {3} MiB of subtask {1} is too large, please contact the admin.",
      INVALID_MEMORY_LIMIT_TESTCASE: "The memory limit of subtask {1}'s testcase {2} is invalid.",
      MEMORY_LIMIT_TOO_LARGE_TESTCASE:
        "The memory limit {3} MiB of subtask {1}'s testcase {2} is too large, please contact the admin.",
      INVALID_FILEIO_FILENAME: "The input or output filename {1} is invalid.",
      NO_TESTCASES: "No testcases.",
      SUBTASK_HAS_NO_TESTCASES: "Subtask {1} has no testcases.",
      INVALID_SCORING_TYPE: "Unknown error.",
      INVALID_POINTS_SUBTASK: "Subtask {1}'s percentage points {2} is invalid.",
      INVALID_POINTS_TESTCASE: "Subtask {1}'s testcase {2}'s percentage points {2} is invalid.",
      POINTS_SUM_UP_TO_LARGER_THAN_100_SUBTASKS:
        "The sum of all subtasks' points is {1}, exceeding the full points 100.",
      POINTS_SUM_UP_TO_LARGER_THAN_100_TESTCASES:
        "The sum of subtask {1}'s all testcases' points is {2}, exceeding the full points 100.",
      INVALID_DEPENDENCY: "Subtask {1}'s dependency subtask ID {2} is invalid",
      NO_SUCH_INPUT_FILE: "Input file {3} referenced by subtask {1}'s testcase {2} doesn't exist.",
      NO_SUCH_OUTPUT_FILE: "Output file {3} referenced by subtask {1}'s testcase {2} doesn't exist.",
      INVALID_CHECKER_TYPE: "Unknown error.",
      INVALID_CHECKER_OPTIONS: "Unknown error.",
      INVALID_CHECKER_INTERFACE: "Unknown error.",
      INVALID_CHECKER_LANGUAGE: "Unknown error.",
      NO_SUCH_CHECKER_FILE: "The checker file {1} doesn't exist.",
      INVALID_CHECKER_LANGUAGE_OPTIONS: "Unknown error.",
      INVALID_EXTRA_SOURCE_FILES: "Unknown error.",
      INVALID_EXTRA_SOURCE_FILES_LANGUAGE: "Unknown error.",
      INVALID_EXTRA_SOURCE_FILES_DST: "Extra source files {3}'s destination filename is invalid.",
      NO_SUCH_EXTRA_SOURCE_FILES_SRC: "Extra source files {3} doesn't exist.",
      CYCLICAL_SUBTASK_DEPENDENCY: "Cyclical subtask dependency."
    }
  },
  edit_raw: {
    edit_raw: "Edit Raw",
    parse_error: "YAML Parsing Error",
    cancel: "Cancel",
    ok: "OK"
  },
  problem_type: "Problem type",
  problem_types: {
    TRADITIONAL: "Traditional"
  },
  switch: "Switch",
  meta: {
    time_limit: "Time limit",
    memory_limit: "Memory limit",
    input_file: "Input file",
    output_file: "Output file",
    use_standard_io: "Use standard IO",
    run_samples: "Run samples when judging"
  },
  checker: {
    checker: "Checker",
    types: {
      integers: "Integers",
      floats: "Floats",
      lines: "Lines",
      binary: "Binary",
      custom: "Custom"
    },
    config: {
      floats: {
        precision: "Precision",
        description:
          "The participant's answer is considered correct if its absolute or relative error to the jury's answer is less than {value}."
      },
      lines: {
        case_sensitive: "Case Sensitive",
        description: "The blank characters in the end of each line and empty lines in the end of file are ignored."
      },
      custom: {
        interface: "Interface",
        interfaces: {
          testlib: "Testlib",
          legacy: "Old SYZOJ",
          lemon: "Lemon",
          hustoj: "HustOJ",
          qduoj: "QDUOJ",
          domjudge: "DOMjudge"
        },
        language: "Language",
        filename: "File",
        filename_no_file: "No file"
      }
    }
  },
  subtasks: {
    auto_testcases:
      "Detect testcases from testdata files (Match <code>.in</code> and <code>.out</code> files automatically)",
    cannot_detect_testcases_from_testdata: "Cannot detect testcases from testdata",
    subtask: "Subtask",
    single_subtask: "Single Subtask",
    subtask_testcases_count: "{count} Cases",
    subtask_type: {
      Sum: "Sum of score of each testcase",
      GroupMin: "Minimal score in each testcase",
      GroupMul: "Product of percentage score of each testcase"
    },
    subtask_options: {
      sort: "Sort",
      move_up: "Move up",
      move_down: "Move down",
      add_before: "Add subtask before this",
      add_after: "Add subtask after this",
      add_testcase: "Add testcase",
      delete: "Delete",
      confirm_delete: "Confirm delete"
    },
    auto_add_testcases: {
      auto_add_testcases: "Add testcases automatically",
      subtask: "Subtask",
      help:
        "Enter the regexes to match the filenames. Use capturing groups for the common parts of input/output filenames.\nIf two filenames are matched respectively by the input/output regexes and their capturing groups' text are equal, they become a testcase.",
      input_file: "Input File",
      output_file: "Output File",
      can_not_compile_for_input: "Couldn't compile your regex for input file: {message}",
      can_not_compile_for_output: "Couldn't compile your regex for output file: {message}",
      no_capturing_groups:
        "No capturing groups. You need to add capturing groups to the regexes to help us associate the input/output files.",
      capturing_groups_do_not_match:
        "The number of capturing groups doesn't match. There're {countInInputFilename} in the regex for input file while {countInOutputFilename} in the regex for output file.",
      empty_regex: "Enter regexes to match the filenames.",
      matches_count: "{count} testcases matched.",
      column_input_file: "Input file",
      column_output_file: "Output file",
      close: "Close",
      append: "Append testcases",
      replace: "Replace subtask",
      confirm_replace: "Confirm replace"
    },
    expand_testcases: "Expand testcases",
    hide_testcases: "Hide testcases",
    no_testcases: "No testcases",
    testcase: {
      input_file: "Input file",
      output_file: "Output file"
    },
    testcase_add: {
      before: "Before this testcase",
      after: "After this testcase"
    },
    testcase_options: {
      move_up: "Move up",
      move_down: "Move down",
      delete: "Delete",
      confirm_delete: "Confirm delete"
    },
    dependencies: "Subtasks dependent by this subtask"
  },
  file_selector: {
    no_matching_files: "No matching files.",
    file_not_found_warning: "File not found."
  },
  extra_source_files: {
    option: "Add extra source files when compiling",
    title: "Extra source files",
    src: "Source",
    dst: "Destination",
    delete: "Delete",
    confirm_delete: "Confirm delete"
  }
};
