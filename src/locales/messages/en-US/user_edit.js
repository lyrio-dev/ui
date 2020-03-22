module.exports = {
  title: {
    profile: "Edit profile",
    preference: "Preference",
    security: "Security settings"
  },
  menu: {
    profile: "Profile",
    preference: "Preference",
    security: "Security"
  },
  back_to_profile: "Back to profile",
  error: {
    PERMISSION_DENIED: "Permission denied.",
    NO_SUCH_USER: "No such user.",
    DUPLICATE_USERNAME: "Username already taken.",
    DUPLICATE_EMAIL: "Email already used."
  },
  profile: {
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
    error_invalid_url: "Invalid URL.",
    success: "Profile updated successfully."
  },
  preference: {
    locale: {
      header: "Language",
      system: "Preferred system language",
      system_default: "Browser default ({name})",
      system_notes:
        "Changing language in the page footer only affects your local browser. Changing here will affect your account's logins everywhere.",
      content: "Preferred content language",
      content_default: "Same as system language ({name})",
      content_notes:
        "If the selected language is not available for some contents, we'll display the default language versions of them."
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
      success: "Email changed successfully.",
      submit: "Submit"
    }
  }
};
