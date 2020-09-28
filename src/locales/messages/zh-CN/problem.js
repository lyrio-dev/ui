module.exports = {
  title: "题目",
  meta_labels: {
    non_public: "未公开",
    no_display_id: "未设置 ID"
  },
  fileio: {
    fileio: "文件 IO",
    input: "输入文件",
    output: "输出文件"
  },
  show_tags: "显示标签",
  hide_tags: "隐藏标签",
  type: {
    TRADITIONAL: "传统",
    INTERACTION: "交互",
    SUBMIT_ANSWER: "提交答案"
  },
  statistic: {
    submissions: "提交",
    accepted: "通过"
  },
  action: {
    submit: "提交",
    login_to_submit: "请登录后提交",
    submission: "提交记录",
    statistics: "统计",
    discussion: "讨论",
    files: "文件",
    edit: "编辑",
    judge_settings: "评测设置",
    permission_manage: "权限管理",
    permission_manager_description: "题目 {idString}",
    set_display_id: "设置题目 ID",
    set_display_id_new: "新 ID（留空或为 0 则清除 ID）",
    set_display_id_submit: "设置",
    set_public: "设为公开",
    set_non_public: "取消公开",
    set_public_confirm: "确认公开",
    set_non_public_confirm: "确认取消公开",
    delete: "删除",
    delete_confirm_title: "删除题目",
    delete_confirm_content: "确定删除该题目吗？题目的提交记录、讨论、文件也将一并删除。这可能需要花费一些时间。",
    delete_confirm: "确认删除",
    delete_cancel: "取消",
    delete_success: "删除成功。"
  },
  error: {
    PERMISSION_DENIED: "权限不足。",
    NO_SUCH_PROBLEM: "无此题目。",
    NO_DISPLAY_ID: "请先设置题目 ID。",
    INVALID_DISPLAY_ID: "ID 必须为整数。",
    PUBLIC_PROBLEM_MUST_HAVE_DISPLAY_ID: "已公开的题目必须拥有 ID。",
    DUPLICATE_DISPLAY_ID: "ID {displayId} 已被使用。"
  },
  upload_error: "上传失败：{error}",
  submit: {
    last_submission: "上次提交",
    back_to_statement: "返回题面",
    skip_samples: "跳过样例",
    upload_files: "上传文件",
    choose_files: "选择 ...",
    selected_archive: "已选择归档文件。",
    selected_valid_files: "已选择 {all} 个文件，其中 {valid} 个有效。",
    selected_files: "已选择 {all} 个文件。",
    cancel_select_files: "取消选择文件",
    clear_editor_to_use_upload_left: "",
    clear_editor: "清除编辑器内容",
    clear_editor_to_use_upload_right: "以使用文件上传功能。",
    fill_in_editor_or_upload_file: "在编辑器中填写答案，或者上传文件。",
    submit: "提交"
  },
  permission_level: {
    read: "只读",
    write: "读写"
  },
  sample: {
    input: "输入",
    output: "输出",
    copy: "复制",
    copied: "已复制",
    failed_to_copy: "复制失败"
  }
};
