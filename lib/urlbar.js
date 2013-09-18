/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/*jshint forin:true, noarg:true, noempty:true, eqeqeq:true, bitwise:true,
  strict:true, undef:true, unused:true, curly:true, browser:true, white:true,
  moz:true, esnext:false, indent:2, maxerr:50, devel:true, node:true, boss:true,
  globalstrict:true, nomen:false, newcap:false */

"use strict";

var Etherpad = require('./etherpad').Etherpad;
var etherpad = new Etherpad('urlbar-sayings');
var prefs = require('sdk/simple-prefs');
var tabs = require('sdk/tabs');
var winutils = require('sdk/window/utils');

etherpad.setDefaults([
  'Happy Birthday Firefox!',
  'Only seven more years until you can drive!',
  '🎂',
  '🍰',
  '🎁',
  '🎆',
  '🎉',
  '🎊',
  '👏'
]);

var original = 'Search or enter address';

var tabActivate = function (tab) {
  var window = winutils.getMostRecentBrowserWindow();
  window.gURLBar.placeholder = etherpad.getItem(tab.id);
};

var run = function () {
  var window = winutils.getMostRecentBrowserWindow();
  original = window.gURLBar.placeholder;
  window.gURLBar.placeholder = etherpad.getItem(0);
  etherpad.loadPlaceholders();
  tabs.on('activate', tabActivate);
  tabActivate(tabs.activeTab);
};

var stop = function () {
  tabs.removeListener('activate', tabActivate);
  var window = winutils.getMostRecentBrowserWindow();
  window.gURLBar.placeholder = original;
};

var listener = function () {
  if (prefs.prefs.urlbar) {
    run();
  } else {
    stop();
  }
};

exports.load = function () {
  prefs.on('urlbar', listener);
  listener('urlbar');
};

exports.unload = function () {
  stop();
  prefs.removeListener('urlbar', listener);
};