module.exports = [
  [
    "prismjs",
    {
      languages: Object.keys(require("prismjs/components.js").languages).filter(name => name !== "meta")
    }
  ]
];
