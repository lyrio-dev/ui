return {
  title_new: "创建比赛",
  title_edit: "编辑比赛",
  errors: {
    PERMISSION_DENIED: "权限不足。",
    NO_SUCH_CONTEST: "无此比赛。",
    empty_alias: "第 {index} 个题目的题号为空。",
    duplicated_alias: "第 {index} 个题目的题号与第 {index2} 个重复。",
    NO_SUCH_PROBLEM: "无此题目。",
    INVALID_CONTEST_TYPE_OPTIONS: "未知错误。",
    SUBMITTED_EARLIER_THAN_NEW_START_TIME: "欲设置的开始时间之前已有提交。",
    DELETING_PROBLEM_SUMITTED: "欲删除的题目已有提交。"
  },
  header_edit: "编辑比赛 #{id}",
  header_new: "创建比赛",
  button_back: "返回",
  button_submit: "提交",
  set_default_locale: "设为默认语言",
  delete_locale: "删除语言",
  confirm_delete_locale: "确认删除语言",
  placeholder_name: "比赛名称",
  placeholder_description: "比赛描述",
  header_type: "比赛赛制",
  type: {
    basic: {
      name: "普通",
      full_score: "满分",
      full_score_decreasing: "随时间减少",
      full_score_decreasing_notes: "若选中该选项，题目提交时获得的满分将随着比赛已经过时间减少，公式参考 <a href=\"https://codeforces.com/blog/entry/456\" target=\"_blank\">Codeforces</a>。",
      use_which_submission: {
        _: "多次提交时保留",
        best: "最好",
        latest: "最晚"
      }
    },
    icpc: {
      name: "ACM/ICPC",
      penalty_time: {
        _: "罚时",
        minutes: "分钟",
        placeholder: "无"
      }
    }
  },
  type_notes: "赛制在创建比赛后不可更改。",
  header_start_time: "开始时间",
  header_end_time: "结束时间",
  enable_participant_duration: "为每个参赛者独立计时",
  participant_duration_placeholder: "比赛时长",
  participant_duration_unit_minutes: "分钟",
  participant_duration_notes:
    "在比赛开始时间到结束时间内，参赛者均可报名参加比赛。\n上述持续时间结束（或整个比赛结束）后比赛对该参赛者结束。\n各个参赛者之间计时独立。",
  header_publicness: "公开性",
  publicness: {
    PublicParticipation: "允许任何人参加",
    PublicViewAfterEnded: "结束后允许任何人查看",
    Hidden: "隐藏"
  },
  header_problems: "题目",
  problems_table: {
    placeholder: "暂无题目",
    alias: "#",
    problem: "题目",
    operations: "操作",
    add_problem: "添加题目",
    confirm_delete: "确认删除",
    move_problem_with_alias: "移动时保留题号"
  },
  header_options: "选项",
  options: {
    allowSeeingProblemTags: "显示题目标签",
    allowAccessingTestData: "允许下载测试数据",
    allowSeeingOthersSubmissions: "允许查看他人提交",
    allowSeeingOthersSubmissionDetail: "允许查看他人提交详细信息",
    showProblemStatistics: "显示题目统计信息",
    enableIssues: "启用问答",
    runPretestsOnly: "仅运行预测试",
    submissionMetaVisibility: {
      _: "显示评测结果",
      Hidden: "隐藏",
      PretestsOnly: "仅预测试",
      Visible: "显示"
    },
    submissionTestcaseResultVisibility: {
      _: "显示测试点结果",
      Hidden: "隐藏",
      PretestsOnly: "仅预测试",
      Visible: "显示"
    },
    submissionTestcaseDetailVisibility: {
      _: "显示测试点详细信息",
      Hidden: "隐藏",
      PretestsOnly: "仅预测试",
      Visible: "显示"
    },
    ranklistDuringContest: {
      _: "比赛时展示排行榜",
      Real: "是",
      Pretests: "仅预测试",
      None: "否"
    },
    freezeRanklistForParticipantsWhen: {
      _: "封榜时间（自比赛开始）",
      placeholder: "从不",
      minutes: "分钟"
    }
  },
  success_update: "修改成功。",
  success_create: "创建成功。",
};
