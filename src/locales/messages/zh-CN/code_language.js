module.exports = {
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
          "c++17": "C++ 17"
        }
      },
      O: {
        name: "优化",
        values: {
          "0": "-O0（禁用优化）",
          "1": "-O1",
          "2": "-O2",
          "3": "-O3",
          fast: "-Ofast（最快）"
        }
      },
      m: {
        name: "架构",
        values: {
          "64": "64 位",
          "32": "32 位",
          x32: "64 位（使用 32 位指针）"
        }
      }
    }
  }
};
