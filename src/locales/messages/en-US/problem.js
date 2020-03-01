module.exports = {
  title: "Problem",
  meta_labels: {
    non_public: "Non-Public",
    no_display_id: "No ID"
  },
  show_tags: "Show Tags",
  hide_tags: "Hide Tags",
  type: {
    TRADITIONAL: "Traditional"
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
    discussion: "Discussion",
    files: "Files",
    edit: "Edit",
    judge_settings: "Judge Settings",
    permission_manage: "Permissions",
    permission_manager_description: "Problem {idString}",
    set_display_id: "Set ID",
    set_display_id_new: "New ID (empty or 0 to clear ID)",
    set_display_id_submit: "Set",
    set_public: "Make Public",
    set_non_public: "Make non-public",
    set_public_confirm: "Confirm make public",
    set_non_public_confirm: "Confirm make non-public",
    delete: "Delete"
  },
  action_error: {
    set_public: {
      PERMISSION_DENIED: "Permission denied.",
      NO_SUCH_PROBLEM: "No such problem.",
      NO_DISPLAY_ID: "Please set ID first."
    },
    set_display_id: {
      INVALID_DISPLAY_ID: "ID must be an integer.",
      PERMISSION_DENIED: "Permission denied.",
      NO_SUCH_PROBLEM: "Current problem doesn't exist.",
      PUBLIC_PROBLEM_MUST_HAVE_DISPLAY_ID: "A public problem must have an ID.",
      DUPLICATE_DISPLAY_ID: "ID {displayId} has already used."
    },
    get_permissions: {
      PERMISSION_DENIED: "Permission denied.",
      NO_SUCH_PROBLEM: "No such problem."
    },
    set_permissions: {
      NO_SUCH_PROBLEM: "No such problem."
    },
    submit: {
      PERMISSION_DENIED: "Permission denied.",
      NO_SUCH_PROBLEM: "No such problem."
    }
  },
  submit: {
    back_to_statement: "Back to Statement",
    language: "Langauge",
    skip_samples: "Skip Samples",
    submit: "Submit"
  },
  permission_level: {
    read: "Read Only",
    write: "Read/Write"
  },
  sample: {
    input: "Input",
    output: "Output",
    copy: "Copy",
    copied: "Copied",
    failed_to_copy: "Failed to copy"
  }
};
