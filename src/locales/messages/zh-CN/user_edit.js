module.exports = {
  menu: {
    profile: "个人资料",
    preference: "偏好设置",
    security: "安全",
    privilege: "特权"
  },
  back_to_profile: "返回个人资料",
  back_to_profile_of_user: "返回该用户个人资料",
  admin_warning: "您正在使用管理权限查看与编辑其它用户的资料。",
  error: {
    PERMISSION_DENIED: "权限不足。",
    NO_SUCH_USER: "无此用户。",
    DUPLICATE_USERNAME: "用户名已被使用。",
    DUPLICATE_EMAIL: "电子邮箱已被使用。",
    FAILED: "未知错误。"
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
    error_invalid_url: "无效的网址。",
    success: "个人资料修改成功。"
  },
  preference: {
    title: "偏好设置",
    locale: {
      header: "语言",
      system: "偏好系统语言",
      system_default: "浏览器默认（{name}）",
      system_notes: "在页面底端处更改语言仅在本地浏览器内生效，在此处更改语言将对本账户生效。",
      content: "偏好内容语言",
      content_default: "与系统语言相同（{name}）",
      content_notes: "如果所选语言的内容不可用，则会为您展示默认语言版本的内容。"
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
      success: "修改邮箱地址成功。",
      submit: "提交"
    }
  },
  privilege: {
    title: "特权",
    header: "特权",
    privileges: {
      MANAGE_USER: {
        name: "管理用户",
        notes: "可以修改其他用户的个人资料、偏好设置以及安全设置。"
      },
      MANAGE_USER_GROUP: {
        name: "管理用户组",
        notes: "可以创建、编辑或删除用户组，管理用户组的成员。"
      },
      MANAGE_PROBLEM: {
        name: "管理题目",
        notes: "可以浏览、编辑所有题目与提交记录，设置题目是否公开以及删除题目。"
      },
      MANAGE_CONTEST: {
        name: "管理比赛",
        notes: "等做好了比赛功能我再想想这里该写啥。"
      },
      MANAGE_DISCUSSION: {
        name: "管理讨论",
        notes: "等做好了讨论功能我再想想这里该写啥。"
      }
    },
    admin_only: "仅管理员可修改用户特权。",
    submit: "提交",
    success: "特权修改成功。"
  }
};
