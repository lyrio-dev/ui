return {
  code_language: "Language",
  cpp: {
    name: "C++",
    options: {
      compiler: {
        name: "Compiler",
        values: {
          "g++": "G++",
          "clang++": "Clang++"
        }
      },
      std: {
        name: "C++ Standard",
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
        name: "Optimization",
        values: {
          0: "-O0 (disable optimization)",
          1: "-O1",
          2: "-O2",
          3: "-O3",
          fast: "-Ofast (fastest)"
        }
      },
      m: {
        name: "Architecture",
        values: {
          64: "64-bit",
          32: "32-bit",
          x32: "64-bit (with 32-bit pointers)"
        }
      }
    }
  },
  c: {
    name: "C",
    options: {
      compiler: {
        name: "Compiler",
        values: {
          gcc: "GCC",
          clang: "Clang"
        }
      },
      std: {
        name: "C Standard",
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
        name: "Optimization",
        values: {
          0: "-O0 (disable optimization)",
          1: "-O1",
          2: "-O2",
          3: "-O3",
          fast: "-Ofast (fastest)"
        }
      },
      m: {
        name: "Architecture",
        values: {
          64: "64-bit",
          32: "32-bit",
          x32: "64-bit (with 32-bit pointers)"
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
        name: "Version",
        values: {
          1.5: "1.5",
          1.6: "1.6",
          1.7: "1.7",
          1.8: "1.8",
          1.9: "1.9"
        }
      },
      platform: {
        name: "Platform",
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
        name: "Optimization",
        values: {
          "-": "Disabled",
          1: "-O",
          2: "-O2",
          3: "-O3",
          4: "-O4 (fastest)"
        }
      }
    }
  },
  python: {
    name: "Python",
    options: {
      version: {
        name: "Version",
        values: {
          2.7: "2.7",
          3.9: "3.9",
          "3.10": "3.10"
        }
      }
    }
  },
  rust: {
    name: "Rust",
    options: {
      version: {
        name: "Version",
        values: {
          2015: "2015",
          2018: "2018",
          2021: "2021"
        }
      },
      optimize: {
        name: "Optimization",
        values: {
          0: "Disabled",
          1: "Level 1",
          2: "Level 2",
          3: "Level 3 (fastest)"
        }
      }
    }
  },
  swift: {
    name: "Swift",
    options: {
      version: {
        name: "Version",
        values: {
          4.2: "4.2",
          5: "5",
          6: "6"
        }
      },
      optimize: {
        name: "Optimize",
        values: {
          Onone: "Disabled",
          O: "Enabled",
          Ounchecked: "Enabled (no safety checks)"
        }
      }
    }
  },
  go: {
    name: "Go",
    options: {
      version: {
        name: "Version",
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
        name: "Version",
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
        name: "Version",
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
