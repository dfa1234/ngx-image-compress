import {Component} from '@angular/core';
import {UploadResponse, DataUrl, NgxImageCompressService} from 'ngx-image-compress';
import {DOC_ORIENTATION} from '../../projects/ngx-image-compress/src/lib/models/DOC_ORIENTATION';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

  constructor(private imageCompress: NgxImageCompressService) {
  }

  imgResultBeforeCompress: DataUrl = '';
  imgResultAfterCompress: DataUrl = '';

  imgResultUpload: DataUrl = '';
  imgResultMultiple: UploadResponse[] = [];

  compressFile() {
    this.imageCompress.uploadFile().then(({image, orientation}:UploadResponse) => {
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

  uploadFile() {
    this.imageCompress.uploadFile().then(({image, orientation}) => {
      this.imgResultUpload = image;
      console.warn('DOC_ORIENTATION:',DOC_ORIENTATION[orientation]);
      console.warn(image);
    });
  }

  uploadMultipleFiles() {
    this.imageCompress.uploadMultipleFiles().then((multipleOrientedFiles) => {
      this.imgResultMultiple = multipleOrientedFiles;
    });
  }

}
