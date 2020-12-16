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

Run `npm run register` this will create a JSON Web Key Set (JWKS) file named app.key
in this directory and register the application with Okta.

You can clear your .env file now.

## Manage your scopes

In the Okta admin interface find your newly created app and set the scopes you require your application to be able to request.

## Getting an access token

Add the following values to your `.env`:

`
TOKEN_ENDPOINT=https://<yourtenant>.okta.com/oauth2/v1/token
CLIENT_ID=<your client id from registeration>
SCOPES=<the scopes you require>
`
Run `npm run start`, this will call the token endpoint with a jwt signed with the private key from app.key and print the response to the console this should include the access token.
