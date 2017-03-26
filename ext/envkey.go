package main

import (
  "C"
  "bytes"
  "strings"
  "net/http"
  "encoding/json"
  "io/ioutil"
  "log"
  "golang.org/x/crypto/openpgp"
  "golang.org/x/crypto/openpgp/armor"
)

const urlBase = "https://env-service.herokuapp.com/"

type EnvResponse struct {
    Env string `json:"env"`
    EncryptedPrivkey string `json:"encrypted_privkey"`
}

//export EnvJson
func EnvJson(envkey *C.char) *C.char {
  split := strings.Split(C.GoString(envkey), "-")
  envkeyParam, pw := split[0], split[1]
  envResponse := new(EnvResponse)
  var err error
  err = getJson(urlBase + envkeyParam, envResponse)
  if (err != nil){
    return C.CString("")
  }
  var decrypted string
  decrypted, err = decrypt(envResponse.Env, envResponse.EncryptedPrivkey, pw)
  if (err != nil){
    return C.CString("")
  }

  return C.CString(decrypted)
}

func getJson(url string, target interface{}) error {
  r, err := http.Get(url)
  if err != nil {
    log.Fatal(err)
    return err
  }
  defer r.Body.Close()

  return json.NewDecoder(r.Body).Decode(target)
}

func decrypt(cipher, privkey, pw string) (string, error) {
  // Open the private key file
  keyringFileBuffer := bytes.NewBufferString(privkey)
  entityList, err := openpgp.ReadArmoredKeyRing(keyringFileBuffer)
  if (err != nil){
    log.Fatal(err)
    return "", err
  }
  entity := entityList[0]

  // Get the passphrase and read the private key.
  passphraseByte := []byte(pw)
  entity.PrivateKey.Decrypt(passphraseByte)
  for _, subkey := range entity.Subkeys {
    subkey.PrivateKey.Decrypt(passphraseByte)
  }

  // Decode armored message
  decbuf := bytes.NewBufferString(cipher)
  result, err := armor.Decode(decbuf)
  if err != nil {
    return "", err
  }

  // Decrypt it with the contents of the private key
  md, err := openpgp.ReadMessage(result.Body, entityList, nil, nil)
  if err != nil {
    return "", err
  }

  bytes, err := ioutil.ReadAll(md.UnverifiedBody)
  if err != nil {
    return "", err
  }

  return string(bytes), nil
}

func main() {}
