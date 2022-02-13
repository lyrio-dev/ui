return {
  title: "评测设置",
  header: "评测设置",
  back_to_problem: "返回",
  confirm_back_to_problem: "放弃修改并返回",
  submit: "提交",
  no_submit_permission: "无提交权限",
  submit_success: "提交成功。",
  error: {
    NO_SUCH_PROBLEM: "无此题目。",
    PERMISSION_DENIED: "权限不足。",
    PROBLEM_HAS_SUBMISSION: "题目已有提交，不可切换类型。",
    INVALID_JUDGE_INFO: {
      INVALID_TIME_LIMIT_TASK: "时间限制无效。",
      TIME_LIMIT_TOO_LARGE_TASK: "时间限制 {3} ms 过大，请联系管理员。",
      INVALID_TIME_LIMIT_SUBTASK: "子任务 {1} 的时间限制无效。",
      TIME_LIMIT_TOO_LARGE_SUBTASK: "子任务 {1} 的时间限制 {3} ms 过大，请联系管理员。",
      INVALID_TIME_LIMIT_TESTCASE: "子任务 {1} 的测试点 {2} 的时间限制无效。",
      TIME_LIMIT_TOO_LARGE_TESTCASE: "子任务 {1} 的测试点 {2} 的时间限制 {3} ms 过大，请联系管理员。",
      INVALID_MEMORY_LIMIT_TASK: "空间限制无效。",
      MEMORY_LIMIT_TOO_LARGE_TASK: "空间限制 {3} MiB 过大，请联系管理员。",
      INVALID_MEMORY_LIMIT_SUBTASK: "子任务 {1} 的空间限制无效。",
      MEMORY_LIMIT_TOO_LARGE_SUBTASK: "子任务 {1} 的空间限制 {3} MiB 过大，请联系管理员。",
      INVALID_MEMORY_LIMIT_TESTCASE: "子任务 {1} 的测试点 {2} 的空间限制无效。",
      MEMORY_LIMIT_TOO_LARGE_TESTCASE: "子任务 {1} 的测试点 {2} 的空间限制 {3} MiB 过大，请联系管理员。",
      INVALID_FILEIO_FILENAME: "输入或输出文件名 {1} 无效。",
      NO_TESTCASES: "无测试点。",
      SUBTASK_HAS_NO_TESTCASES: "子任务 {1} 无测试点。",
      INVALID_SCORING_TYPE: "未知错误。",
      INVALID_POINTS_SUBTASK: "子任务 {1} 的分值占比 {2} 无效。",
      INVALID_POINTS_TESTCASE: "子任务 {1} 的测试点 {2} 的分值占比 {3} 无效。",
      POINTS_SUM_UP_TO_LARGER_THAN_100_SUBTASKS: "所有子任务的分值占比和为 {1}，超过了满分 100。",
      POINTS_SUM_UP_TO_LARGER_THAN_100_TESTCASES: "子任务 {1} 所有测试点的分值占比和为 {2}，超过了满分 100。",
      INVALID_DEPENDENCY: "子任务 {1} 的依赖子任务编号 {2} 无效。",
      NO_SUCH_INPUT_FILE: "子任务 {1} 的测试点 {2} 所引用的输入文件 {3} 不存在。",
      NO_SUCH_OUTPUT_FILE: "子任务 {1} 的测试点 {2} 所引用的输出文件 {3} 不存在。",
      INVALID_USER_OUTPUT_FILENAME: "子任务 {1} 的测试点 {2} 所要求的用户输出文件 {3} 无效。",
      DUPLICATE_USER_OUTPUT_FILENAME:
        "子任务 {1} 的测试点 {2} 所要求的用户输出文件 {3} 与子任务 {4} 的测试点 {5} 重复。",
      INVALID_CHECKER_TYPE: "未知错误。",
      INVALID_CHECKER_OPTIONS: "未知错误。",
      INVALID_CHECKER_INTERFACE: "未知错误。",
      INVALID_CHECKER_LANGUAGE: "未知错误。",
      NO_SUCH_CHECKER_FILE: "检查器文件 {1} 不存在。",
      INVALID_CHECKER_COMPILE_AND_RUN_OPTIONS: "未知错误。",
      INVALID_TIME_LIMIT_CHECKER: "检查器的时间限制无效。",
      INVALID_MEMORY_LIMIT_CHECKER: "检查器的空间限制无效。",
      TIME_LIMIT_TOO_LARGE_CHECKER: "检查器的时间限制 {1} ms 过大，请联系管理员。",
      MEMORY_LIMIT_TOO_LARGE_CHECKER: "检查器的空间限制 {1} ms 过大，请联系管理员。",
      INVALID_INTERACTOR: "未知错误。",
      INVALID_INTERACTOR_INTERFACE: "未知错误。",
      INVALID_INTERACTOR_SHARED_MEMORY_SIZE: "未知错误。",
      INVALID_INTERACTOR_COMPILE_AND_RUN_OPTIONS: "未知错误。",
      INVALID_INTERACTOR_LANGUAGE: "未知错误。",
      NO_SUCH_INTERACTOR_FILE: "交互器文件 {1} 不存在。",
      INVALID_TIME_LIMIT_INTERACTOR: "交互器的时间限制无效。",
      INVALID_MEMORY_LIMIT_INTERACTOR: "交互器的空间限制无效。",
      TIME_LIMIT_TOO_LARGE_INTERACTOR: "交互器的时间限制 {1} ms 过大，请联系管理员。",
      MEMORY_LIMIT_TOO_LARGE_INTERACTOR: "交互器的空间限制 {1} ms 过大，请联系管理员。",
      INVALID_EXTRA_SOURCE_FILES: "未知错误。",
      INVALID_EXTRA_SOURCE_FILES_LANGUAGE: "未知错误。",
      INVALID_EXTRA_SOURCE_FILES_DST: "附加源文件 {3} 的目标文件名无效。",
      NO_SUCH_EXTRA_SOURCE_FILES_SRC: "附加源文件 {3} 不存在。",
      CYCLICAL_SUBTASK_DEPENDENCY: "子任务依赖存在环。",
      TOO_MANY_TESTCASES: "测试点数量过多，请联系管理员。"
    }
  },
  edit_raw: {
    edit_raw: "编辑源代码",
    parse_error: "YAML 解析错误",
    cancel: "取消",
    confirm_cancel: "放弃修改",
    ok: "确定"
  },
  problem_type: "题目类型",
  switch_type: "切换",
  submittable: "允许提交",
  confirm_switch_type: "确认切换题目类型",
  switch_type_success: "切换题目类型成功。",
  meta: {
    time_limit: "时间限制",
    memory_limit: "内存限制",
    input_file: "输入文件",
    output_file: "输出文件",
    use_standard_io: "使用标准输入输出",
    run_samples: "评测时测试样例"
  },
  checker: {
    checker: "检查器",
    types: {
      integers: "整数",
      floats: "浮点数",
      lines: "行比较",
      binary: "二进制比较",
      custom: "自定义"
    },
    config: {
      floats: {
        precision: "误差位数",
        description: "若用户输出的结果与正确答案的绝对误差或相对误差不超过 {value} 则视为正确。"
      },
      lines: {
        case_sensitive: "区分大小写",
        description: "行末的空白字符与文末的空白行将被忽略。"
      },
      custom: {
        interface: "接口",
        interfaces: {
          testlib: "Testlib",
          legacy: "SYZOJ 2",
          lemon: "Lemon",
          hustoj: "HustOJ",
          qduoj: "QDUOJ",
          domjudge: "DOMjudge"
        },
        filename: "文件",
        filename_no_file: "无文件"
      }
    }
  },
  interactor: {
    interactor: "交互器",
    interfaces: {
      stdio: "标准输入/输出",
      shm: "共享内存"
    },
    shm_size: "共享内存大小",
    filename: "文件",
    filename_no_file: "无文件"
  },
  subtasks: {
    auto_testcases: "由数据文件自动检测测试点（自动匹配 <code>.in</code> 与 <code>.out</code> 文件）",
    auto_testcases_no_output: "由数据文件自动检测测试点（自动匹配 <code>.in</code> 文件）",
    cannot_detect_testcases_from_testdata: "无法从测试数据中检测测试点",
    subtask: "子任务",
    single_subtask: "单个子任务",
    subtask_testcases_count: "{count} 测试点",
    subtask_type: {
      Sum: "各测试点分数求和",
      GroupMin: "各测试点分数取最小值",
      GroupMul: "各测试点分数按百分比相乘"
    },
    subtask_options: {
      sort: "排序",
      move_up: "上移",
      move_down: "下移",
      add_before: "在之前添加子任务",
      add_after: "在之后添加子任务",
      add_testcase: "添加测试点",
      delete: "删除",
      confirm_delete: "确认删除"
    },
    auto_add_testcases: {
      auto_add_testcases: "自动添加测试点",
      subtask: "子任务",
      help: "输入正则表达式以匹配文件名，使用捕获组来表示输入输出文件名中相同的部分。\n如果两个文件名分别被输入、输出的正则表达式匹配，且其每个捕获组的文本对应相同，则它们成为一组测试点。",
      help_no_output: "输入正则表达式以匹配文件名，每个被匹配的文件会作为一个测试点的输入文件。",
      input_file: "输入文件",
      output_file: "输出文件",
      can_not_compile_for_input: "无法编译用于输入文件的正则表达式：{message}",
      can_not_compile_for_output: "无法编译用于输出文件的正则表达式：{message}",
      no_capturing_groups: "无捕获组。你需要在正则表达式中使用捕获组以帮助我们关联输入与输出文件。",
      capturing_groups_do_not_match:
        "捕获组数量不匹配，在输入文件中有 {countInInputFilename} 个，但在输出文件中有 {countInOutputFilename} 个。",
      empty_regex: "输入正则表达式以进行匹配。",
      matches_count: "共匹配到 {count} 个测试点。",
      column_input_file: "输入文件",
      column_output_file: "输出文件",
      close: "关闭",
      append: "追加测试点",
      replace: "替换子任务",
      confirm_replace: "确认替换"
    },
    expand_testcases: "展开测试点",
    hide_testcases: "隐藏测试点",
    no_testcases: "暂无测试点",
    testcase: {
      input_file: "输入文件",
      input_file_not_needed: "不需要输入文件",
      output_file: "输出文件",
      output_file_not_needed: "不需要输出文件",
      user_output_filename: "用户输出文件名"
    },
    testcase_add: {
      before: "在此测试点前",
      after: "在此测试点后"
    },
    testcase_options: {
      move_up: "上移",
      move_down: "下移",
      delete: "删除",
      confirm_delete: "确认删除"
    },
    dependencies: "依赖子任务"
  },
  file_selector: {
    no_matching_files: "找不到匹配的文件。",
    file_not_found_warning: "数据包中找不到该文件。",
    empty: "空"
  },
  extra_source_files: {
    option: "编译时加入附加源文件",
    title: "附加源文件",
    src: "源文件",
    dst: "目标文件名",
    delete: "删除",
    confirm_delete: "确认删除"
  }
};
