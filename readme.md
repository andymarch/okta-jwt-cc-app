# JWT Client Credential Sample

This sample is a minimum working example to create a node application which
performs the OAuth client credentials grant against Okta with private_key_jwt.

## Registering

Create a `.env` file with the following values:

`
TENANT=<yourtenant>.okta.com
APP_LABEL=<your app name>
API_TOKEN=<your api token>
`

Run `npm run register` this will create a app.key JSON Web Key Set (JWKS) file
in this directory and register the application with Okta.

## Getting an access token

Add the following values to your `.env`:

`
TOKEN_ENDPOINT=https://<yourtenant>.okta.com/oauth2/v1/token
CLIENT_ID=<your client id from registeration>
SCOPES=<the scopes you require>
`