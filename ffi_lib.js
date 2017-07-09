var ffi = require("ffi"),
    path = require('path')

module.exports = {
  load: function(){
    var platform = process.platform,
        arch = process.arch,
        isWin = platform == "win32",
        isUnix = !isWin,

        platformParts,
        lib

    if (isWin){
      throw "Envkey currently only supports linux and OSX"
    } else if (platform == "darwin"){
      platformParts = arch == "x64" ? ["darwin-10.6-amd64"] : ["darwin-10.6-386"]
    } else {
      if (arch == "x64"){
        platformParts = ["linux-amd64", "linux-arm64", "musl"]
      } else if (arch == "ia32"){
        platformParts = ["linux-386"]
      } else {
        platformParts = ["linux-amd64", "linux-arm64", "linux-arm-7", "linux-arm-6", "linux-arm-5"]
      }
    }

    for (var i = 0; i < platformParts.length; i++) {
      var part = platformParts[i],
          libPath = path.join(__dirname, "ext", ["envkey", part].join("-"))

      try {
        console.log(libPath)
        lib = ffi.Library(libPath, {
          EnvJson: ['string', ['string']]
        })
        break
      } catch (e) {
        console.log(e)
        continue
      }
    }

    if(!lib){
      throw "There was a problem loading Envkey on your platform"
    }

    return lib
  }
}