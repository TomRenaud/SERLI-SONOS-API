'use strict';
const path = require('path');
const settings = require('../../settings');
const allPlayerAnnouncement = require('../helpers/all-player-announcement');
const fileDuration = require('../helpers/file-duration');
const mp3Duration = require('mp3-duration');
const https = require("https");
const mm = require('music-metadata');
const util = require('util')

let port;

// Helper function to support HTTP redirects
function httpGet (url) {
  return new Promise( function(resolve, reject) {
    https.get(url, function (res) {
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

function playSoundBoxOnAll(player, values) {
  const clipFileName = values[0] + ".mp3";
  const audioUrl = `https://soundbox.cleverapps.io/sounds/${clipFileName}`;
  let announceVolume = settings.announceVolume || 90;

  console.log(clipFileName);
  console.log(audioUrl);

  if (/^\d+$/i.test(values[1])) {
    // first parameter is volume
    announceVolume = values[1];
  }

  // Stream MP3 sample file from GitHub via HTTP
  return httpGet(audioUrl).then(function (res) {
    // Parse the MP3 audio stream
    const mimeType = res.headers['content-type'];
    return mm.parseStream(res, mimeType, { duration: true })
      .then( function(metadata) {
        allPlayerAnnouncement(player.system, audioUrl, announceVolume, metadata.format.duration + 10000);
        player.coordinator.clearQueue();
      })
  }).catch( function(err) {
    // Oops, something went wrong
    console.error(err.message);
  })
}

module.exports = function (api) {
  port = api.getPort();
  api.registerAction('soundbox', playSoundBoxOnAll);
}
