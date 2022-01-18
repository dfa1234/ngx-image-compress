import {Component} from '@angular/core';
import {DataUrl, DOC_ORIENTATION, NgxImageCompressService, UploadResponse,} from 'ngx-image-compress';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  imgResultBeforeCompress: DataUrl = '';
  imgResultAfterCompress: DataUrl = '';
  imgResultAfterResize: DataUrl = '';
  imgResultUpload: DataUrl = '';
  imgResultAfterResizeMax: DataUrl = '';
  imgResultMultiple: UploadResponse[] = [];

  constructor(private imageCompress: NgxImageCompressService) {
  }

  compressFile() {
    return this.imageCompress
      .uploadFile()
      .then(({image, orientation}: UploadResponse) => {
        this.imgResultBeforeCompress = image;
        console.warn('Size in bytes was:', this.imageCompress.byteCount(image));

        this.imageCompress
          .compressFile(image, orientation, 50, 50)
          .then((result: DataUrl) => {
            this.imgResultAfterCompress = result;
            console.warn(
              'Size in bytes is now:',
              this.imageCompress.byteCount(result)
            );
          });
      });
  }

  uploadFile() {
    return this.imageCompress
      .uploadFile()
      .then(({image, orientation}: UploadResponse) => {
        this.imgResultUpload = image;
        console.warn('DOC_ORIENTATION:', DOC_ORIENTATION[orientation]);
        console.warn(
          `${image.substring(0, 50)}... (${image.length} characters)`
        );
      });
  }

  uploadMultipleFiles() {
    return this.imageCompress
      .uploadMultipleFiles()
      .then((multipleOrientedFiles: UploadResponse[]) => {
        this.imgResultMultiple = multipleOrientedFiles;
        console.warn(`${multipleOrientedFiles.length} files selected`);
      });
  }

  uploadAndResize() {
    return this.imageCompress
      .uploadFile()
      .then(({image, orientation}: UploadResponse) => {
        console.warn('Size in bytes was:', this.imageCompress.byteCount(image));
        console.warn('Compressing and resizing to width 200px height 100px...');

        this.imageCompress
          .compressFile(image, orientation, 50, 50, 200, 100)
          .then((result: DataUrl) => {
            this.imgResultAfterResize = result;
            console.warn(
              'Size in bytes is now:',
              this.imageCompress.byteCount(result)
            );
          });
      });
  }

  uploadAndReturnWithMaxSize() {
    return this.imageCompress
      .uploadAndGetImageWithMaxSize(1)
      .then((result: DataUrl) => {
        this.imgResultAfterResizeMax = result;
      });
  }
}
