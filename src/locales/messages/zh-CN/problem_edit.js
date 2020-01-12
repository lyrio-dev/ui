module.exports = {
  title_edit: "编辑题目",
  title_new: "新建题目",
  header_edit: "编辑题目 {idString}",
  header_new: "新建题目",
  submit: "提交",
  submit_error: {
    create: {
      FAILED: "创建题目失败，发生了未知错误。",
      PERMISSION_DENIED: "权限不足。"
    },
    update: {
      FAILED: "更新题目失败，发生了未知错误。",
      NO_SUCH_PROBLEM: "无此题目。",
      PERMISSION_DENIED: "权限不足。"
    }
  },
  header_samples: "样例",
  content_editor: {
    title: "标题",
    preview_all: "预览",
    default: "设为默认语言",
    confirm_apply_template: "确认应用模板",
    confirm_delete: "确认删除语言",
    section_title: "栏目标题",
    preview: "预览",
    add_section: {
      before_this_section: "在此栏目前",
      after_this_section: "在此栏目后"
    },
    section_content: "栏目内容",
    new_sample: "新建样例",
    sample_input: "样例输入",
    sample_output: "样例输出",
    sample_explanation: "样例解释",
    section_options: {
      move_up: "上移",
      move_down: "下移",
      delete: "删除",
      confirm_delete: "确认删除"
    },
    section_type: {
      text: "文本",
      sample: "样例"
    }
  },
  sample_editor: {
    add_sample_when_empty: "添加样例",
    sample_id: "样例编号",
    warning: {
      not_referenced: "未在语言「{language}」中引用过",
      multiple_references: "在语言「{language}」中引用了 {referenceCount} 次"
    },
    add_sample: {
      before_this_sample: "在此样例前",
      after_this_sample: "在此样例后"
    },
    options: {
      move_up: "上移",
      move_down: "下移",
      delete: "删除",
      confirm_delete: "确认删除"
    }
  }
};
