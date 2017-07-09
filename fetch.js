var commandLineArgs = require('command-line-args'),
    optionDefinitions = [{name: "key", type: String}],
    args = commandLineArgs(optionDefinitions),
    key = args.key,

    lib = require("./ffi_lib.js").load()

if (!key)process.exit()

try {
  console.log("lib.EnvJson", key)
  var res = lib.EnvJson(key)
  console.log(res)
  process.stdout.write(res)
  process.exit()
} catch (e) {
  console.log("fetch error")
  console.log(e)
  process.exit(1)
}
