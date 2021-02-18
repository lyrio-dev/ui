module.exports = {
  networkflow: {
    FordFulkerson: {
      pseudo: [
        "initialize the *network flow graph*:",
        [
          "**for each** *edge* ($e=\\left(u,v\\right)$) in the *network flow graph*",
          ["create its *reverse edge* ($\\bar{e}=\\left(v,u\\right)$)", "set the *capacity* of $\\bar{e}$ to 0"]
        ],
        "**while** *target vertex* ($\\mathrm{T}$)  is reachable from *source vertex* ($\\mathrm{S}$) in the *residual graph*",
        [
          "find an *augmenting path* ($\\mathrm{P}$) using **DFS**",
          "calculate the *minimum capacity* ($limit$) of **each** *edge* in $\\mathrm{P}$",
          "update the *capacity* of **each** *edge* in $\\mathrm{P}$ by $limit$:",
          [
            "**for each** *edge* ($e$) in $\\mathrm{P}$",
            ["decrease the *capacity* of $e$ by $limit$", "increase the *capacity* of its *reverse edge* by $limit$"]
          ],
          "increase <u>*maxflow*</u> by $limit$"
        ],
        "**return** {<u>*maxflow*</u>}"
      ]
    },
    EdmondsKarp: {
      pseudo: [
        "initialize the *network flow graph*",
        "**while** *target vertex* ($\\mathrm{T}$)  is reachable from *source vertex* ($\\mathrm{S}$) in the *residual graph*",
        [
          "find an *augmenting path* ($\\mathrm{P}$) using **BFS**",
          "calculate the *minimum capacity* ($limit$) of **each** *edge* in $\\mathrm{P}$",
          "update the *capacity* of **each** *edge* in $\\mathrm{P}$ by $limit$",
          "increase <u>*maxflow*</u> by $limit$"
        ],
        "**return** {<u>*maxflow*</u>}"
      ]
    },
    Dinic: {
      pseudo: [
        "initialize the *network flow graph*",
        "**while** *target vertex* ($\\mathrm{T}$)  is reachable from *source vertex* ($\\mathrm{S}$) in the *residual graph*",
        [
          "find the *level graph* ($\\mathrm{LG}$) using **BFS**",
          "**for each** *augmenting path* ($\\mathrm{P}_i$) in $\\mathrm{LG}$ (using **DFS**)",
          [
            "calculate the *minimum capacity* ($limit_i$) of **each** *edge* in $\\mathrm{P}_i$",
            "update the *capacity* of **each** *edge* in $\\mathrm{P}_i$ by $limit_i$"
          ],
          "increase <u>*maxflow*</u> by the sum of **each** $limit_i$"
        ],
        "**return** {<u>*maxflow*</u>}"
      ]
    },
    classicMCMF: {
      pseudo: [
        "initialize the *weighted network flow graph*:",
        [
          "**for each** *edge* ($e=\\left(u,v\\right)$) in the *network flow graph*",
          [
            "create its *reverse edge* ($\\bar{e}=\\left(v,u\\right)$)",
            "set the *capacity* of $\\bar{e}$ to 0, set the *cost* of $\\bar{e}$ to the opposite number of which of $e$"
          ]
        ],
        "**while** *target vertex* ($\\mathrm{T}$)  is reachable from *source vertex* ($\\mathrm{S}$) in the *residual graph* **and** *flow_limit* > 0",
        [
          "find an *augmenting path* ($\\mathrm{P}$) with *minimum total cost* ($cost$) using **SPFA**",
          "calculate the *minimum capacity* ($limit$) of **each** *edge* in $\\mathrm{P}$ ($limit$ cannot exceed *flow_limit*)",
          "update the *capacity* of **each** *edge* in $\\mathrm{P}$ by $limit$",
          "increase <u>*maxflow*</u> by $limit$, increase <u>*mincost*</u> by $limit\\cdot cost$, decrease *flow_limit* by $limit$"
        ],
        "**return** {<u>*maxflow*</u>, <u>*mincost*</u>}"
      ]
    },
    ZkwMCMF: {
      pseudo: [
        "$\\bullet$ initialize the *weighted network flow graph*",
        "**while** *target vertex* ($\\mathrm{T}$) is reachable from *source vertex* ($\\mathrm{S}$) in the *residual graph* ($\\mathrm{RG}$) **and** *flow_limit* > 0",
        [
          "$\\bullet$ find the *SSSP graph* ($\\mathrm{SG}$) based on $\\mathrm{RG}$ using **SPFA**, get the *minimum cost* ($cost$) from $\\mathrm{S}$ to $\\mathrm{T}$",
          "**while** $\\mathrm{T}$ is reachable from $\\mathrm{S}$ in $\\mathrm{SG}$ **and** *flow_limit* > 0",
          [
            "$\\bullet$ **for each** *augmenting path* ($\\mathrm{P}_i$) in $\\mathrm{SG}$ (using **DFS**)",
            [
              "calculate the *minimum capacity* ($limit_i$) of **each** *edge* in $\\mathrm{P}_i$  (the *sum of  $limit_i$* ($sumlimit$) cannot exceed *flow_limit*)",
              "update the *capacity* of **each** *edge* in $\\mathrm{P}_i$ by $limit_i$"
            ],
            "$\\bullet$ increase <u>*maxflow*</u> by $sumlimit$, increase <u>*mincost*</u> by $sumlimit\\cdot cost$, decrease *flow_limit* by $sumlimit$"
          ]
        ],
        "$\\bullet$ **return** {<u>*maxflow*</u>, <u>*mincost*</u>}"
      ]
    }
  },
  matching: {
    Hungarian: {
      pseudo: [
        "**for each** *vertex* ($v$) **in** the *left side*",
        [
          "**if** find an *augmenting path* ($\\mathrm{P}$) from $v$ (using **DFS**)",
          [
            "flip the *status* (*matched* or *unmatched*) of **each** *edge* in $\\mathrm{P}$",
            "increase <u>*matched*</u> by 1"
          ]
        ],
        "**return** {<u>*matched*</u>}"
      ]
    },
    KuhnMunkres: {
      pseudo: [""]
    },
    Gabow: {
      pseudo: [""]
    }
  },
  planargraph: {
    DMP: {
      pseudo: [
        "simplify the *graph* ($\\mathrm{G}=\\left(\\mathrm{V},\\mathrm{E}\\right)$):",
        ["remove *self loop*, *multiple edges*, *vertex* whose *degree* ≤ 2"],
        "quick test $\\mathrm{G}=\\left(\\mathrm{V},\\mathrm{E}\\right)$:",
        [
          "**if** $\\left|\\mathrm{E}\\right|$ < 9 **or** $\\left|\\mathrm{V}\\right|$ < 5",
          ["set <u>*planarity*</u> to *true*, **goto** end"],
          "**if** $\\left|\\mathrm{E}\\right|$ > $3\\left|\\mathrm{V}\\right|-6$",
          ["set <u>*planarity*</u> to *false*, **goto** end"]
        ],
        "split $\\mathrm{G}$ into its *biconnected components* ($\\mathrm{BC}$)",
        "**for each** *graph* ($\\mathrm{G}_i=\\left(\\mathrm{V}_i,\\mathrm{E}_i\\right)$) in $\\mathrm{BC}$",
        [
          "simplify $\\mathrm{G}_i$, quick test $\\mathrm{G}_i$",
          "add an arbitrary *edge* ($e=\\left(u,v\\right)$) in $\\mathrm{E}_i$, *vertex* $u,v$ and initial *face* ($face_0=\\left[u,v\\right]$) to an empty *planar embedding* ($\\mathrm{G}_i'=\\left(\\mathrm{V}_i',\\mathrm{E}_i',\\mathrm{Faces}_i\\right)$)",
          "**repeat**:",
          [
            "find **all** *fragment* ($\\mathrm{Fragments}$) of $\\mathrm{G}_i$ with respect to $\\mathrm{G}_i'$",
            "**if** $fragments$ is empty",
            ["set <u>*planarity*</u> to *true*, **goto** end"],
            "**for each** *fragment* ($fragment_j$) in $\\mathrm{Fragments}$",
            ["find **all** *embeddable face* ($\\mathrm{Face}_j$) in $\\mathrm{G}_i'$ for $fragment_j$"],
            "**if** there is a $\\mathrm{Face}_j$ that is empty",
            ["set *<u>planarity</u>* to *false*, **goto** end"],
            "**if** there is a $\\mathrm{Face}_j$ that has only one *face* ($face$) in it",
            ["set $fragment$ to $fragment_j$"],
            "**else**",
            [
              "set $fragment$ to an arbitrary $fragment_j$ in $\\mathrm{Fragments}$",
              "set $face$ to an arbitrary *face* in $\\mathrm{Face}_j$"
            ],
            "find a *path* ($\\mathrm{P}$) in $fragment$ whose first and last *vertex* is in $face$",
            "add **all** *edge* and *vertex* in $\\mathrm{P}$ to $\\mathrm{G}_i'$",
            "replace $face$ in $\\mathrm{G}_i'$ with two new *face* split from $face$ by $\\mathrm{P}$"
          ]
        ],
        "end:",
        ["**return** {<u>*planarity*</u>}"]
      ]
    }
  },
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
