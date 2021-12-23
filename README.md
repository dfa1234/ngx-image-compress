## ngx-image-compress

Angular utility for compressing images to a satisfying size, that you can choose

### Import
```sh
npm i ngx-image-compress
```

### Usage

Example here: https://stackblitz.com/edit/ngx-compress-sample 

Import it in your app module (only needed for angular version < 13)

```typescript
import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';

import {AppComponent} from './app.component';
import {NgxImageCompressService} from 'ngx-image-compress';

@NgModule({
  declarations: [AppComponent],
  imports: [BrowserModule],
  providers: [NgxImageCompressService],
  bootstrap: [AppComponent]
})
export class AppModule {}
```


Use it in your component:


```typescript
import { Component } from '@angular/core';
import { NgxImageCompressService } from 'ngx-image-compress';

@Component({
  selector: 'app-root',
  template: `
    <div>
      <button (click)="compressFile()">Upload and compress Image</button>
      <img *ngIf="imgResultBeforeCompress" [src]="imgResultBeforeCompress" alt="">
      <img *ngIf="imgResultAfterCompress" [src]="imgResultAfterCompress" alt="">
    </div>
  `
})
export class AppComponent {

  constructor(private imageCompress: NgxImageCompressService) { }

  imgResultBeforeCompress: string = '';
  imgResultAfterCompress: string = '';

  compressFile() {

    this.imageCompress.uploadFile().then(({ image, orientation }) => {

      this.imgResultBeforeCompress = image;
      console.warn('Size in bytes was:', this.imageCompress.byteCount(image));

      this.imageCompress.compressFile(image, orientation, 50, 50).then(
        result => {
          this.imgResultAfterCompress = result;
          console.warn('Size in bytes is now:', this.imageCompress.byteCount(result));
        }
      );
    });
  }
}
```


### Multiple files support

For uploading multiple files, instead of using
```ts
this.imageCompress.uploadFile().then(({image, orientation}:{image:string, orientation:number}) => {
```
You can now use
```ts
this.imageCompress.uploadMultipleFiles().then((arrayOfFiles:{image:string, orientation:number}[]) => {
```

### compressFile() signature

The signature of compressFile() is:

`compressFile(image, orientation, ratio, quality, maxwidth, maxheight)`

| Parameter   | Type   | Description                                                     |
| ----------- | ------ | ----------------------------------------------------------------|
| image       | string | DataUrl (string) representing the image                         |
| orientation | number | EXIF Orientation value using the DOC_ORIENTATION enum value     |
| ratio       | number | Maximum scale factor as a percentage (optional, default: 50)    |
| quality     | number | JPEG quality factor as a percentage (optional, default: 50)     |
| maxwidth    | number | Maximum width in pixels if you need to resize (optional, default: 0 - no resize)  |
| maxheight   | number | Maximum height in pixels if you need to resize (optional, default: 0 - no resize) |



### How it works under the hood?

We will use Renderer2, and transform the image using HTML canvas encrustation.
In fact you can use the static version in the library and import renderer by yourself.


## Change log

#### 2021/12/21

* Update to Angular 13  
* Upload multiple file at once 
* Add support for resizing image size (compressFile() is now accepting maxWidth and maxHeight paramaters)
* Cleanup types
* Invalid image rejection
* General refactoring

#### 2021/11/14

Added support for max size

#### 2020/11/18

Update to Angular 11  
Fix upload for iOS  
Expose getOrientation api publically   

#### 2019/07/01

Update to Angular 8 (angular 7 is enough)  
Fix DOC_ORIENTATION import (not a required import)

#### 2019/01/09

Since Angular 6 include its own packaging system, I no longer need my webpack config to build it.
Everything is working in angular 7 without complaint now (test app is on github)

#### 2018/10/04

Adding Live example.
Everything is now working and tested but I will make some arrangement to the code in `index.ts` before submitting it again to `npm`, in order to make it more handy.

#### 2017/12/06

Upload to Github
Need some fixes and tests to be use as a static library
