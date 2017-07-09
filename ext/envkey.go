package main

import (
  "C"
  // "bytes"
  "strings"
  // "net/http"
  // "encoding/json"
  // "io/ioutil"
  // "log"
  // "golang.org/x/crypto/openpgp"
  // "golang.org/x/crypto/openpgp/armor"
)

const defaultHost = "env-service.herokuapp.com"

type EnvResponse struct {
    Env string `json:"env"`
    EncryptedPrivkey string `json:"encrypted_privkey"`
    InheritanceOverrides string `json:"inheritance_overrides"`
}

//export EnvJson
func EnvJson(envkey *C.char) *C.char {
  split := strings.Split(C.GoString(envkey), "-")
  var envkeyParam, pw, envkeyHost string
  if (len(split) == 3){
    envkeyParam, pw, envkeyHost = split[0], split[1], split[2]
  } else {
    envkeyParam, pw = split[0], split[1]
    envkeyHost = ""
  }

  // envResponse := new(EnvResponse)
  // var err error
  // err = getJson(getJsonUrl(envkeyHost, envkeyParam), envResponse)
  // if (err != nil){
  //   return C.CString("")
  // }
  // return C.CString(getDecryptedEnvJson(envResponse, pw))

  return C.CString(envkeyParam + pw + envkeyHost)
}

// func getJsonUrl(envkeyHost string, envkeyParam string) string {
//   var host, protocol string
//   if (envkeyHost == ""){
//     host = defaultHost
//   } else {
//     host = envkeyHost
//   }

//   if (strings.Contains(host, "localhost")){
//     protocol = "http://"
//   } else {
//     protocol = "https://"
//   }

//   return protocol + host + "/" + envkeyParam
// }

// func getJson(url string, target interface{}) error {
//   r, err := http.Get(url)
//   if err != nil {
//     log.Fatal(err)
//     return err
//   }
//   defer r.Body.Close()

//   return json.NewDecoder(r.Body).Decode(target)
// }

// func getDecryptedEnvJson(envResponse *EnvResponse, pw string) string {
//   var decryptedEnvString string
//   var err error
//   decryptedEnvString, err = decrypt(envResponse.Env, envResponse.EncryptedPrivkey, pw)
//   if (err != nil){
//     return ""
//   }

//   if (envResponse.InheritanceOverrides != ""){
//     var decryptedInheritanceString string
//     decryptedInheritanceString, err = decrypt(envResponse.InheritanceOverrides, envResponse.EncryptedPrivkey, pw)
//     if (err != nil){
//       return decryptedEnvString
//     }

//     var envMap, inheritanceMap map[string]interface{}
//     json.Unmarshal([]byte(decryptedEnvString), &envMap)
//     json.Unmarshal([]byte(decryptedInheritanceString), &inheritanceMap)

//     for k, v := range inheritanceMap {
//       envMap[k] = v
//     }

//     envJson, err := json.Marshal(envMap)
//     if (err != nil){
//       return decryptedEnvString
//     }

//     return string(envJson)

//   } else {
//     return decryptedEnvString
//   }
// }

// func decrypt(cipher, privkey, pw string) (string, error) {
//   // Open the private key file
//   keyringFileBuffer := bytes.NewBufferString(privkey)
//   entityList, err := openpgp.ReadArmoredKeyRing(keyringFileBuffer)
//   if (err != nil){
//     log.Fatal(err)
//     return "", err
//   }
//   entity := entityList[0]

//   // Get the passphrase and read the private key.
//   passphraseByte := []byte(pw)
//   entity.PrivateKey.Decrypt(passphraseByte)
//   for _, subkey := range entity.Subkeys {
//     subkey.PrivateKey.Decrypt(passphraseByte)
//   }

//   // Decode armored message
//   decbuf := bytes.NewBufferString(cipher)
//   result, err := armor.Decode(decbuf)
//   if err != nil {
//     return "", err
//   }

//   // Decrypt it with the contents of the private key
//   md, err := openpgp.ReadMessage(result.Body, entityList, nil, nil)
//   if err != nil {
//     return "", err
//   }

//   bytes, err := ioutil.ReadAll(md.UnverifiedBody)
//   if err != nil {
//     return "", err
//   }

//   return string(bytes), nil
// }

func main() {}
