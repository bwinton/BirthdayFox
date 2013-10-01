/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/*jshint forin:true, noarg:true, noempty:true, eqeqeq:true, bitwise:true,
  strict:true, undef:true, unused:true, curly:true, browser:true, white:true,
  moz:true, esnext:false, indent:2, maxerr:50, devel:true, node:true, boss:true,
  globalstrict:true, nomen:false, newcap:false */

"use strict";

const { Class } = require('sdk/core/heritage');
var locale = require('sdk/preferences/service').get('general.useragent.locale', 'en-US');
var Request = require('sdk/request').Request;
var timeout = require('sdk/timers').setTimeout;

const Etherpad = Class({
  initialize: function initialize(page) {
    this.PLACEHOLDERS = {};
    this.page = page;
    this.urls = [
      'https://raw.github.com/bwinton/BirthdayFox/gh-pages/' + locale + '/' + this.page + '.txt',
      'https://raw.github.com/bwinton/BirthdayFox/gh-pages/' + this.page + '.txt',
    ];
  },

  setDefaults: function (defaults) {
    this.PLACEHOLDERS = defaults;
  },

  loadPlaceholders: function () {
    var self = this;
    console.log("BW: Loading data for " + self.urls[0]);
    new Request({
      url: self.urls[0],
      onComplete: function (response) {
        if (response.text.length < 100 || response.status < 200 || response.status >= 300) {
          if (self.urls.length > 1) {
            console.log("BW: " + self.urls[0] + " failed.  Popping.");
            self.urls.shift();
            timeout(self.loadPlaceholders.bind(self), 1);
          } else {
            console.log("BW: " + self.urls[0] + " failed.  Nothing left to pop.");
          }
          return;
        }
        var result = response.text.split('\n');
        result = result.map(function (x) {
          return x.trim();
        }).filter(function (x) {
          return !x.startsWith('#') && (x !== '');
        });
        self.PLACEHOLDERS = result;
      }
    }).get();
    timeout(self.loadPlaceholders.bind(self), 4 * 60 * 60 * 1000);
  },

  getItem: function (id, values) {
    if (!values) {
      values = this.PLACEHOLDERS;
    }
    return values[id % values.length];
  },

  getRandomItem: function () {
    var id = Math.floor(Math.random() * this.PLACEHOLDERS.length);
    return this.getItem(id);
  },

  getRandomItems: function (n) {
    var rv = [];
    var values = this.PLACEHOLDERS.slice(0);

    for (var i = 0; i < n; ++i) {
      var id = Math.floor(Math.random() * values.length);
      var item = this.getItem(id, values);
      values.splice(id, 1);
      rv.push(item);
    }
    return rv;
  }

});
exports.Etherpad = Etherpad;