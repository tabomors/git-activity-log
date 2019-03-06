const { google } = require('googleapis');


function generateAuthUrl(oAuth2Client, scopes) {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes,
  });
  return authUrl;
}

async function getClientsToken(oAuth2Client, code) {
  const token = oAuth2Client.getToken(code);
  return token;
}

function makeOAuth2Client(clientId, clientSecret, redirectUri) {
  const oAuth2Client = new google.auth.OAuth2(
    clientId,
    clientSecret,
    redirectUri,
  );
  return oAuth2Client;
}

function updateClientWithToken(oAuth2Client, token) {
  const updatedOAuth2Client = oAuth2Client.setCredentials(token);
  return updatedOAuth2Client;
}

module.exports = {
  getClientsToken,
  updateClientWithToken,
  generateAuthUrl,
  makeOAuth2Client,
};
