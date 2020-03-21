module.exports = {
  title: {
    profile: "修改个人资料",
    preference: "偏好设置",
    security: "安全设置"
  },
  menu: {
    profile: "个人资料",
    preference: "偏好设置",
    security: "安全"
  },
  back_to_profile: "返回个人资料",
  error: {
    PERMISSION_DENIED: "权限不足。",
    NO_SUCH_USER: "无此用户。",
    WRONG_OLD_PASSWORD: "旧密码错误。",
    DUPLICATE_USERNAME: "用户名已被使用。",
    DUPLICATE_EMAIL: "电子邮箱已被使用。"
  },
  profile: {
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
  }
};
