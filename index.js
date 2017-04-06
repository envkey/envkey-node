var dotenv = require("dotenv").config()

if (process.env.ENVKEY){
  var ffi = require("ffi"),
      path = require('path')

  var platform = process.platform,
      arch = process.arch,
      isUnix = platform != "win32",
      platformParts,
      lib

  if (!isUnix){
    throw "Envkey currently only supports linux and OSX"
  } else if (platform == "darwin"){
    platformParts = arch == "x64" ? ["darwin-10.6-amd64"] : ["darwin-10.6-386"]
  } else {
    if (arch == "x64"){
      platformParts = ["linux-amd64", "linux-arm64"]
    } else if (arch == "ia32"){
      platformParts = ["linux-386"]
    } else {
      platformParts = ["linux-arm64", "linux-arm-7", "linux-arm-6", "linux-arm-5"]
    }
  }

  for (var i = 0; i < platformParts.length; i++) {
    var part = platformParts[i],
        libPath = path.join(process.cwd(), "node_modules", "envkey", "ext", ["envkey", part].join("-"))

    try {
      lib = ffi.Library(libPath, {
        EnvJson: ['string', ['string']]
      })
      break
    } catch (e) {
      continue
    }
  }

  if(!lib){
    throw "There was a problem loading Evkey on your platform"
  }

  try {
    var res = lib.EnvJson(process.env.ENVKEY)
      json = JSON.parse(res)

    for (k in json){
      if(!process.env[k]){
        process.env[k] = json[k]
      }
    }

    console.log("ENVKEY: vars loaded and decrypted - access with process.env.YOUR_VAR_NAME")
  } catch (e) {
    throw  "Envkey invalid. Couldn't load vars."
  }

}

