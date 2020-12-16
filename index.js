require('dotenv').config()
const axios = require('axios')
var jose = require('node-jose');
const querystring = require('querystring');
const fs = require('fs');

console.log("Starting OAuth for Okta API service application")

getKeyStore()
.then((keystore)=>{
    const now = Math.floor( new Date().getTime() / 1000 )
    const plus5Minutes = Math.floor((new Date(now + (5*60))))
    const tokenId = "MyTokenID"+now

    const claims = {
        //Required: the token endpoint of the authorization server
        aud: process.env.TOKEN_ENDPOINT,
        //Required: your client id as you are issuing this JWT
        iss: process.env.CLIENT_ID,
        //Required: your cliend id as you are the subject of the JWT
        sub: process.env.CLIENT_ID,
        //Required: maximum permitted expiration time is one hour in the future
        exp: plus5Minutes,
        //Optional: the time the token was created
        iat: now,
        //Optional: token identifier to prevent replay attacks.
        jti: tokenId
    };

    var key = keystore.get("appkey1")
    const opt = { compact: true, jwk: key, fields: { typ: 'jwt' } }
    const payload = JSON.stringify(claims)
    jose.JWS.createSign(opt,key).update(payload).final()
    .then((token)=>{
        console.log("Client JWT: "+token)
        console.log("Exchanging for access token")
        axios.post(process.env.TOKEN_ENDPOINT,
                querystring.stringify({
                    'grant_type':'client_credentials',
                    'scope':process.env.SCOPES,
                    'client_assertion_type':'urn:ietf:params:oauth:client-assertion-type:jwt-bearer',
                    'client_assertion':token
                }
            ))
        .then(response => {
            console.log("Successfully retrieved access token")
            console.log(response.data)
        })
        .catch(err => {
            if(err.response.data.errorSummary){
                console.log("Failed to retrieve token: "+err.response.data.errorSummary)
            }
            else {
                console.log("Failed to retrieve token: "+err.response.data.error_description)
            }
        })
    })
    .catch(error => console.log(error))
})
.catch(error => console.log(error))

function getKeyStore(){
    return new Promise(async function(resolve,reject){
        var keystore
        if(fs.existsSync('./app.key')){
            keystore = jose.JWK.asKeyStore(fs.readFileSync('./app.key', 'utf8'))
            resolve(keystore)
        }
        else{
            reject('Application JWKS not found at ./app.key, is your client registered?')
        }      
    })
}
