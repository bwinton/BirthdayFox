/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/*jshint forin:true, noarg:true, noempty:true, eqeqeq:true, bitwise:true,
  strict:true, undef:true, unused:true, curly:true, browser:true, white:true,
  moz:true, esnext:false, indent:2, maxerr:50, devel:true, node:true, boss:true,
  globalstrict:true, nomen:false, newcap:false */

/*global self:false */

"use strict";

function addThumbnails(thumbnails) {
  if (thumbnails.length === 0) {
    setTimeout(function () {
      addThumbnails(window.document.getElementsByClassName('newtab-cell'));
    }, 1000);
    return;
  }

  for (let i = 0; i < thumbnails.length; ++i) {
    let thumb = thumbnails[i];
    let thumbs = thumb.getElementsByClassName('newtab-thumbnail');
    if (thumbs.length) {
      thumb = thumbs[0];
    } else {
      thumb.style.backgroundSize = "cover";
      thumb.style.backgroundRepeat = "no-repeat";
      thumb.style.backgroundClip = "paddingBox";
    }
    let newPreview = 'url("' + self.options.thumbs[i] + '")';
    let oldPreview = thumb.style.backgroundImage;

    thumb.setAttribute('data-thumburl', self.options.thumbs[i]);
    if (self.options.showAlways) {
      thumb.style.backgroundImage = newPreview;
    } else {
      thumb.addEventListener("mouseover", function (el, image) {
        return function () {
          el.style.backgroundImage = image;
        };
      }(thumb, newPreview));

      thumb.addEventListener("mouseout", function (el, image) {
        return function () {
          el.style.backgroundImage = image;
        };
      }(thumb, oldPreview));
    }
  }
}

addThumbnails(window.document.getElementsByClassName('newtab-cell'));
