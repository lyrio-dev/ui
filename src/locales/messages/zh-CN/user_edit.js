return {
  menu: {
    profile: "个人资料",
    preference: "偏好设置",
    security: "安全",
    privilege: "特权",
    audit: "审计日志"
  },
  back_to_profile: "返回个人资料",
  back_to_profile_of_user: "返回该用户个人资料",
  admin_warning: "您正在使用管理特权查看并编辑其它用户的资料。",
  errors: {
    PERMISSION_DENIED: "权限不足。",
    NO_SUCH_USER: "无此用户。",
    DUPLICATE_USERNAME: "用户名已被使用。",
    DUPLICATE_EMAIL: "邮箱已被使用。",
    FAILED: "未知错误。",
    FAILED_TO_SEND: "发送邮件失败：{errorMessage}",
    RATE_LIMITED: "您的操作过于频繁，请稍后再试。"
  },
  profile: {
    title: "个人资料",
    avatar: {
      header: "头像",
      gravatar: {
        name: "Gravatar"
      },
      qq: {
        name: "QQ 头像",
        placeholder: "QQ 号"
      },
      github: {
        name: "GitHub 头像",
        placeholder: "GitHub 用户名"
      },
      error: "无法加载头像，请检查网络连接以及账户名是否正确。"
    },
    username: "用户名",
    username_notes: "用户名不能被修改。",
    username_notes_admin: "管理员可以修改任何用户的用户名。",
    email: "邮箱",
    public_email: "公开邮箱地址",
    email_notes: "请在「安全」中修改邮箱地址。",
    email_notes_admin: "管理员可以修改任何用户的邮箱地址。",
    nickname: "昵称",
    bio: "个性签名",
    bio_placeholder: "写一些描述你的，或者你喜欢的话。",
    organization: "组织",
    organization_placeholder: "你的学校、公司或者虚拟组织。",
    location: "位置",
    location_placeholder: "你的地理位置。",
    url: "网址",
    url_placeholder: "你的个人主页或者博客。",
    qq: "QQ",
    qq_placeholder: "如：12345678",
    qq_notes: "你的 QQ 链接为：",
    telegram: "Telegram",
    telegram_placeholder: "不含 @ 符号",
    telegram_notes: "你的 Telegram 链接为：",
    github: "GitHub",
    github_placeholder: "不含 @ 符号",
    github_notes: "你的 GitHub 链接为：",
    submit: "提交",
    error_invalid_username: "无效的用户名。",
    error_invalid_email: "无效的邮箱地址。",
    error_invalid_url: "无效的网址。",
    success: "个人资料修改成功。"
  },
  preference: {
    title: "偏好设置",
    locale: {
      header: "语言",
      system: "偏好系统语言",
      system_default: "浏览器默认",
      system_default_name: "浏览器默认（{name}）",
      system_notes: "在页面底端处更改语言仅在本地浏览器内生效，在此处更改语言将对本账户生效。",
      content: "偏好内容语言",
      content_default: "与系统语言相同",
      content_default_name: "与系统语言相同（{name}）",
      content_notes: "如果所选语言的内容不可用，则会为您展示默认语言版本的内容。",
      hide_unavailable_message: "隐藏「该内容没有您偏好的语言版本」信息"
    },
    appearance: {
      header: "外观",
      theme: "主题",
      themes: {
        auto: {
          name: "自动",
          description: "根据浏览器或系统设置自动选择亮色（PURE）或暗色（FAR）主题"
        },
        pure: {
          name: "PURE",
          description: "亮色主题"
        },
        far: {
          name: "FAR",
          description: "暗色主题"
        }
      },
      content_font_face: "正文字体",
      system_default_sans_serif: "sans-serif（浏览器默认）",
      system_default_serif: "serif（浏览器默认）",
      content_preview: "预览",
      code_font_face: "代码字体",
      system_default: "monospace（浏览器默认）",
      code_font_size: "代码字体大小",
      code_line_height: "代码行高",
      code_font_ligatures: "启用连字（Ligatures）",
      code_font_ligatures_notes: "连字（Ligatures）功能可将部分组合符号显示为更易于阅读的形式。仅部分字体支持此功能。",
      code_preview: "预览",
      markdown_editor_font: {
        markdown_editor: "Markdown 编辑器",
        content_font: "正文字体",
        code_font: "代码字体"
      }
    },
    code_language: {
      header: "编程语言",
      language: "默认语言",
      content_notes: "此处的设置影响您提交题目时的默认语言选项。"
    },
    code_formatter: {
      header: "代码格式化",
      astyle_options: "Astyle 参数",
      format_code_by_default: "默认格式化代码",
      notes_before: "该参数应用于提交记录页面的代码展示，请参考",
      notes_link: "Astyle 文档",
      notes_after: "以获取帮助。",
      preview: "预览",
      error: "参数错误"
    },
    submit: "提交",
    success: "偏好设置修改成功。"
  },
  security: {
    title: "安全",
    password: {
      header: "修改密码",
      old: "旧密码",
      new: "新密码",
      retype: "确认密码",
      invalid_password: "无效的密码。",
      empty_new_password: "新密码不能为空。",
      empty_retype_password: "确认密码不能为空。",
      wrong_old_password: "旧密码错误。",
      passwords_do_not_match: "密码不一致。",
      success: "修改密码成功。",
      submit: "提交"
    },
    email: {
      header: "修改邮箱",
      email: "邮箱",
      invalid_email: "无效的邮箱地址。",
      duplicate_email: "该邮箱地址已被占用。",
      email_verification_code: "邮箱验证码",
      send_email_verification_code: "发送验证码",
      verification_code_sent: "邮箱验证码已发送。",
      invalid_email_verification_code: "无效的邮箱验证码。",
      success: "修改邮箱地址成功。",
      submit: "提交"
    },
    sessions: {
      header: "会话",
      revoke_all: "全部下线",
      confirm_revoke_all: "确认全部下线",
      success_revoke_all: "已将该用户的会话全部下线。",
      success_revoke_all_current_user: "已将您的其他会话全部下线。",
      current: "当前会话",
      last_active: "最近在线于{time}",
      revoke: "下线",
      confirm_revoke: "确认下线",
      success_revoke: "已将该会话下线。",
      login_ip: "登录于 {ip}   ·   ",
      login_ip_location: "登录于 {ip}（{location}） ·    ",
      no_sessions: "该用户暂无会话",
      unknown_os_browser: "未知浏览器/操作系统",
      notes_current_user:
        "以上为您的用户已登录的所有会话，如发现异常登录，请将其下线并立刻修改密码。\n通过「重置密码」页面修改密码后将自动下线全部会话。"
    }
  },
  privilege: {
    title: "特权",
    header: "特权",
    privileges: {
      EditHomepage: {
        name: "编辑首页",
        notes: "可以编辑首页的配置与内容，如通知和公告。"
      },
      ManageUser: {
        name: "管理用户",
        notes: "可以修改其他用户的个人资料、偏好设置以及安全设置。"
      },
      ManageUserGroup: {
        name: "管理用户组",
        notes: "可以创建、编辑或删除用户组，管理用户组的成员。"
      },
      ManageProblem: {
        name: "管理题目",
        notes: "可以浏览、编辑所有题目与提交记录，设置题目权限以及删除题目。"
      },
      ManageContest: {
        name: "管理比赛",
        notes: "等做好了比赛功能我再想想这里该写啥。"
      },
      ManageDiscussion: {
        name: "管理讨论",
        notes: "可以浏览、编辑所有讨论与回复，设置讨论权限以及删除讨论与回复。"
      },
      SkipRecaptcha: {
        name: "跳过 reCAPTCHA",
        notes: "可以在不验证 reCAPTCHA（如果已启用）的情况下提交任意请求。适用于机器人或虚拟评测。"
      }
    },
    admin_only: "仅管理员可修改用户特权。",
    submit: "提交",
    success: "特权修改成功。"
  },
  audit: {
    title: "审计日志",
    header: "审计日志",
    query: {
      action_query: "操作",
      ip: "IP 地址",
      first_object_id: "主对象",
      second_object_id: "次对象",
      filter: "筛选"
    },
    no_audit_log: "暂无日志",
    no_matched_audit_log: "找不到符合条件的日志",
    copy_details: "复制详细信息",
    goback: "返回"
  }
};
