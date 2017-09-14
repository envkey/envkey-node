
const VALID_ENVKEY = "Emzt4BE7C23QtsC7gb1z-3NvfNiG1Boy6XH2o-env-staging.envkey.com",
      INVALID_ENVKEY = "Emzt4BE7C23QtsC7gb1z-3NvfNiG1Boy6XH2oinvalid-env-staging.envkey.com",
      INVALID_ENVKEY2 = "Emzt4BE7C23QtsC7gb1zinvalid-3NvfNiG1Boy6XH2o-env-staging.envkey.com",
      INVALID_ENVKEY3 = "Emzt4BE7C23QtsC7gb1zinvalid-3NvfNiG1Boy6XH2o-localhost:387946",
      INVALID_ENVKEY4 = "invalid"

function clearEnv(){
  delete process.env.ENVKEY
  delete process.env.TEST
  delete process.env.TEST_2
}

test('it should load and decrypt environment via require autoload', () => {
  process.env.ENVKEY = VALID_ENVKEY
  require("../index.js")
  expect(process.env.TEST).toBe("it")
  expect(process.env.TEST_2).toBe("works!")
  clearEnv()
})

test('it should load and decrypt environment via loader - synchronously', () => {
  process.env.ENVKEY = VALID_ENVKEY
  var loader = require("../loader.js")
  loader.load()
  expect(process.env.TEST).toBe("it")
  expect(process.env.TEST_2).toBe("works!")
  clearEnv()
})

test('it should raise an error with an invalid envkey', ()=> {
  process.env.ENVKEY = INVALID_ENVKEY
  expect(()=> {
    var loader = require("../loader.js")
    loader.load()
  }).toThrow(/ENVKEY invalid/)
  clearEnv()

  process.env.ENVKEY = INVALID_ENVKEY2
  expect(()=> {
    var loader = require("../loader.js")
    loader.load()
  }).toThrow(/ENVKEY invalid/)
  clearEnv()

  process.env.ENVKEY = INVALID_ENVKEY3
  expect(()=> {
    var loader = require("../loader.js")
    loader.load()
  }).toThrow(/ENVKEY invalid/)
  clearEnv()

  process.env.ENVKEY = INVALID_ENVKEY4
  expect(()=> {
    var loader = require("../loader.js")
    loader.load()
  }).toThrow(/ENVKEY invalid/)
  clearEnv()
})


test('it should load and decrypt environment via loader', () => {
  process.env.ENVKEY = VALID_ENVKEY
  var loader = require("../loader.js")
  loader.load(function(){
    expect(process.env.TEST).toBe("it")
    expect(process.env.TEST_2).toBe("works!")
    clearEnv()
  })
})

test('it should not overwrite an existing process.env var', () => {
  process.env.ENVKEY = VALID_ENVKEY
  process.env.TEST = "otherthing"
  var loader = require("../loader.js")
  loader.load()
  expect(process.env.TEST).toBe("otherthing")
  expect(process.env.TEST_2).toBe("works!")
  clearEnv()
})

test('it uses whitelist with "permitted" option', () => {
  process.env.ENVKEY = VALID_ENVKEY
  var loader = require("../loader.js")
  loader.load({permitted: ["TEST"]})
  expect(process.env.TEST).toBe("it")
  expect(process.env.TEST_2).toBeUndefined()
  clearEnv()
})

test('it not ovewrrite existing process.env var with "permitted" option', () => {
  process.env.ENVKEY = VALID_ENVKEY
  process.env.TEST = "otherthing"
  var loader = require("../loader.js")
  loader.load({permitted: ["TEST"]})
  expect(process.env.TEST).toBe("otherthing")
  expect(process.env.TEST_2).toBeUndefined()
  clearEnv()
})

