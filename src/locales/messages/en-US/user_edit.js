return {
  menu: {
    profile: "Profile",
    preference: "Preference",
    security: "Security",
    privilege: "Privileges",
    audit: "Audit log"
  },
  back_to_profile: "Back to profile",
  back_to_profile_of_user: "Bask to the user's profile",
  admin_warning: "You're viewing and editing another user with your privilege.",
  errors: {
    PERMISSION_DENIED: "Permission denied.",
    NO_SUCH_USER: "No such user.",
    DUPLICATE_USERNAME: "Username already taken.",
    DUPLICATE_EMAIL: "Email already used.",
    FAILED: "Unknown error.",
    FAILED_TO_SEND: "Failed to send mail: {errorMessage}",
    RATE_LIMITED: "Your operations are too frequent. Please try again later."
  },
  profile: {
    title: "Profile",
    avatar: {
      header: "Avatar",
      gravatar: {
        name: "Gravatar"
      },
      qq: {
        name: "QQ avatar",
        placeholder: "QQ number"
      },
      github: {
        name: "GitHub avatar",
        placeholder: "GitHub username"
      },
      error: "Failed to load your avatar. Please check your internet connection and account name above."
    },
    username: "Username",
    username_notes: "You can't change your username.",
    username_notes_admin: "You have the privilege to change the username.",
    email: "Email",
    public_email: "Make my Email public",
    email_notes: "Goto the Security pane for changing Email.",
    email_notes_admin: "You have the privilege to change the Email.",
    nickname: "Nickname",
    bio: "Bio",
    bio_placeholder: "Write something about you or sentences you love.",
    organization: "Organization",
    organization_placeholder: "Your school, company or virtual organization.",
    location: "Location",
    location_placeholder: "Your physical location.",
    url: "URL",
    url_placeholder: "Your personal page or blog.",
    qq: "QQ",
    qq_placeholder: "e.g. 12345678",
    qq_notes: "Your QQ link is: ",
    telegram: "Telegram",
    telegram_placeholder: "Not including '@'",
    telegram_notes: "Your Telegram link is: ",
    github: "GitHub",
    github_placeholder: "Not including '@'",
    github_notes: "Your GitHub link is: ",
    submit: "Submit",
    error_invalid_username: "Invalid username.",
    error_invalid_email: "Invalid email address.",
    error_invalid_url: "Invalid URL.",
    success: "Profile updated successfully."
  },
  preference: {
    title: "Preference",
    locale: {
      header: "Language",
      system: "Preferred system language",
      system_default: "Browser default",
      system_default_name: "Browser default ({name})",
      system_notes:
        "Changing language in the page footer only affects your local browser. Changing here will affect your account's logins everywhere.",
      content: "Preferred content language",
      content_default: "Same as system language",
      content_default_name: "Same as system language ({name})",
      content_notes:
        "If the selected language is not available for some contents, we'll display the default language versions of them.",
      hide_unavailable_message: 'Hide "this content is not available in your preferred language" message'
    },
    appearance: {
      header: "Appearance",
      theme: "Theme",
      themes: {
        auto: {
          name: "Auto",
          description: "Use light (PURE) or dark (FAR) theme based on browser or system preference"
        },
        pure: {
          name: "PURE",
          description: "Light theme"
        },
        far: {
          name: "FAR",
          description: "Dark theme"
        }
      },
      content_font_face: "Content Font",
      system_default_sans_serif: "sans-serif (browser default)",
      system_default_serif: "serif (browser default)",
      content_preview: "Preview",
      code_font_face: "Code Font",
      system_default: "monospace (browser default)",
      code_font_size: "Code Font Size",
      code_line_height: "Code Line Height",
      code_font_ligatures: "Enable Ligatures",
      code_font_ligatures_notes:
        "Ligatures could display some combining symbols in a more readable form. Only several fonts support this feature.",
      code_preview: "Preview",
      markdown_editor_font: {
        markdown_editor: "Markdown Editor",
        content_font: "Content Font",
        code_font: "Code Font"
      }
    },
    code_language: {
      header: "Programming Language",
      language: "Default language",
      content_notes: "Setting default language options here will affect the defaults on submitting problems."
    },
    code_formatter: {
      header: "Code Formatter",
      astyle_options: "Astyle options",
      format_code_by_default: "Format code by default",
      notes_before: "The options apply to formatting code on submission page. Please refer to",
      notes_link: "Astyle documentation",
      notes_after: "for help.",
      preview: "Preview",
      error: "Invalid options"
    },
    submit: "Submit",
    success: "Preference updated successfully."
  },
  security: {
    title: "Security",
    password: {
      header: "Change password",
      old: "Old password",
      new: "New password",
      retype: "Retype password",
      invalid_password: "Invalid password.",
      empty_new_password: "Password can't be empty.",
      empty_retype_password: "Retype password can't be empty",
      wrong_old_password: "Wrong old password.",
      passwords_do_not_match: "Passwords mismatch.",
      success: "Password changed successfully.",
      submit: "Submit"
    },
    email: {
      header: "Change email",
      email: "Email",
      invalid_email: "Invalid email address.",
      duplicate_email: "This email address has already been occupied.",
      email_verification_code: "Email verification code",
      send_email_verification_code: "Send",
      verification_code_sent: "Email verification code sent.",
      invalid_email_verification_code: "Invalid email verification code",
      success: "Email changed successfully.",
      submit: "Submit"
    },
    sessions: {
      header: "Sessions",
      revoke_all: "Logout all",
      confirm_revoke_all: "Confirm logout all",
      success_revoke_all: "Successfully logged out all sessions of this user.",
      success_revoke_all_current_user: "Successfully logged out all your other sessions.",
      current: "Current session",
      last_active: "Last seen {time}",
      revoke: "Logout",
      confirm_revoke: "Confirm logout",
      success_revoke: "Successfully logged out the session.",
      login_ip: "Logged-in on {ip}   ·   ",
      login_ip_location: "Logged-in on {ip}   ·   ", // Currently we don't support IP location in other languages
      no_sessions: "This user has no sessions",
      unknown_os_browser: "Unknown browser and OS",
      notes_current_user:
        'All logged-in sessions of your account are above. If you see a session used by others, logout it and change your password immediately.\nChanging your password in "Reset your password" page will logout ALL your sessions automatically.'
    }
  },
  privilege: {
    title: "Privileges",
    header: "Privileges",
    privileges: {
      EditHomepage: {
        name: "Edit Homepage",
        notes: "Modify the configuration and contents of homepage. e.g. notice and annnouncements."
      },
      ManageUser: {
        name: "Manage user",
        notes: "Modify other user's profile, preference and security settings."
      },
      ManageUserGroup: {
        name: "Manage user group",
        notes: "Create, edit and delete user groups. Manage user groups' members."
      },
      ManageProblem: {
        name: "Manage problem",
        notes: "View, edit all problems and submissions, manage problems' permissions and delete problems."
      },
      ManageContest: {
        name: "Manage contest",
        notes: "Placeholder."
      },
      ManageDiscussion: {
        name: "Manage discussion",
        notes:
          "View, edit all discussions and replies, manage discussions' permissions and delete discussions or replies."
      },
      SkipRecaptcha: {
        name: "Skip reCAPTCHA",
        notes: "Submit any requests without verifying reCAPTCHA (if enabled). Useful for robots and virtual judge."
      }
    },
    admin_only: "Only admins can change user's privileges.",
    submit: "Submit",
    success: "Privileges updated successfully"
  },
  audit: {
    title: "Audit log",
    header: "Audit log",
    query: {
      action_query: "Action",
      ip: "IP Address",
      first_object_id: "Object 1",
      second_object_id: "Object 2",
      filter: "Filter"
    },
    no_audit_log: "No audit log",
    no_matched_audit_log: "No matched audit log",
    copy_details: "Copy details",
    goback: "Go back"
  }
};
