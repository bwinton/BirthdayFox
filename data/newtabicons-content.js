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

function mouseOverListener(e) {
  let cell = e.currentTarget;
  let thumb = e.currentTarget;
  let thumbs = thumb.getElementsByClassName('newtab-thumbnail');
  if (thumbs.length) {
    thumb = thumbs[0];
  }

  thumb.style.backgroundImage = e.currentTarget.dataset.newPreview;
  var titles = cell.getElementsByClassName("newtab-title");
  console.log(e.currentTarget.tagName, e.currentTarget.className, titles, titles.length);
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
  var titles = cell.getElementsByClassName("newtab-title");
  console.log(e.currentTarget.tagName, e.currentTarget.className, titles, titles.length);
  for (let i = 0; i < titles.length; ++i) {
    titles[i].style.display = 'block';
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

  var toggle = document.getElementById("newtab-toggle");
  switch (self.options.showPref) {
  case 0:
    toggle.setAttribute("title", "Show whimsical thumbnails on hover");
    break;
  case 1:
    toggle.setAttribute("title", "Always show whimsical thumbnails");
    break;
  case 2:
    toggle.setAttribute("title", "Hide the new tab page");
    break;
  case 3:
    toggle.setAttribute("title", "Show the plain new tab page");
  }

  for (let i = 0; i < cells.length; ++i) {
    let cell = cells[i];
    let thumb = cells[i];
    let thumbs = thumb.getElementsByClassName('newtab-thumbnail');
    if (thumbs.length) {
      thumb = thumbs[0];
    }

    console.log(cell.tagName, cell.className, thumb.tagName, thumb.className);

    switch (self.options.showPref) {
    case 0:
    case 3:
      thumb.style.backgroundImage = thumb.dataset.oldPreview;
      cell.removeEventListener("mouseover", mouseOverListener);
      cell.removeEventListener("mouseout", mouseOutListener);
      break;
    case 1:
      thumb.style.backgroundImage = thumb.dataset.oldPreview;
      cell.addEventListener("mouseover", mouseOverListener);
      cell.addEventListener("mouseout", mouseOutListener);
      break;
    case 2:
      thumb.style.backgroundImage = thumb.dataset.newPreview;
      cell.removeEventListener("mouseover", mouseOverListener);
      cell.removeEventListener("mouseout", mouseOutListener);
      break;
    }
  }
  var controls = document.getElementsByClassName("newtab-control");
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
  var titles = document.getElementsByClassName("newtab-title");
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
      thumb.style.backgroundSize = "cover";
      thumb.style.backgroundRepeat = "no-repeat";
      thumb.style.backgroundClip = "paddingBox";
    }
    cell.dataset.newPreview = 'url("' + self.options.thumbs[i] + '")';
    cell.dataset.oldPreview = thumb.style.backgroundImage;
    cell.dataset.thumburl = self.options.thumbs[i];
  }
  updateThumbnails();
}

function overrideToggle() {
  // Tell the add-on when the toggle is clicked…
  var toggle = document.getElementById("newtab-toggle");
  toggle.onclick = function () {
    self.port.emit('toggle clicked', {});
  };
  // And eventually it'll tell us what the new value of the pref is…
  self.port.on('showPrefUpdated', function (e) {
    self.options.showPref = e;
    gAllPages.enabled = self.options.showPref !== 3;
    updateThumbnails();
  });
}

addThumbnails(window.document.getElementsByClassName('newtab-cell'));
overrideToggle();
