module.exports = {
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
          "c++03": "C++ 03",
          "c++11": "C++ 11",
          "c++14": "C++ 14",
          "c++17": "C++ 17",
          "c++20": "C++ 20"
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
          c89: "C89",
          c99: "C99",
          c11: "C11",
          c17: "C17"
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
          1.3: "1.3",
          1.4: "1.4",
          1.5: "1.5"
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
        name: "Version",
        values: {
          2015: "2015",
          2018: "2018"
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
          8: "8"
        }
      }
    }
  },
  fsharp: {
    name: "F#"
  }
};
