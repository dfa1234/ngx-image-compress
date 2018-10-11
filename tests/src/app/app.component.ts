import {Component, Renderer2} from '@angular/core';
import {ImageCompress} from 'ngx-image-compress/index.min';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

  constructor(private render: Renderer2) {

  }

  uploadFile() {
    ImageCompress.uploadFile(this.render, (image, orientation) => {
      console.warn(image);
      console.warn(orientation);
    });
  }

  compressFile() {
    ImageCompress.uploadFile(this.render, (image, orientation) => {
      console.warn('Size in bytes was:', ImageCompress.byteCount(image));
      ImageCompress.compress(image, orientation, this.render, 50, 50).then(
        result => {
          console.warn('Size in bytes is now:', ImageCompress.byteCount(result));
        }
      );
    });
  }

}
