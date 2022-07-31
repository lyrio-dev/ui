return {
  code_language: "语言",
  cpp: {
    name: "C++",
    options: {
      compiler: {
        name: "编译器",
        values: {
          "g++": "G++",
          "clang++": "Clang++"
        }
      },
      std: {
        name: "C++ 标准",
        values: {
          "c++03": "ISO C++ 03",
          "c++11": "ISO C++ 11",
          "c++14": "ISO C++ 14",
          "c++17": "ISO C++ 17",
          "c++20": "ISO C++ 20",
          "gnu++03": "GNU C++ 03",
          "gnu++11": "GNU C++ 11",
          "gnu++14": "GNU C++ 14",
          "gnu++17": "GNU C++ 17",
          "gnu++20": "GNU C++ 20"
        }
      },
      O: {
        name: "优化",
        values: {
          0: "-O0（禁用优化）",
          1: "-O1",
          2: "-O2",
          3: "-O3",
          fast: "-Ofast（最快）"
        }
      },
      m: {
        name: "架构",
        values: {
          64: "64 位",
          32: "32 位",
          x32: "64 位（使用 32 位指针）"
        }
      }
    }
  },
  c: {
    name: "C",
    options: {
      compiler: {
        name: "编译器",
        values: {
          gcc: "GCC",
          clang: "Clang"
        }
      },
      std: {
        name: "C 标准",
        values: {
          c89: "ISO C89",
          c99: "ISO C99",
          c11: "ISO C11",
          c17: "ISO C17",
          gnu89: "GNU C89",
          gnu99: "GNU C99",
          gnu11: "GNU C11",
          gnu17: "GNU C17"
        }
      },
      O: {
        name: "优化",
        values: {
          0: "-O0（禁用优化）",
          1: "-O1",
          2: "-O2",
          3: "-O3",
          fast: "-Ofast（最快）"
        }
      },
      m: {
        name: "架构",
        values: {
          64: "64 位",
          32: "32 位",
          x32: "64 位（使用 32 位指针）"
        }
      }
    }
  },
  java: {
    name: "Java"
  },
  kotlin: {
    name: "Kotlin",
    options: {
      version: {
        name: "版本",
        values: {
          1.5: "1.5",
          1.6: "1.6",
          1.7: "1.7",
          1.8: "1.8",
          1.9: "1.9"
        }
      },
      platform: {
        name: "平台",
        values: {
          jvm: "JVM"
        }
      }
    }
  },
  pascal: {
    name: "Pascal",
    options: {
      optimize: {
        name: "优化",
        values: {
          "-": "无优化",
          1: "-O",
          2: "-O2",
          3: "-O3",
          4: "-O4（最快）"
        }
      }
    }
  },
  python: {
    name: "Python",
    options: {
      version: {
        name: "版本",
        values: {
          2.7: "2.7",
          3.9: "3.9",
          "3.10": "3.10"
        }
      }
    }
  },
  swift: {
    name: "Swift",
    options: {
      version: {
        name: "版本",
        values: {
          4.2: "4.2",
          5: "5",
          6: "6"
        }
      },
      optimize: {
        name: "优化",
        values: {
          Onone: "关闭",
          O: "开启",
          Ounchecked: "开启（无安全检查）"
        }
      }
    }
  },
  rust: {
    name: "Rust",
    options: {
      version: {
        name: "版本",
        values: {
          2015: "2015",
          2018: "2018",
          2021: "2021"
        }
      },
      optimize: {
        name: "优化",
        values: {
          0: "无优化",
          1: "1 级",
          2: "2 级",
          3: "3 级（最快）"
        }
      }
    }
  },
  go: {
    name: "Go",
    options: {
      version: {
        name: "版本",
        values: {
          "1.x": "1.x"
        }
      }
    }
  },
  haskell: {
    name: "Haskell",
    options: {
      version: {
        name: "版本",
        values: {
          98: "Haskell 98",
          2010: "Haskell 2010"
        }
      }
    }
  },
  csharp: {
    name: "C#",
    options: {
      version: {
        name: "版本",
        values: {
          7.3: "7.3",
          8: "8",
          9: "9"
        }
      }
    }
  },
  fsharp: {
    name: "F#"
  }
};
