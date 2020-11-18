## ngx-image-compress

Angular utility for compressing images to a satisfying size, that you can choose


### Import
```sh
npm i ngx-image-compress
```

### Usage

Example here: https://stackblitz.com/edit/ngx-compress-sample 

Import it in your app module

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


Use it in your component


```typescript
import {Component} from '@angular/core';
import {NgxImageCompressService} from 'ngx-image-compress';


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

  constructor(private imageCompress: NgxImageCompressService) {}
  
  imgResultBeforeCompress:string;
  imgResultAfterCompress:string;

  compressFile() {
  
    this.imageCompress.uploadFile().then(({image, orientation}) => {
    
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

### How it's working underwood?

We will use Renderer2, and transform the image multiple time through HTML canvas encrustation.
In fact you can use the static version into the library and import renderer by yourself.


## Updates

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


