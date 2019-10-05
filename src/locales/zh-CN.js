import flatten from "flat";

export default flatten({
  syzoj: {
    common: require("./zh-CN/common"),
    index: require("./zh-CN/index"),
    login: require("./zh-CN/login")
  }
});
