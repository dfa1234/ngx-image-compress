# ngx-image-compress

Angular utility for compressing images to a satisfying size, that you can choose

[![License](https://img.shields.io/npm/l/ngx-image-compress?color=5470c6)](https://github.com/ngx-image-compress/actions/blob/master/LICENSE)
[![Latest npm release](https://img.shields.io/npm/v/ngx-image-compress?color=91cc75)](https://www.npmjs.com/package/ngx-image-compress)
[![NPM downloads](https://img.shields.io/npm/dm/ngx-image-compress.svg?label=npm%20downloads&style=flat&color=fac858)](https://www.npmjs.com/package/ngx-image-compress)
[![Contributors](https://img.shields.io/github/contributors/dfa1234/ngx-image-compress?color=3ba272)](https://github.com/dfa1234/ngx-image-compress/graphs/contributors)

[![Build Status](https://github.com/dfa1234/ngx-image-compress/actions/workflows/on-merge.yml/badge.svg)](https://github.com/dfa1234/ngx-image-compress/actions/workflows/on-merge.yml)

## Import

```sh
npm i ngx-image-compress
```

-   For **visualizing** code examples: https://stackblitz.com/edit/ngx-image-compress
-   For **performance tests**, in particular on your mobile, please **do not use stackbliz**, put this production-ready application:
    https://image-library.app
-   Compatible with any Angular **version > 9**
-   If you use Angular **version < 9**, you can use `npm install ngx-image-compress@view-engine`

Angular 13+ differ as there is no need to import the service in your module. You can inject the service in the constructor of your component
directly.  
For any angular version **before 13**, you should first import the service in your module, like this:

```typescript
import {NgxImageCompressService} from 'ngx-image-compress';

@NgModule({
    declarations: [AppComponent],
    imports: [BrowserModule],
    providers: [NgxImageCompressService],
    bootstrap: [AppComponent],
})
export class AppModule {}
```

## Usage

Here how to use the service in your component.

### Using upload and compress function, independently

This option is giving control over the compression process.

compressFile() signature is detailed [here](#compressFile)

```typescript
import {Component} from '@angular/core';
import {NgxImageCompressService} from 'ngx-image-compress';

@Component({
    selector: 'app-root',
    template: `
        <button (click)="compressFile()">Upload and compress Image</button>
        <img [src]="imgResultBeforeCompression" *ngIf="imgResultBeforeCompression" />
        <img [src]="imgResultAfterCompression" *ngIf="imgResultAfterCompression" />
    `,
})
export class AppComponent {
    constructor(private imageCompress: NgxImageCompressService) {}

    imgResultBeforeCompression: string = '';
    imgResultAfterCompression: string = '';

    compressFile() {
        this.imageCompress.uploadFile().then(({image, orientation}) => {
            this.imgResultBeforeCompression = image;
            console.log('Size in bytes of the uploaded image was:', this.imageCompress.byteCount(image));

            this.imageCompress
                .compressFile(image, orientation, 50, 50) // 50% ratio, 50% quality
                .then(compressedImage => {
                    this.imgResultAfterCompression = compressedImage;
                    console.log('Size in bytes after compression is now:', this.imageCompress.byteCount(compressedImage));
                });
        });
    }
}
```

### Performing a single upload, and compressing automatically to a given max size

Quicker and effortless method.

Getting directly an image at a maximum of "X" MegaBytes, using a built-in algorithm:

```typescript
import {Component} from '@angular/core';
import {NgxImageCompressService} from 'ngx-image-compress';

@Component({
    selector: 'app-root',
    template: `
        <button (click)="compressFile()">Upload and compress Image</button>
        <img [src]="imgResult" *ngIf="imgResult" />
    `,
})
export class AppComponent {
    constructor(private imageCompress: NgxImageCompressService) {}

    imgResult: string = '';

    compressFile() {
        const MAX_MEGABYTE = 2;
        this.imageCompress
            .uploadAndGetImageWithMaxSize(MAX_MEGABYTE) // this function can provide debug information using (MAX_MEGABYTE,true) parameters
            .then(
                (result: string) => {
                    this.imgResult = result;
                },
                (result: string) => {
                    console.error(
                        "The compression algorithm didn't succed! The best size we can do is",
                        this.imageCompress.byteCount(result),
                        'bytes'
                    );
                    this.imgResult = result;
                }
            );
    }
}
```

### Same method but without the upload step

```ts
this.imageCompress.getImageWithMaxSizeAndMetas({image: 'base64ValueFromYourUpload'},MAX_MEGABYTE).then
```

### Multiple files support

For uploading multiple files, instead of using

```ts
this.imageCompress.uploadFile()
  .then((singleFile: { image: string, fileName:string, orientation: number }) => //...
```

You can use

```ts
this.imageCompress.uploadMultipleFiles()
  .then((arrayOfFiles: { image: string, fileName:string, orientation: number }[]) => //...
```

### Behavior if no files have been selected

With `uploadFile()` and `uploadMultipleFiles()`, nothing will happen when the user is selecting nothing, close the file selection, and
cancel the upload.

If you want the upload promise to reject in such case, please use: `uploadFileOrReject()` or `uploadMultipleFilesOrReject()` instead.

## compressFile() signature

<a name="compressFile">The signature of compressFile()</a> is:

`compressFile(image, orientation, ratio, quality, maxWidth, maxHeight)`

| Parameter   | Type   | Description                                                                       |
| ----------- | ------ | --------------------------------------------------------------------------------- |
| image       | string | DataUrl (string) representing the image                                           |
| orientation | number | EXIF Orientation value using the DOC_ORIENTATION enum value                       |
| ratio       | number | Maximum scale factor as a percentage (optional, default: 50) <sup>[1](#fn1)</sup> |
| quality     | number | JPEG quality factor as a percentage (optional, default: 50) <sup>[2](#fn2)</sup>  |
| maxWidth    | number | Maximum width in pixels if you need to resize (optional, default: 0 - no resize)  |
| maxHeight   | number | Maximum height in pixels if you need to resize (optional, default: 0 - no resize) |

<a name="fn1">[1]</a> Ratio: "50" will decrease the resolution of each dimension by 2, i.e.: image of 2000 X 1500 pixels will become 1000 X
750 pixels, while the whole resolution will be reduced by 4.

<a name="fn2">[2]</a> Quality: For more info about this parameter, read [this guide](http://fotoforensics.com/tutorial-estq.php)

## How it works under the hood?

We will use Renderer2, and transform the image using HTML canvas encrustation. In fact you can use the static version in the library and
import renderer by yourself, or replace it with another DOM abstraction, using
[RendererFactory2](https://angular.io/api/core/RendererFactory2).

There are mainly two advantage for using Renderer2 abstraction over direct DOM manipulation (by using `ElementRef` or `window.document`
directly).

-   Angular keeps the component and the view in sync using templates, data binding, and change detection. All of them are bypassed when we
    update the DOM Directly.
-   DOM Manipulation works only in a browser. In the future we will not be able to use other platforms like web worker, in-server (for
    Server-Side Rendering), in a mobile or a desktop application, etc... where there is no browser.
-   The DOM APIs do not sanitize the data. Hence, it is possible to inject a script, thereby, opening our app to XSS injection attacks.

That's being said, please note that because of some iOS limitations/bugs when using Renderer2, we still are using `window.document` API, for
the upload part only (not the canvas itself).

## Change log

### 2023/02/14

-   Update transpilation builder to angular 15 (Every angular version from 9+ are still supported, for version bellow 9 please check
    https://www.npmjs.com/package/ngx-image-compress-legacy)
-   iOS version 13+ devices are now well recognized, and the upload method using native DOM api is used in accordance to it. This should
    help a lot of Ionic developers.

### 2022/05/24

-   Every angular version from 9+ are now supported.
-   No need to update the library after each angular release, by using now semantic versionning.
-   Every version before 9 are dropped because angular 13 only compile library ivy-compatible.
-   Anyway, if you really need to use this library in you old angular app we created here a npm transpiled version in compatibily mode with
    View Engine: https://www.npmjs.com/package/ngx-image-compress-legacy

### 2022/05/10

-   Adding new API to reject promise if the user close the upload windows and no files are selected (`uploadFileOrReject` and
    `uploadMultipleFileOrReject`)  
    New functions avoid any breaking change in existing code, no changes are necessary, you can still use `uploadFile` or `uploadMultiple`.
    With these, the promise stays silent when the user cancel the upload selection.
-   Adding the file name in the upload result

### 2022/02/22

-   Fix Exif rotation for new version of Chrome 79+
-   Native upload for Safari browser

### 2022/01/19

-   Implementing a built-in algorithm, looping several times, to reach a desired max size in Megabytes
-   Readme updates and docs in method signature directly

### 2022/01/04

-   Readme update
-   CI/CD with github action

### 2021/12/21

-   Update to Angular 13
-   Upload multiple file at once
-   Add support for resizing image size (compressFile() is now accepting maxWidth and maxHeight paramaters)
-   Cleanup types
-   Invalid image rejection
-   General refactoring

### 2021/11/14

-   Added support for max size

### 2020/11/18

-   Update to Angular 11
-   Fix upload for iOS
-   Expose getOrientation api publically

### 2019/07/01

-   Update to Angular 8 (angular 7 is enough)
-   Fix DOC_ORIENTATION import (not a required import)

### 2019/01/09

-   Since Angular 6 include its own packaging system, I no longer need my webpack config to build it.
-   Everything is working in angular 7 without complaint now (test app is on github)

### 2018/10/04

-   Adding Live example.
-   Everything is now working and tested but I will make some arrangement to the code in `index.ts` before submitting it again to `npm`, in
    order to make it more handy.

### 2017/12/06

-   Upload to Github
-   Need some fixes and tests to be use as a static library
