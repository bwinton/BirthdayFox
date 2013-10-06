/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/*jshint forin:true, noarg:true, noempty:true, eqeqeq:true, bitwise:true,
  strict:true, undef:true, unused:true, curly:true, browser:true, white:true,
  moz:true, esnext:false, indent:2, maxerr:50, devel:true, node:true, boss:true,
  globalstrict:true, nomen:false, newcap:false */

"use strict";

var clipboard = require('sdk/clipboard');
var cm = require('sdk/context-menu');
var Etherpad = require('./etherpad').Etherpad;
var etherpad = new Etherpad('thumbnail-gifs');
var prefs = require('sdk/simple-prefs');
var self = require('sdk/self');
var tabs = require('sdk/tabs');
var timeout = require('sdk/timers').setTimeout;
var _ = require('sdk/l10n').get;

var worker = null;
var menuitem;  // Context menu item to copy thumbnail URL.

etherpad.setDefaults([
  'http://stream1.gifsoup.com/view6/4837440/foxfly-o.gif, Description 1',
  'http://people.mozilla.org/~smartell/meme/ASM.gif, Description 2',
  'http://people.mozilla.org/~smartell/meme/grumpy-kit-webkit.gif, Description 3',
  'http://stream1.gifsoup.com/view3/4838677/firefoxlive-o.gif, Description 4',
  'http://stream1.gifsoup.com/view3/4838679/cropcircle-o.gif, Description 5',
  'http://stream1.gifsoup.com/view6/4838684/persona-o.gif, Description 6',
  'http://stream1.gifsoup.com/view4/4838687/fastest-o.gif, Description 7',
  'http://stream1.gifsoup.com/view2/4838695/kuru-o.gif, Description 8',
  'http://stream1.gifsoup.com/view4/4838696/socialapi-o.gif, Description 9',
  'http://stream1.gifsoup.com/view3/4838697/ffandroid-o.gif, Description 10',
  'http://gickr.com/results3/anim_4f540eb3-504c-7464-91f6-6e4682f0e947.gif, Description 11',
  'http://stream1.gifsoup.com/view4/4838703/ff4-o.gif, Description 12',
  'http://stream1.gifsoup.com/view5/4838708/foxprojections-o.gif, Description 13',
  'http://stream1.gifsoup.com/view3/4838711/addons-o.gif, Description 14'
]);

var addContentScript = function (tab, doneTrying) {
  if (tab.url === 'about:blank' && !doneTrying) {
    // Wait a second and see if it's better then.
    timeout(function () {
      addContentScript(tab, true);
    }, 500);
  }
  if (tab.url === 'about:newtab') {
    var thumbs = etherpad.getRandomItems(9);
    worker = tab.attach({
      contentScriptFile: self.data.url('newtabicons-content.js'),
      contentScriptOptions: { 'thumbs' : thumbs,
                              'header': _('header_text'),
                              'showPref' : prefs.prefs.newtabicons2 }
    });
    worker.port.on('toggle clicked', function () {
      var pref = prefs.prefs.newtabicons2;
      pref += 1;
      pref %= 4;
      prefs.prefs.newtabicons2 = pref;
    });
    worker.port.emit('showPrefUpdated', prefs.prefs.newtabicons2);
  }
};

var tabOpen = function (tab) {
  if (!tab) {
    tab = tabs.activeTab;
  }
  addContentScript(tab);
};

var run = function () {
  if (worker) {
    return;
  }

  etherpad.loadPlaceholders();
  tabs.on('open', tabOpen);
  tabOpen();
};

var addMenuItem = function () {
  if (!menuitem) {
    menuitem = cm.Item({
      label: _('copy_thumbnail_url'),
      context: [
        cm.URLContext('about:newtab'),
        cm.SelectorContext('.newtab-cell')
      ],
      contentScript: 'self.on("click", function(node, data) {' +
                     '  self.postMessage(node.dataset.thumburl);' +
                     '});',
      onMessage: function (thumbUrl) {
        clipboard.set(thumbUrl);
      }
    });
    menuitem.image = null;
  }
};

var removeMenuItem = function () {
  if (menuitem) {
    menuitem.destroy();
    menuitem = null;
  }
};

var listener = function () {
  if (worker) {
    worker.port.emit('showPrefUpdated', prefs.prefs.newtabicons2);
  }
  if (prefs.prefs.newtabicons2 === 0 || prefs.prefs.newtabicons2 === 3) {
    removeMenuItem();
  } else {
    addMenuItem();
  }
};

exports.load = function () {
  prefs.on('newtabicons2', listener);
  run();
  listener();
};

exports.unload = function () {
  prefs.removeListener('newtabicons2', listener);
  tabs.removeListener('open', tabOpen);
};
