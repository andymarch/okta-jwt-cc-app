require('dotenv').config()
const axios = require('axios')
var jose = require('node-jose');
const fs = require('fs');

// This is a helper implementation to generate key material and get your client
// registered to the IDP.
console.log("Performing registration...")
getKeyStore()
.then((keystore) => keystore.get('appkey1'))
.then((key) => createApplication(key.toJSON()))
.then((data) => console.log(data.label + " created with clientid " + data.id))
.catch(err => console.log(err))

function getKeyStore(){
    return new Promise(async function(resolve,reject){
        var keystore
        if(fs.existsSync('./app.key')) {
            console.log("Using existing JWKS keystore ./app.key")
            keystore = jose.JWK.asKeyStore(fs.readFileSync('./app.key', 'utf8'))
            resolve(keystore)
        }
        else {
            keystore = jose.JWK.createKeyStore();
            console.log("No key material found creating new RSA keypair")
            var props = {
                kid: 'appkey1',
                alg: 'RS256',
                use: 'sig'
              };
            await keystore.generate("RSA",2048,props)
            output = keystore.toJSON(true);
            fs.writeFileSync('./app.key', JSON.stringify(output),'utf8')
            console.log("JWKS written to ./app.key")
            resolve(keystore)
        }      
    })
}

function createApplication(publickey){
    return new Promise(async function (resolve, reject) {
        if(process.env.API_TOKEN == null) {
            reject("API_TOKEN not declared in .env file unable to register client. Set this value and rerun register.")
        }
        else {
            try {
                var appName = (process.env.APP_LABEL != null) 
                    ? process.env.APP_LABEL 
                    : "Service App " + Math.floor( new Date().getTime() / 1000 )

                var payload = {
                    "name": "oidc_client",
                    "label": appName,
                    "signOnMode": "OPENID_CONNECT",
                    "credentials": {
                        "oauthClient": {
                        "token_endpoint_auth_method": "private_key_jwt"
                        }
                    },
                    "settings": {
                        "oauthClient": {
                        "response_types": [
                            "token"
                        ],
                        "grant_types": [
                            "client_credentials"
                        ],
                        "application_type": "service",
                        "jwks":{
                            "keys": [
                                publickey
                            ]
                        }
                        }
                    }
                }
                var response = await axios.post(
                    "https://"+process.env.TENANT+"/api/v1/apps",
                    payload,
                    {
                        headers: {
                            Authorization: 'SSWS '+process.env.API_TOKEN
                        }
                    }
                )
                resolve(response.data)
            }
            catch (err){
                reject(err)
            }
        }
    })
}