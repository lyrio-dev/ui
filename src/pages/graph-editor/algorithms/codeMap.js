module.exports = {
  dijkstra: {
    pseudo: [
      "令$\\bar{S}=\\{2,3,\\cdots ,n\\}, \\pi (1)=0, \\pi (i)=\\left\\{\\begin{array}{ll} w_i, i \\in \\Gamma^+_1 \\\\ \\infty, \\text{otherwise} \\\\ \\end{array} \\right.$",
      ["在$\\bar{S}$中，令$\\pi (j)=\\min_{i\\in\\bar{S}} \\pi (i)$，置$\\bar{S}\\leftarrow\\bar{S} - \\{j\\}$。若$\\bar{S}=\\Phi$，结束，否则转步骤3。",
        ["对全部的$i\\in \\bar{S}\\cap\\Gamma^+_j$，置$\\pi (i)\\leftarrow\\min (\\pi (i), \\pi (j)+w_{ji})$，转步骤2。"]]
    ],
    test: [
      "initialize the *network flow graph*:",
      ["**for each** *edge* ($e=\\left(u,v\\right)$) in the *network flow graph*",
        ["create its *reverse edge* ($\\bar{e}=\\left(v,u\\right)$)",
          "set the *capacity* of $\\bar{e}$ to 0"]],
      "**while** *target vertex* ($\\mathrm{T}$)  is reachable from *source vertex* ($\\mathrm{S}$) in the *residual graph*",
      ["find an *augmenting path* ($\\mathrm{P}$) using **DFS**",
        "calculate the *minimum capacity* ($limit$) of **each** *edge* in $\\mathrm{P}$",
        "update the *capacity* of **each** *edge* in $\\mathrm{P}$ by $limit$:",
        ["**for each** *edge* ($e$) in $\\mathrm{P}$",
          ["decrease the *capacity* of $e$ by $limit$",
            "increase the *capacity* of its *reverse edge* by $limit$"]],
        "increase <u>*maxflow*</u> by $limit$"],
      "**return** {<u>*maxflow*</u>}"
    ]
  }
};
