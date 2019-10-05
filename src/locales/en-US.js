import flatten from "flat";

export default flatten({
  syzoj: {
    common: require("./en-US/common"),
    index: require("./en-US/index"),
    login: require("./en-US/login")
  }
});
