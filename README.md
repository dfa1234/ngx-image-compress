# ngx-image-compress

Angular utility for compressing images to a satisfying size, that you can choose

![Build](https://github.com/dfa1234/ngx-image-compress/actions/workflows/on-merge.yml/badge.svg) ![Downloads](https://img.shields.io/npm/dw/ngx-image-compress)

## Import

```sh
npm i ngx-image-compress
```

## Usage

Code example is here:  
https://stackblitz.com/edit/ngx-compress-sample

For performance tests, in particular on mobile, please **do not use stackbliz**, put rather this optimised demo:  
https://ngx-image-compress.web.app/

Angular 13+ do not need any import. Inject the service directly.  
For any angular version **before** 13, you should first import the service in your module, like this:

```typescript
import { NgxImageCompressService } from "ngx-image-compress";

@NgModule({
  declarations: [AppComponent],
  imports: [BrowserModule],
  providers: [NgxImageCompressService],
  bootstrap: [AppComponent],
})
export class AppModule {}
```

Here how to use the service in your component:

```typescript
import { Component } from "@angular/core";
import { NgxImageCompressService } from "ngx-image-compress";

@Component({
  selector: "app-root",
  template: `
    <div>
      <button (click)="compressFile()">Upload and compress Image</button>
      <img
        *ngIf="imgResultBeforeCompress"
        [src]="imgResultBeforeCompress"
        alt=""
      />
      <img
        *ngIf="imgResultAfterCompress"
        [src]="imgResultAfterCompress"
        alt=""
      />
    </div>
  `,
})
export class AppComponent {
  constructor(private imageCompress: NgxImageCompressService) {}

  imgResultBeforeCompress: string = "";
  imgResultAfterCompress: string = "";

  compressFile() {
    this.imageCompress.uploadFile().then(({ image, orientation }) => {
      this.imgResultBeforeCompress = image;
      console.warn("Size in bytes was:", this.imageCompress.byteCount(image));

      this.imageCompress
        .compressFile(image, orientation, 50, 50)
        .then((result) => {
          this.imgResultAfterCompress = result;
          console.warn(
            "Size in bytes is now:",
            this.imageCompress.byteCount(result)
          );
        });
    });
  }
}
```

## Multiple files support

For uploading multiple files, instead of using

```ts
this.imageCompress.uploadFile().then(({image, orientation}:{image:string, orientation:number}) => {
```

You can now use

```ts
this.imageCompress.uploadMultipleFiles().then((arrayOfFiles:{image:string, orientation:number}[]) => {
```

## compressFile() signature

The signature of compressFile() is:

`compressFile(image, orientation, ratio, quality, maxwidth, maxheight)`

| Parameter   | Type   | Description                                                                       |
| ----------- | ------ | --------------------------------------------------------------------------------- |
| image       | string | DataUrl (string) representing the image                                           |
| orientation | number | EXIF Orientation value using the DOC_ORIENTATION enum value                       |
| ratio       | number | Maximum scale factor as a percentage (optional, default: 50) \*                   |
| quality     | number | JPEG quality factor as a percentage (optional, default: 50) \*\*                  |
| maxwidth    | number | Maximum width in pixels if you need to resize (optional, default: 0 - no resize)  |
| maxheight   | number | Maximum height in pixels if you need to resize (optional, default: 0 - no resize) |

\* ratio of 50 will decrease the resolution by 2. i.e. image of 2000 X 1500 pixels will become 1000 X 750 pixels  
\*\* For more info about this parameter, read [this guide](http://fotoforensics.com/tutorial-estq.php)

## How it works under the hood?

We will use Renderer2, and transform the image using HTML canvas encrustation.
In fact you can use the static version in the library and import renderer by yourself.

## Change log

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
- Everything is now working and tested but I will make some arrangement to the code in `index.ts` before submitting it again to `npm`, in order to make it more handy.

### 2017/12/06

- Upload to Github
- Need some fixes and tests to be use as a static library
