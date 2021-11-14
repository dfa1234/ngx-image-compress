import {Component} from '@angular/core';
import {NgxImageCompressService} from 'ngx-image-compress';

type DataUrl = string;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

  constructor(private imageCompress: NgxImageCompressService) {}

  imgResultBeforeCompress: DataUrl;
  imgResultAfterCompress: DataUrl;


  imgResultUpload: DataUrl;

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

  uploadFile() {
    this.imageCompress.uploadFile().then(({image, orientation}) => {
      this.imgResultUpload = image;
      console.warn(image);
      console.warn(orientation);
    });
  }


}
