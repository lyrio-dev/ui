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
    PERMISSION_DENIED: "Permission denied."
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
  time_limit: "Time limit",
  memory_limit: "Memory limit",
  input_file: "Input file",
  output_file: "Output file",
  use_standard_io: "Use standard IO",
  standard_input: "Standard input",
  standard_output: "Standard output",
  run_samples: "Run samples when judging",
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
};
