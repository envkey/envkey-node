var dotenv = require("dotenv"),
    path = require('path'),
    os = require('os'),
    childProcess = require('child_process'),
    execFile = childProcess.execFile,
    execFileSync = childProcess.execFileSync

function pickPermitted(vars, opts){
  if (opts && opts.permitted && opts.permitted.length){
    var res = {}
    for (k in vars){
      if (opts.permitted.indexOf(k) != -1){
        res[k] = vars[k]
      }
    }
    return res
  } else {
    return vars
  }
}

function applyVarsToEnv(vars){
  var varsSet = {}
  for (k in vars){
    if(!process.env[k]){
      var val = vars[k]
      process.env[k] = val
      varsSet[k] = val
    }
  }

  console.log("ENVKEY: vars loaded and decrypted - access with process.env.YOUR_VAR_NAME")

  return varsSet
}

function getKey(opts){
  if (opts.dotEnvFile){
    dotenv.load({path: "./" + opts.dotEnvFile})
  } else {
    dotenv.config()
  }

  return process.env.ENVKEY
}

function keyError(){
  "Envkey invalid. Couldn't load vars."
}

function throwKeyError(){
  throw "Envkey invalid. Couldn't load vars."
}

function load(optsOrCb, maybeCb){
  var opts = typeof optsOrCb == "object" ? optsOrCb : {},
      cb = typeof optsOrCb == "function" ? optsOrCb : maybeCb,
      key = getKey(opts)

  if (key){
    if (cb){
      fetch(key, opts, function(err, vars){
        if(err){
          cb(err)
        } else {
          cb(null, applyVarsToEnv(vars))
        }
      })
    } else {
      return applyVarsToEnv(fetch(key, opts))
    }
  } else if (cb){
    cb(null, {})
  } else {
    return {}
  }
}

function fetch(keyOrCbOrOpts, optsOrCb, maybeCb){
  var key, opts, cb

  if (typeof keyOrCbOrOpts == "object"){
    opts = keyOrCbOrOpts
  } else if (typeof optsOrCb == "object"){
    opts = optsOrCb
  } else {
    opts = {}
  }

  key = typeof keyOrCbOrOpts == "string" ? keyOrCbOrOpts : getKey(opts)

  if (typeof keyOrCbOrOpts == "function"){
    cb = keyOrCbOrOpts
  } else if (typeof optsOrCb == "function"){
    cb = optsOrCb
  } else {
    cb = maybeCb
  }

  if(!key && cb){
    return cb(null, {})
  } else if (!key){
    return {}
  }

  var platform = os.platform(),
      arch = os.arch(),
      platformPart,
      archPart

  switch (platform){
    case 'darwin':
    case 'freebsd':
    case 'openbsd':
    case 'linux':
      platformPart = platform
      break
    case 'win32':
      platformPart = "windows"
      break
    default:
      platformPart = "linux"
  }

  switch (arch){
    case 'arm':
    case 'arm64':
      archPart = "arm"
      break
    case 'ia32':
    case 'x32':
    case 'x86':
    case 'mips':
    case 'mipsel':
    case 'ppc':
    case 's390':
      archPart = "386"
      break
    case 'x64':
    case 'ppc64':
    case 's390x':
      archPart = "amd64"
      break
    default:
      archPart = "386"
  }

  var ext = platformPart == "windows" ? ".exe" : "",
      filePath = path.join(__dirname, "ext", ["envkey-fetch", platformPart, archPart].join("-")) + ext,
      isDev = ["development", "test"].indexOf(process.env.NODE_ENV) > -1,
      execArgs = [key, (isDev ? "--cache" : "")]

  if (cb){
    var child = execFile(filePath, execArgs)

    child.on("exit", function(code, signal){
      if (code === 0){
        child.stdout.setEncoding("utf-8")
        var json = JSON.parse(child.stdout.read())
        cb(null, pickPermitted(json, opts))
      } else {
        child.stderr.setEncoding("utf-8")
        cb(keyError())
      }
    })
  } else {
    try {
      var res = execFileSync(filePath, execArgs).toString()
      if(!res || !res.trim())throwKeyError()
      var json = JSON.parse(res.toString())
      if(!json || typeof json == "string")throwKeyError()
      return pickPermitted(json, opts)
    } catch (e){
      throwKeyError()
    }
  }
}

module.exports = { load: load, fetch: fetch}
