module.exports =
/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__(1);


/***/ }),
/* 1 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "DOC_ORIENTATION", function() { return DOC_ORIENTATION; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "ImageCompress", function() { return ImageCompress; });
var DOC_ORIENTATION;
(function (DOC_ORIENTATION) {
    DOC_ORIENTATION[DOC_ORIENTATION["Up"] = 1] = "Up";
    DOC_ORIENTATION[DOC_ORIENTATION["Down"] = 3] = "Down";
    DOC_ORIENTATION[DOC_ORIENTATION["Right"] = 6] = "Right";
    DOC_ORIENTATION[DOC_ORIENTATION["Left"] = 8] = "Left";
    DOC_ORIENTATION[DOC_ORIENTATION["UpMirrored"] = 2] = "UpMirrored";
    DOC_ORIENTATION[DOC_ORIENTATION["DownMirrored"] = 4] = "DownMirrored";
    DOC_ORIENTATION[DOC_ORIENTATION["LeftMirrored"] = 5] = "LeftMirrored";
    DOC_ORIENTATION[DOC_ORIENTATION["RightMirrored"] = 7] = "RightMirrored";
    DOC_ORIENTATION[DOC_ORIENTATION["NotJpeg"] = -1] = "NotJpeg";
    DOC_ORIENTATION[DOC_ORIENTATION["NotDefined"] = -2] = "NotDefined";
})(DOC_ORIENTATION || (DOC_ORIENTATION = {}));
var ImageCompress = /** @class */ (function () {
    function ImageCompress() {
    }
    /**
     * Get the correct Orientation value from tags, in order to write correctly in our canvas
     * @param {File} file
     * @param {(result: DOC_ORIENTATION) => void} callback
     */
    ImageCompress.getOrientation = function (file, callback) {
        var reader = new FileReader();
        try {
            reader.onload = function ($event) {
                var view = new DataView(reader.result);
                if (view.getUint16(0, false) != 0xFFD8)
                    return callback(-2);
                var length = view.byteLength, offset = 2;
                while (offset < length) {
                    var marker = view.getUint16(offset, false);
                    offset += 2;
                    if (marker == 0xFFE1) {
                        if (view.getUint32(offset += 2, false) != 0x45786966)
                            return callback(-1);
                        var little = view.getUint16(offset += 6, false) == 0x4949;
                        offset += view.getUint32(offset + 4, little);
                        var tags = view.getUint16(offset, little);
                        offset += 2;
                        for (var i = 0; i < tags; i++)
                            if (view.getUint16(offset + (i * 12), little) == 0x0112)
                                return callback(view.getUint16(offset + (i * 12) + 8, little));
                    }
                    else if ((marker & 0xFF00) != 0xFF00)
                        break;
                    else
                        offset += view.getUint16(offset, false);
                }
                return callback(-1);
            };
            reader.readAsArrayBuffer(file);
        }
        catch (e) {
            return callback(0);
        }
    };
    /**
     * return a callback with the new image data and image orientation
     * @param render
     * @param callBack
     */
    ImageCompress.uploadFile = function (render, callBack) {
        var inputElement = render.createElement("input");
        render.setStyle(inputElement, "display", "none");
        render.setProperty(inputElement, "type", "file");
        render.listen(inputElement, "click", function ($event) {
            //javascript teachable moment
            console.log('MouseEvent:', $event);
            console.log('Input:', $event.target);
            $event.target.value = null;
        });
        render.listen(inputElement, "change", function ($event) {
            var file = $event.target.files[0];
            var myReader = new FileReader();
            myReader.onloadend = function (e) {
                try {
                    ImageCompress.getOrientation(file, function (orientation) {
                        callBack(myReader.result, orientation);
                    });
                }
                catch (e) {
                    console.log("ERROR " + e);
                    callBack(null, null);
                }
            };
            try {
                myReader.readAsDataURL(file);
            }
            catch (e) {
                console.log("ERROR - probably no file have been selected: " + e);
                callBack(null, null);
            }
        });
        inputElement.click();
    };
    ImageCompress.compress = function (imageDataUrlSource, orientation, render, ratio, quality) {
        if (ratio === void 0) { ratio = 50; }
        if (quality === void 0) { quality = 50; }
        return new Promise(function (resolve, reject) {
            quality = quality / 100;
            ratio = ratio / 100;
            var sourceImage = new Image();
            //important for safari: we need to wait for onload event
            sourceImage.onload = function () {
                var canvas = render.createElement('canvas');
                var ctx = canvas.getContext("2d");
                var w, h;
                w = sourceImage.naturalWidth;
                h = sourceImage.naturalHeight;
                if (orientation == DOC_ORIENTATION.Right || orientation == DOC_ORIENTATION.Left) {
                    var t = w;
                    w = h;
                    h = t;
                }
                canvas.width = w * ratio;
                canvas.height = h * ratio;
                var TO_RADIANS = Math.PI / 180;
                if (orientation == DOC_ORIENTATION.Up) {
                    ctx.drawImage(sourceImage, 0, 0, canvas.width, canvas.height);
                }
                else if (orientation == DOC_ORIENTATION.Right) {
                    ctx.save();
                    ctx.rotate(90 * TO_RADIANS);
                    ctx.translate(0, -canvas.width);
                    ctx.drawImage(sourceImage, 0, 0, canvas.height, canvas.width);
                    ctx.restore();
                }
                else if (orientation == DOC_ORIENTATION.Left) {
                    ctx.save();
                    ctx.rotate(-90 * TO_RADIANS);
                    ctx.translate(-canvas.width, 0);
                    ctx.drawImage(sourceImage, 0, 0, canvas.height, canvas.width);
                    ctx.restore();
                }
                else if (orientation == DOC_ORIENTATION.Down) {
                    ctx.save();
                    ctx.rotate(180 * TO_RADIANS);
                    ctx.translate(-canvas.width, -canvas.height);
                    ctx.drawImage(sourceImage, 0, 0, canvas.width, canvas.height);
                    ctx.restore();
                }
                else {
                    console.error('Wrong orientation value');
                    //same as default UP
                    ctx.drawImage(sourceImage, 0, 0, canvas.width, canvas.height);
                }
                var mime = imageDataUrlSource.substr(5, imageDataUrlSource[0].length);
                //TODO test on mime
                var result = canvas.toDataURL(mime, quality);
                resolve(result);
            };
            sourceImage.src = imageDataUrlSource;
        });
    };
    /**
     * helper to evaluate the compression rate
     * @param s the image in base64 string format
     */
    ImageCompress.byteCount = function (s) { return encodeURI(s).split(/%..|./).length - 1; };
    return ImageCompress;
}());



/***/ })
/******/ ]);
//# sourceMappingURL=index.js.map