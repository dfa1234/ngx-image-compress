import {Renderer2} from '@angular/core';
import {UploadResponse} from './models/upload-response';
import {DOC_ORIENTATION} from './models/DOC_ORIENTATION';
import {DataUrl} from './models/data-url';

export class ImageCompress {

  /**
   * Get the correct Orientation value from tags, in order to write correctly in our canvas
   */
  static getOrientation = (file: File): Promise<DOC_ORIENTATION> => new Promise<DOC_ORIENTATION>((resolve, reject) => {
    try {
      const reader = new FileReader();
      reader.onload = () => {
        const view = new DataView(reader.result as ArrayBuffer);
        if (view.getUint16(0, false) !== 0xFFD8) {
          return resolve(DOC_ORIENTATION.NotDefined);
        }
        const length = view.byteLength;
        let offset = 2;
        while (offset < length) {
          const marker = view.getUint16(offset, false);
          offset += 2;
          if (marker === 0xFFE1) {
            if (view.getUint32(offset += 2, false) !== 0x45786966) {
              return resolve(DOC_ORIENTATION.NotJpeg);
            }
            const little = view.getUint16(offset += 6, false) === 0x4949;
            offset += view.getUint32(offset + 4, little);
            const tags = view.getUint16(offset, little);
            offset += 2;
            for (let i = 0; i < tags; i++) {
              if (view.getUint16(offset + (i * 12), little) === 0x0112) {
                return resolve(view.getUint16(offset + (i * 12) + 8, little));
              }
            }
          } else if ((marker & 0xFF00) !== 0xFF00) {
            break;
          } else {
            offset += view.getUint16(offset, false);
          }
        }
        return resolve(DOC_ORIENTATION.NotJpeg);
      };
      reader.readAsArrayBuffer(file);
    } catch (e) {
      return reject(DOC_ORIENTATION.Default);
    }

  });


  /**
   * return a promise with the new image data and image orientation
   */
  static uploadFile = (render: Renderer2, multiple: boolean = true): Promise<UploadResponse | UploadResponse[]> =>
    new Promise(function (resolve, reject) {
      ImageCompress.generateUploadInput(render, multiple).then(filesList => {
        const files = Array.from(filesList);
        const orientationPromises = files.map(file => ImageCompress.getOrientation(file));
        const readerPromises = files.map(file => ImageCompress.fileToDataURL(file));

        let orientationsResult: DOC_ORIENTATION[] = [];

        Promise.all(orientationPromises)
          .then((orientations: DOC_ORIENTATION[]) => {
            orientationsResult = orientations;
            return Promise.all(readerPromises);
          })
          .then(readerResult => {
            if (multiple) {
              const result = readerResult.map((image, index) => ({image, orientation: orientationsResult[index]}));
              resolve(result);
            } else {
              resolve({image: readerResult[0], orientation: orientationsResult[0]});
            }
          });
      });


    });


  static fileToDataURL = (file: File): Promise<string> => {
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e: any) => { //myReader.onloadend = (progressEvent: ProgressEvent<FileReader>)
        resolve(e.target.result);
      };
      try {
        reader.readAsDataURL(file);
      } catch (e) {
        reject(`ngx-image-compress - probably no file have been selected: ${e}`);
      }
    });
  };

  static generateUploadInput = (render: Renderer2, multiple: boolean = true) => new Promise<FileList>((resolve, reject) => {

    const inputElement = render.createElement('input');
    // should be fix the problem for safari/ios
    document.getElementsByTagName('body')?.[0]?.append(inputElement);
    render.setStyle(inputElement, 'display', 'none');
    render.setProperty(inputElement, 'type', 'file');
    render.setProperty(inputElement, 'accept', 'image/*');

    if (multiple) {
      render.setProperty(inputElement, 'multiple', 'true');
    }

    render.listen(inputElement, 'click', ($event: MouseEvent) => {
      ($event.target as any as HTMLInputElement).value = '';
    });

    render.listen(inputElement, 'change', ($event) => {
      const files: FileList = $event.target.files;
      resolve(files);
    });
    inputElement.click();

  });


  static compress = (imageDataUrlSource: DataUrl,
                     orientation: DOC_ORIENTATION,
                     render: Renderer2,
                     ratio: number = 50,
                     quality: number = 50): Promise<string> => new Promise(function (resolve, reject) {

    quality = quality / 100;
    ratio = ratio / 100;
    const sourceImage = new Image();

    // important for safari: we need to wait for onload event
    sourceImage.onload = () => {
      const canvas: HTMLCanvasElement = render.createElement('canvas');
      const ctx: CanvasRenderingContext2D | null = canvas.getContext('2d');

      if (!ctx) {
        return reject(`No canvas context available`);
      }

      let w = sourceImage.naturalWidth;
      let h = sourceImage.naturalHeight;

      if (orientation === DOC_ORIENTATION.Right || orientation === DOC_ORIENTATION.Left) {
        const t = w;
        w = h;
        h = t;
      }

      canvas.width = w * ratio;
      canvas.height = h * ratio;


      const TO_RADIANS = Math.PI / 180;

      if (orientation === DOC_ORIENTATION.Up) {

        ctx.drawImage(sourceImage, 0, 0, canvas.width, canvas.height);

      } else if (orientation === DOC_ORIENTATION.Right) {

        ctx.save();
        ctx.rotate(90 * TO_RADIANS);
        ctx.translate(0, -canvas.width);
        ctx.drawImage(sourceImage, 0, 0, canvas.height, canvas.width);
        ctx.restore();

      } else if (orientation === DOC_ORIENTATION.Left) {

        ctx.save();
        ctx.rotate(-90 * TO_RADIANS);
        ctx.translate(-canvas.width, 0);
        ctx.drawImage(sourceImage, 0, 0, canvas.height, canvas.width);
        ctx.restore();

      } else if (orientation === DOC_ORIENTATION.Down) {

        ctx.save();
        ctx.rotate(180 * TO_RADIANS);
        ctx.translate(-canvas.width, -canvas.height);
        ctx.drawImage(sourceImage, 0, 0, canvas.width, canvas.height);
        ctx.restore();

      } else {
        // console.warn('ngx-image-compress - no orientation value found');
        // same as default UP
        ctx.drawImage(sourceImage, 0, 0, canvas.width, canvas.height);
      }


      const mime = imageDataUrlSource.substr(5, imageDataUrlSource.split(';')[0].length - 5);
      // TODO test on mime
      const result = canvas.toDataURL(mime, quality);

      resolve(result);

    };

    sourceImage.onerror = (e) => {
      reject(e);
    };

    sourceImage.src = imageDataUrlSource;

  });


  /**
   * helper to evaluate the compression rate
   * @param imgString the image in base64 string format
   */
  static byteCount = (imgString: DataUrl): number => encodeURI(imgString).split(/%..|./).length - 1;

}
