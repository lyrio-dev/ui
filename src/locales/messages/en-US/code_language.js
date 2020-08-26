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
          "c++17": "C++ 17"
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
  }
};
