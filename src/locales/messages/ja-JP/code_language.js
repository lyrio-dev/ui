return {
  code_language: "[TBT] Language",
  cpp: {
    name: "[TBT] C++",
    options: {
      compiler: {
        name: "[TBT] Compiler",
        values: {
          "g++": "[TBT] G++",
          "clang++": "[TBT] Clang++"
        }
      },
      std: {
        name: "[TBT] C++ Standard",
        values: {
          "c++03": "[TBT] ISO C++ 03",
          "c++11": "[TBT] ISO C++ 11",
          "c++14": "[TBT] ISO C++ 14",
          "c++17": "[TBT] ISO C++ 17",
          "c++20": "[TBT] ISO C++ 20",
          "gnu++03": "[TBT] GNU C++ 03",
          "gnu++11": "[TBT] GNU C++ 11",
          "gnu++14": "[TBT] GNU C++ 14",
          "gnu++17": "[TBT] GNU C++ 17",
          "gnu++20": "[TBT] GNU C++ 20"
        }
      },
      O: {
        name: "[TBT] Optimization",
        values: {
          0: "[TBT] -O0 (disable optimization)",
          1: "[TBT] -O1",
          2: "[TBT] -O2",
          3: "[TBT] -O3",
          fast: "[TBT] -Ofast (fastest)"
        }
      },
      m: {
        name: "[TBT] Architecture",
        values: {
          64: "[TBT] 64-bit",
          32: "[TBT] 32-bit",
          x32: "[TBT] 64-bit (with 32-bit pointers)"
        }
      }
    }
  },
  c: {
    name: "[TBT] C",
    options: {
      compiler: {
        name: "[TBT] Compiler",
        values: {
          gcc: "[TBT] GCC",
          clang: "[TBT] Clang"
        }
      },
      std: {
        name: "[TBT] C Standard",
        values: {
          c89: "[TBT] ISO C89",
          c99: "[TBT] ISO C99",
          c11: "[TBT] ISO C11",
          c17: "[TBT] ISO C17",
          gnu89: "[TBT] GNU C89",
          gnu99: "[TBT] GNU C99",
          gnu11: "[TBT] GNU C11",
          gnu17: "[TBT] GNU C17"
        }
      },
      O: {
        name: "[TBT] Optimization",
        values: {
          0: "[TBT] -O0 (disable optimization)",
          1: "[TBT] -O1",
          2: "[TBT] -O2",
          3: "[TBT] -O3",
          fast: "[TBT] -Ofast (fastest)"
        }
      },
      m: {
        name: "[TBT] Architecture",
        values: {
          64: "[TBT] 64-bit",
          32: "[TBT] 32-bit",
          x32: "[TBT] 64-bit (with 32-bit pointers)"
        }
      }
    }
  },
  java: {
    name: "[TBT] Java"
  },
  kotlin: {
    name: "[TBT] Kotlin",
    options: {
      version: {
        name: "[TBT] Version",
        values: {
          1.5: "1.5",
          1.6: "1.6",
          1.7: "1.7",
          1.8: "1.8",
          1.9: "1.9"
        }
      },
      platform: {
        name: "[TBT] Platform",
        values: {
          jvm: "[TBT] JVM"
        }
      }
    }
  },
  pascal: {
    name: "[TBT] Pascal",
    options: {
      optimize: {
        name: "[TBT] Optimization",
        values: {
          "-": "[TBT] Disabled",
          1: "[TBT] -O",
          2: "[TBT] -O2",
          3: "[TBT] -O3",
          4: "[TBT] -O4 (fastest)"
        }
      }
    }
  },
  python: {
    name: "[TBT] Python",
    options: {
      version: {
        name: "[TBT] Version",
        values: {
          2.7: "2.7",
          3.9: "3.9",
          "3.10": "3.10"
        }
      }
    }
  },
  rust: {
    name: "[TBT] Rust",
    options: {
      version: {
        name: "[TBT] Version",
        values: {
          2015: "[TBT] 2015",
          2018: "[TBT] 2018",
          2021: "[TBT] 2021"
        }
      },
      optimize: {
        name: "[TBT] Optimization",
        values: {
          0: "[TBT] Disabled",
          1: "[TBT] Level 1",
          2: "[TBT] Level 2",
          3: "[TBT] Level 3 (fastest)"
        }
      }
    }
  },
  swift: {
    name: "[TBT] Swift",
    options: {
      version: {
        name: "[TBT] Version",
        values: {
          4.2: "4.2",
          5: "5",
          6: "6"
        }
      },
      optimize: {
        name: "[TBT] Optimize",
        values: {
          Onone: "[TBT] Disabled",
          O: "[TBT] Enabled",
          Ounchecked: "[TBT] Enabled (no safety checks)"
        }
      }
    }
  },
  go: {
    name: "[TBT] Go",
    options: {
      version: {
        name: "[TBT] Version",
        values: {
          "1.x": "[TBT] 1.x"
        }
      }
    }
  },
  haskell: {
    name: "[TBT] Haskell",
    options: {
      version: {
        name: "[TBT] Version",
        values: {
          98: "[TBT] Haskell 98",
          2010: "[TBT] Haskell 2010"
        }
      }
    }
  },
  csharp: {
    name: "[TBT] C#",
    options: {
      version: {
        name: "[TBT] Version",
        values: {
          7.3: "7.3",
          8: "8",
          9: "9"
        }
      }
    }
  },
  fsharp: {
    name: "[TBT] F#"
  }
};
