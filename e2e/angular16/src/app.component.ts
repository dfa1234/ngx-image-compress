import { Component } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { NgxImageCompressService } from 'ngx-image-compress';

@Component({
  selector: 'app-root',
  template: `
    <button (click)="compressFile()">Upload and compress Image</button>
    <img
      [src]="imgResultBeforeCompression"
      *ngIf="imgResultBeforeCompression"
    />
    <img [src]="imgResultAfterCompression" *ngIf="imgResultAfterCompression" />
  `,
})
export class AppComponent {
  constructor(private imageCompress: NgxImageCompressService) {}

  imgResultBeforeCompression: string = '';
  imgResultAfterCompression: string = '';

  compressFile() {
    this.imageCompress.uploadFile().then(({ image, orientation }) => {
      this.imgResultBeforeCompression = image;
      console.log(
        'Size in bytes of the uploaded image was:',
        this.imageCompress.byteCount(image)
      );

      this.imageCompress
        .compressFile(image, orientation, 50, 50) // 50% ratio, 50% quality
        .then((compressedImage) => {
          this.imgResultAfterCompression = compressedImage;
          console.log(
            'Size in bytes after compression is now:',
            this.imageCompress.byteCount(compressedImage)
          );
        });
    });
  }
}

