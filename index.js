var dotenv = require("dotenv").config()


if (process.env.ENVKEY){
  var ffi = require("ffi"),
      path = require('path')

  var libPath = path.join(process.cwd(), "node_modules", "envkey", "ext", "envkey"),
      lib = ffi.Library(libPath, {
        EnvJson: ['string', ['string']]
      })

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

