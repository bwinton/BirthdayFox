/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/*jshint forin:true, noarg:true, noempty:true, eqeqeq:true, bitwise:true,
  strict:true, undef:true, unused:true, curly:true, browser:true, white:true,
  moz:true, esnext:false, indent:2, maxerr:50, devel:true, node:true, boss:true,
  globalstrict:true, nomen:false, newcap:false */

/*global self:false, gAllPages:false */

"use strict";

var header;
var undoContainer;

function mouseOverListener(e) {
  let cell = e.currentTarget;
  let thumb = e.currentTarget;
  let thumbs = thumb.getElementsByClassName('newtab-thumbnail');
  if (thumbs.length) {
    thumb = thumbs[0];
  }

  thumb.style.backgroundImage = e.currentTarget.dataset.newPreview;
  thumb.style.backgroundSize = 'auto';
  thumb.style.backgroundPosition = 'center';
  var titles = cell.getElementsByClassName('newtab-title');
  for (let i = 0; i < titles.length; ++i) {
    titles[i].style.display = 'none';
  }

  e.preventDefault();
  return true;
}

function mouseOutListener(e) {
  let cell = e.currentTarget;
  let thumb = e.currentTarget;
  let thumbs = thumb.getElementsByClassName('newtab-thumbnail');
  if (thumbs.length) {
    thumb = thumbs[0];
  }

  thumb.style.backgroundImage = e.currentTarget.dataset.oldPreview;
  thumb.style.backgroundSize = 'cover';
  thumb.style.backgroundPosition = '0% 0%';

  var titles = cell.getElementsByClassName('newtab-title');
  for (let i = 0; i < titles.length; ++i) {
    titles[i].style.display = 'block';
  }

  var overlays = cell.getElementsByClassName('newtab-overlay');
  for (let i = 0; i < overlays.length; ++i) {
    overlays[i].style.opacity = '0';
  }

  e.preventDefault();
  return true;
}


function overlayListener(e) {
  let cell = e.currentTarget;

  var overlays = cell.getElementsByClassName('newtab-overlay');
  for (let i = 0; i < overlays.length; ++i) {
    switch (self.options.showPref) {
    case 0:
    case 1:
    case 3:
      overlays[i].style.opacity = '0';
      break;
    case 2:
      overlays[i].style.opacity = '0.8';
      break;
    }
  }

  e.preventDefault();
  return true;
}

function outlayListener(e) {
  let cell = e.currentTarget;

  var overlays = cell.getElementsByClassName('newtab-overlay');
  for (let i = 0; i < overlays.length; ++i) {
    overlays[i].style.opacity = '0';
  }

  e.preventDefault();
  return true;
}

function updateThumbnails() {
  var cells = window.document.getElementsByClassName('newtab-cell');
  if (cells.length === 0) {
    setTimeout(updateThumbnails, 500);
    return;
  }

  var toggle = document.getElementById('newtab-toggle');
  switch (self.options.showPref) {
  case 0:
    toggle.setAttribute('title', 'Show whimsical thumbnails on hover');
    undoContainer.style.display = '';
    header.style.display = 'none';
    break;
  case 1:
    toggle.setAttribute('title', 'Always show whimsical thumbnails');
    undoContainer.style.display = 'none';
    header.style.display = '';
    break;
  case 2:
    toggle.setAttribute('title', 'Hide the new tab page');
    undoContainer.style.display = 'none';
    header.style.display = '';
    break;
  case 3:
    toggle.setAttribute('title', 'Show the plain new tab page');
    undoContainer.style.display = 'none';
    header.style.display = 'none';
  }

  for (let i = 0; i < cells.length; ++i) {
    let cell = cells[i];
    let thumb = cells[i];
    let thumbs = thumb.getElementsByClassName('newtab-thumbnail');
    if (thumbs.length) {
      thumb = thumbs[0];
    }

    let overlay = null;
    let overlays = cell.getElementsByClassName('newtab-overlay');
    if (overlays.length) {
      overlay = overlays[0];
    }

    cell.addEventListener('mouseover', overlayListener);
    cell.addEventListener('mouseout', outlayListener);

    switch (self.options.showPref) {
    case 0:
    case 3:
      cell.removeEventListener('mouseover', mouseOverListener);
      cell.removeEventListener('mouseout', mouseOutListener);
      thumb.style.backgroundImage = cell.dataset.oldPreview;
      thumb.style.backgroundSize = 'cover';
      thumb.style.backgroundPosition = '0% 0%';
      overlay.style.zIndex = '-5';
      break;
    case 1:
      cell.addEventListener('mouseover', mouseOverListener);
      cell.addEventListener('mouseout', mouseOutListener);
      thumb.style.backgroundImage = cell.dataset.oldPreview;
      thumb.style.backgroundSize = 'cover';
      thumb.style.backgroundPosition = '0% 0%';
      overlay.style.zIndex = '-5';
      break;
    case 2:
      cell.removeEventListener('mouseover', mouseOverListener);
      cell.removeEventListener('mouseout', mouseOutListener);
      thumb.style.backgroundImage = cell.dataset.newPreview;
      thumb.style.backgroundSize = 'auto';
      thumb.style.backgroundPosition = 'center';
      overlay.style.zIndex = '5';
      break;
    }
  }
  var controls = document.getElementsByClassName('newtab-control');
  for (let i = 0; i < controls.length; ++i) {
    let control = controls[i];
    switch (self.options.showPref) {
    case 0:
    case 3:
      control.style.display = 'block';
      break;
    case 1:
    case 2:
      control.style.display = 'none';
      break;
    }
  }
  var titles = document.getElementsByClassName('newtab-title');
  for (let i = 0; i < titles.length; ++i) {
    let title = titles[i];
    switch (self.options.showPref) {
    case 0:
    case 3:
    case 1:
      title.style.display = 'block';
      break;
    case 2:
      title.style.display = 'none';
      break;
    }
  }

}


