'use strict';
const path = require('path');
const settings = require('../../settings');
const http = require('http');

let port;

// Helper function to support HTTP redirects
function getHttp (url) {
  return new Promise( function(resolve, reject) {
    http.get(url, function (res) {
      switch(res.statusCode) {
        case 200:
          resolve(res);
          break;
        case 302: // redirect
          resolve(httpGet(res.headers.location));
          break;
        default:
          reject(new Error("Unexpected status-code:" + res.statusCode));
      }
    })
  });
}

function playButtonSound(player, values) {

  const audioUrl = "http://serlibutton.cleverapps.io/api/button/button-sound";

  return getHttp(audioUrl).then(function (res) {
    res.setEncoding('utf8');
      let rawData = '';
      res.on('data', (chunk) => { rawData += chunk; });
      res.on('end', () => {
        try {
          const parsedData = JSON.parse(rawData);
          const obj = parsedData[0];
          const sound = obj["sound"];
          const link = `http://localhost:5005/soundbox/${sound}`;
          getHttp(link);
        } catch (e) {
          console.error(e.message);
        }
      });
  }).catch( function(err) {
    // Oops, something went wrong
    console.error(err.message);
  })
}

module.exports = function (api) {
  port = api.getPort();
  api.registerAction('button-sound', playButtonSound);
}
