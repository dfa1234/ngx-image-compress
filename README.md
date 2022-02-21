# ngx-image-compress

Angular utility for compressing images to a satisfying size, that you can choose

[![License](https://img.shields.io/npm/l/ngx-image-compress?color=5470c6)](https://github.com/ngx-image-compress/actions/blob/master/LICENSE) [![Latest npm release](https://img.shields.io/npm/v/ngx-image-compress?color=91cc75)](https://www.npmjs.com/package/ngx-image-compress) [![NPM downloads](https://img.shields.io/npm/dm/ngx-image-compress.svg?label=npm%20downloads&style=flat&color=fac858)](https://www.npmjs.com/package/ngx-image-compress) [![Contributors](https://img.shields.io/github/contributors/dfa1234/ngx-image-compress?color=3ba272)](https://github.com/dfa1234/ngx-image-compress/graphs/contributors)

[![Build Status](https://github.com/dfa1234/ngx-image-compress/actions/workflows/on-merge.yml/badge.svg)](https://github.com/dfa1234/ngx-image-compress/actions/workflows/on-merge.yml)

## Import

```sh
npm i ngx-image-compress
```

For **visualizing** code examples:  
https://stackblitz.com/edit/ngx-image-compress

For **performance tests**, in particular tests on mobile, please **do not use stackbliz**, put rather this optimised
demo, equivalent to what you get in a production-ready application:  
https://image-library.app

Angular 13+ do not need any module import. Inject the service in the constructor of your component directly.  
For any angular version **before** 13, you should first import the service in your module, like this:

```typescript
import {NgxImageCompressService} from "ngx-image-compress";

@NgModule({
  declarations: [AppComponent],
  imports: [BrowserModule],
  providers: [NgxImageCompressService],
  bootstrap: [AppComponent],
})
export class AppModule {
}
```

## Usage

Here how to use the service in your component.

### Using upload and compress function, independently

This option is giving control over the compression process.

compressFile() signature is detailed [here](#compressFile)

```typescript
import {Component} from "@angular/core";
import {NgxImageCompressService} from "ngx-image-compress";

@Component({
  selector: "app-root",
  template: `
      <button (click)="compressFile()">Upload and compress Image</button>
      <img [src]="imgResultBeforeCompression" *ngIf="imgResultBeforeCompression" />
      <img [src]="imgResultAfterCompression" *ngIf="imgResultAfterCompression"  />
  `,
})
export class AppComponent {

  constructor(private imageCompress: NgxImageCompressService) {
  }

  imgResultBeforeCompression: string = "";
  imgResultAfterCompression: string = "";

  compressFile() {
    this.imageCompress.uploadFile().then(
      ({image, orientation}) => {

        this.imgResultBeforeCompression = image;
        console.log("Size in bytes of the uploaded image was:", this.imageCompress.byteCount(image));

        this.imageCompress
          .compressFile(image, orientation, 50, 50) // 50% ratio, 50% quality
          .then(
            (compressedImage) => {
              this.imgResultAfterCompression = compressedImage;
              console.log("Size in bytes after compression is now:", this.imageCompress.byteCount(compressedImage));
            }
          );
      }
    );
  }
}
```

### Performing a single upload, and compressing automatically to a given max size

Quicker method.

Getting directly an image at a maximum of "X" MegaBytes, using an optimised algorithm:

```typescript
import {Component} from "@angular/core";
import {NgxImageCompressService} from "ngx-image-compress";

@Component({
  selector: "app-root",
  template: `
      <button (click)="compressFile()">Upload and compress Image</button>
      <img [src]="imgResult" *ngIf="imgResult" />
  `,
})
export class AppComponent {

  constructor(private imageCompress: NgxImageCompressService) {
  }

  imgResult: string = "";

  compressFile() {
    const MAX_MEGABYTE = 2;
    this.imageCompress
      .uploadAndGetImageWithMaxSize(MAX_MEGABYTE) // this function can provide debug information using (MAX_MEGABYTE,true) parameters
      .then(
        (result: string) => {
          this.imgResult = result;
        },
        (result: string) => {
          console.error('The compression algorithm didn\'t succed! The best size we can do is', this.imageCompress.byteCount(result), 'bytes')
          this.imgResult = result;
        });
  }
}
```

### Multiple files support

For uploading multiple files, instead of using

```ts
this.imageCompress.uploadFile()
  .then((singleFile: { image: string, orientation: number }) => //...
```

You can use

```ts
this.imageCompress.uploadMultipleFiles()
  .then((arrayOfFiles: { image: string, orientation: number }[]) => //...
```

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

<a name="fn1">[1]</a> Ratio: "50" will decrease the resolution of each dimension by 2, i.e.:
image of 2000 X 1500 pixels will become 1000 X 750 pixels, while the whole resolution will be reduced by 4.

<a name="fn2">[2]</a> Quality: For more info about this parameter,
read [this guide](http://fotoforensics.com/tutorial-estq.php)

## How it works under the hood?

We will use Renderer2, and transform the image using HTML canvas encrustation. In fact you can use the static version in
the library and import renderer by yourself, or remplace it with another DOM abstraction,
using  [RendererFactory2](https://angular.io/api/core/RendererFactory2).

There are mainly two advantage for using Renderer2 abstraction over direct DOM manipulation, using `ElementRef`
or `window.document` directly.

* Angular keeps the component & the view in sync using Templates, data binding & change detection. All of them are
  bypassed when we update the DOM Directly.
* DOM Manipulation works only in a browser. You will not able to use the App in other platforms like in a web worker, in
  server (by using Server-side rendering), in a mobile or desktop app, etc... where there is no browser.
* The DOM APIs do not sanitize the data. Hence, it is possible to inject a script, thereby, opening our app an easy
  target for the XSS injection attack.

## Change log

### 2022/02/22

- Fix Exif rotation for new version of Chrome 79+
- Native upload for Safari browser

### 2022/01/19

- Implementing a built-in algorithm, looping several times, to reach a desired max size in Megabytes
- Readme updates and docs in method signature directly

### 2022/01/04

- Readme update
- CI/CD with github action

### 2021/12/21

- Update to Angular 13
- Upload multiple file at once
- Add support for resizing image size (compressFile() is now accepting maxWidth and maxHeight paramaters)
- Cleanup types
- Invalid image rejection
- General refactoring

### 2021/11/14

- Added support for max size

### 2020/11/18

- Update to Angular 11
- Fix upload for iOS
- Expose getOrientation api publically

### 2019/07/01

- Update to Angular 8 (angular 7 is enough)
- Fix DOC_ORIENTATION import (not a required import)

### 2019/01/09

- Since Angular 6 include its own packaging system, I no longer need my webpack config to build it.
- Everything is working in angular 7 without complaint now (test app is on github)

### 2018/10/04

- Adding Live example.
- Everything is now working and tested but I will make some arrangement to the code in `index.ts` before submitting it
  again to `npm`, in order to make it more handy.

### 2017/12/06

- Upload to Github
- Need some fixes and tests to be use as a static library
