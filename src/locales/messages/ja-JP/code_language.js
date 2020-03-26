module.exports = {
  cpp: {
    name: "C++",
    options: {
      compiler: {
        name: "コンパイラ",
        values: {
          "g++": "G++",
          "clang++": "Clang++"
        }
      },
      std: {
        name: "C++ 標準",
        values: {
          "c++03": "C++ 03",
          "c++11": "C++ 11",
          "c++14": "C++ 14",
          "c++17": "C++ 17"
        }
      },
      O: {
        name: "最適化",
        values: {
          "0": "-O0（最適化を使わない）",
          "1": "-O1",
          "2": "-O2",
          "3": "-O3",
          fast: "-Ofast（最も速い）"
        }
      },
      m: {
        name: "アーキテクチャ",
        values: {
          "64": "64 ビット",
          "32": "32 ビット",
          x32: "64 ビット（32 ビットのポインターを使う）"
        }
      }
    }
  }
};