var thumbRE = /([^,]*),(.*)/;

function makeOverlay(node, text) {
  var newDiv = document.createElement('div');
  newDiv.className = 'newtab-overlay';
  var newContent = document.createTextNode(text);

  newDiv.appendChild(newContent); //add the text node to the newly created div.
  newDiv.style.opacity = '0';
  newDiv.style.position = 'absolute';
  newDiv.style.background = '#333';
  newDiv.style.color = '#eee';
  newDiv.style.padding = '7px';
  newDiv.style.left = '0px';
  newDiv.style.top = '0px';
  newDiv.style.right = '0px';
  newDiv.style.bottom = '0px';
  newDiv.style.transition = 'opacity .5s';

  // add the newly created element and its content into the DOM
  node.appendChild(newDiv);
  newDiv.addEventListener('mouseover', overlayListener);
  newDiv.addEventListener('mouseout', outlayListener);
}

function addThumbnails(cells) {
  if (cells.length === 0) {
    setTimeout(function () {
      addThumbnails(window.document.getElementsByClassName('newtab-cell'));
    }, 1000);
    return;
  }

  for (let i = 0; i < cells.length; ++i) {
    let cell = cells[i];
    let thumb = cells[i];
    let thumbs = thumb.getElementsByClassName('newtab-thumbnail');
    if (thumbs.length) {
      thumb = thumbs[0];
    } else {
      thumb.style.backgroundSize = 'auto';
      thumb.style.backgroundPosition = 'center';
      thumb.style.backgroundRepeat = 'no-repeat';
      thumb.style.backgroundClip = 'paddingBox';
    }
    let matches = thumbRE.exec(self.options.thumbs[i]);
    if (!matches) {
      matches = [null, self.options.thumbs[i], ''];
    }
    let url = matches[1].trim();
    let overlay = matches[2].trim();

    cell.border = '#CDCFD1';
    cell.dataset.newPreview = 'url("' + url + '")';
    cell.dataset.oldPreview = thumb.style.backgroundImage;
    cell.dataset.thumburl = url;
    cell.style.position = 'relative';
    makeOverlay(cell, overlay);
  }
  updateThumbnails();
}

function oneTimeInitialization() {
  // Tell the add-on when the toggle is clicked…
  var toggle = document.getElementById('newtab-toggle');
  toggle.onclick = function () {
    self.port.emit('toggle clicked', {});
  };
  // And eventually it'll tell us what the new value of the pref is…
  self.port.on('showPrefUpdated', function (e) {
    self.options.showPref = e;
    gAllPages.enabled = self.options.showPref !== 3;
    updateThumbnails();
  });

  undoContainer = document.getElementById('newtab-undo-container');
  header = document.createElement('div');
  header.innerHTML = self.options.header;
  header.style.font = '25px/1.8 "Lucida Grande", sans-serif';
  var top = document.getElementById('newtab-margin-top');
  top.appendChild(header);
}

oneTimeInitialization();
addThumbnails(window.document.getElementsByClassName('newtab-cell'));
