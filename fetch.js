var commandLineArgs = require('command-line-args'),
    optionDefinitions = [{name: "key", type: String}],
    args = commandLineArgs(optionDefinitions),
    key = args.key,

    lib = require("./ffi_lib.js").load()

if (!key)process.exit()

try {
  var res = lib.EnvJson(key)
  process.stdout.write(res)
  process.exit()
} catch (e) {
  process.exit(1)
}
