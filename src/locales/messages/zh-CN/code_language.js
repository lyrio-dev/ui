module.exports = {
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
          "c++03": "C++ 03",
          "c++11": "C++ 11",
          "c++14": "C++ 14",
          "c++17": "C++ 17",
          "c++20": "C++ 20"
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
          c89: "C89",
          c99: "C99",
          c11: "C11",
          c17: "C17"
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
          1.3: "1.3",
          1.4: "1.4",
          1.5: "1.5"
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
          3.6: "3.6",
          3.9: "3.9"
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
          2018: "2018"
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
          8: "8"
        }
      }
    }
  },
  fsharp: {
    name: "F#"
  }
};
