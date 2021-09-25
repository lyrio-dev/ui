module.exports = {
  title: "Problem",
  meta_labels: {
    non_public: "Private",
    no_display_id: "No ID"
  },
  fileio: {
    fileio: "File IO",
    input: "Input",
    output: "Output"
  },
  show_tags: "Show Tags",
  hide_tags: "Hide Tags",
  type: {
    Traditional: "Traditional",
    Interaction: "Interaction",
    SubmitAnswer: "Submit Answer"
  },
  statistic: {
    submissions: "Subs.",
    accepted: "AC."
  },
  action: {
    submit: "Submit",
    login_to_submit: "Login to submit",
    submission: "Submissions",
    statistics: "Statistics",
    discussion: "Discussions",
    files: "Files",
    edit: "Edit",
    judge_settings: "Judge Settings",
    permission_manage: "Permissions",
    permission_manager_description: "Problem {idString}",
    set_display_id: "Set ID",
    set_display_id_new: "New ID (empty or 0 to clear ID)",
    set_display_id_submit: "Set",
    set_public: "Make public",
    set_non_public: "Make private",
    set_public_confirm: "Confirm make public",
    set_non_public_confirm: "Confirm make private",
    delete: "Delete",
    delete_confirm_title: "Delete Problem",
    delete_confirm_content:
      "Are you sure to delete the problem? Submissions, discussions and files of the problem will also be deleted. It may take some time.",
    delete_confirm: "Confirm delete",
    delete_cancel: "Cancel",
    delete_success: "Successfully deleted."
  },
  error: {
    PERMISSION_DENIED: "Permission denied.",
    NO_SUCH_PROBLEM: "No such problem.",
    NO_DISPLAY_ID: "Please set ID first.",
    INVALID_DISPLAY_ID: "ID must be an integer.",
    PUBLIC_PROBLEM_MUST_HAVE_DISPLAY_ID: "A public problem must have an ID.",
    DUPLICATE_DISPLAY_ID: "ID {displayId} has been already used."
  },
  upload_error: "Failed to upload file: {error}",
  submit: {
    last_submission: "Last Sub.",
    back_to_statement: "Back to Statement",
    skip_samples: "Skip Samples",
    upload_files: "Upload files",
    choose_files: "Choose ...",
    selected_archive: "Selected an archive file.",
    selected_valid_files: "Selected {all} file(s). {valid} of them are valid.",
    selected_files: "Selected {all} file(s).",
    cancel_select_files: "Cancel selected files",
    clear_editor_to_use_upload_left: "To use file uploading, please ",
    clear_editor: "clear the editor's contents",
    clear_editor_to_use_upload_right: ".",
    fill_in_editor_or_upload_file: "Fill in the editor(s) with your answer or upload file(s).",
    submit: "Submit"
  },
  permission_level: {
    read: "Read Only",
    write: "Read / Write"
  },
  sample: {
    input: "Input",
    output: "Output",
    copy: "Copy",
    copied: "Copied",
    failed_to_copy: "Failed to copy"
  }
};
