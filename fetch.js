var commandLineArgs = require('command-line-args'),
    openpgp = require('openpgp'),
    request = require('request'),
    optionDefinitions = [{name: "key", type: String}],
    args = commandLineArgs(optionDefinitions),
    key = args.key

if (!key)process.exit()

var defaultHost = "env-service.herokuapp.com"

try {
  envJson(key, function(err, res){
    if (err){
      process.stderr.write(err.toString())
      process.exit(1)
    } else {
      process.stdout.write(JSON.stringify(res))
      process.exit()
    }
  })
} catch (err){
  process.stderr.write(err.toString())
  process.exit(1)
}

function envJson(envkey, cb){
  var split = envkey.split("-"),
      envkeyParam = split[0],
      pw = split[1],
      envkeyHost = split[2]

  getJson(getJsonUrl(envkeyHost, envkeyParam), function(err, envResponse){
    if(err){
      cb(err)
    } else {
      getDecryptedEnvJson(envResponse, pw, cb)
    }
  })
}

function getJsonUrl(envkeyHost, envkeyParam){
  var host = envkeyHost ? envkeyHost : defaultHost,
      protocol = host.indexOf("localhost") > -1 ? "http://" : "https://"

  return protocol + host + "/" + envkeyParam
}

function getJson(url, cb){
  request(url, {json: true}, function (err, response) {
    if (err){
      cb(err)
    } else if(response.statusCode != 200){
      cb(new Error("Request error"))
    } else {
      cb(null, response.body)
    }
  })
}

function getDecryptedEnvJson(envResponse, pw, cb){
  decryptPrivateKey(envResponse.encrypted_privkey, pw, function(err, decryptedPrivkey){
    if(err){
      cb(err)
    } else {
      decryptJson(envResponse.env, decryptedPrivkey, null, function(err, decryptedEnv){
        if(err){
          cb(err)
        } else if (envResponse.inheritance_overrides){
          decryptJson(envResponse.inheritance_overrides, decryptedPrivkey, null, function(err, decryptedInheritanceOverrides){
            if(err){
              cb(err)
            } else {
              for (k in decryptedInheritanceOverrides){
                decryptedEnv[k] = decryptedInheritanceOverrides[k]
              }
              cb(null, decryptedEnv)
            }
          })
        } else {
          cb(null, decryptedEnv)
        }
      })
    }
  })
}

function decrypt(cipher, privkey, pw, cb){
  decryptPrivateKey(privkey, pw, function(err, decryptedPrivkey){
    if(err){
      cb(err)
    } else {
      decryptJson(cipher, decryptedPrivkey, null, cb)
    }
  })
}

function decryptPrivateKey(privkey, passphrase, cb){
  openpgp.decryptKey({
    privateKey: openpgp.key.readArmored(privkey).keys[0],
    passphrase: passphrase
  })
  .catch(cb)
  .then(function(res){cb(null, res.key.armor())})

}

function decryptJson(encrypted, privkey, pubkey, cb){
  openpgp.decrypt({
    message: openpgp.message.readArmored(encrypted),
    privateKey: openpgp.key.readArmored(privkey).keys[0],
    publicKeys: (pubkey ? openpgp.key.readArmored(pubkey).keys : undefined)
  })
  .catch(cb)
  .then(function(res){ cb(null, JSON.parse(res.data)) })

}

