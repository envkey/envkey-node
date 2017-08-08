
function clearEnv(){
  delete process.env.ENVKEY
  delete process.env.GO_TEST
  delete process.env.GO_TEST_2
}

test('it should load and decrypt environment via require autoload', () => {
  process.env.ENVKEY = "zvHpsWR9Fx44xYP1MM7D-4kfqz28Sr6eiD9G3-localhost:8090"
  require("../index.js")
  expect(process.env.GO_TEST).toBe("it")
  expect(process.env.GO_TEST_2).toBe("works!")
  clearEnv()
})

test('it should raise an error with an invalid envkey', ()=> {
  process.env.ENVKEY = "zvHpsWR9Fx44xYP1MM7D-4kfqz28Sr6eiD9G3invalid-localhost:8090"
  expect(()=> {
    var loader = require("../loader.js")
    loader.load()
  }).toThrow(/Envkey invalid/)
  clearEnv()
})

test('it should load and decrypt environment via loader - synchronously', () => {
  process.env.ENVKEY = "zvHpsWR9Fx44xYP1MM7D-4kfqz28Sr6eiD9G3-localhost:8090"
  var loader = require("../loader.js")
  loader.load()
  expect(process.env.GO_TEST).toBe("it")
  expect(process.env.GO_TEST_2).toBe("works!")
  clearEnv()
})

test('it should load and decrypt environment via loader - asynchronously', () => {
  process.env.ENVKEY = "zvHpsWR9Fx44xYP1MM7D-4kfqz28Sr6eiD9G3-localhost:8090"
  var loader = require("../loader.js")
  loader.load(function(){
    expect(process.env.GO_TEST).toBe("it")
    expect(process.env.GO_TEST_2).toBe("works!")
    clearEnv()
  })
})

test('it uses whitelist with "permitted" option', () => {
  process.env.ENVKEY = "zvHpsWR9Fx44xYP1MM7D-4kfqz28Sr6eiD9G3-localhost:8090"
  var loader = require("../loader.js")
  loader.load({permitted: ["GO_TEST"]})
  expect(process.env.GO_TEST).toBe("it")
  expect(process.env.GO_TEST_2).toBeUndefined()
  clearEnv()
})

