import {Injectable, Renderer2, RendererFactory2} from '@angular/core';
import {ImageCompress} from './image-compress';
import {DOC_ORIENTATION} from './models/DOC_ORIENTATION';
import {UploadResponse} from './models/upload-response';

@Injectable({
  providedIn: 'root'
})
export class NgxImageCompressService {

  private readonly render: Renderer2;

  public DOC_ORIENTATION = DOC_ORIENTATION;

  constructor(rendererFactory: RendererFactory2) {
    this.render = rendererFactory.createRenderer(null, null);
  }

  /**
   * helper to evaluate the compression rate
   * @param imgString the image in base64 string format
   */
  public byteCount(image: string) {
    return ImageCompress.byteCount(image);
  }

  /**
   * Get the correct Orientation value from image tags
   */
  public getOrientation(file: File): Promise<DOC_ORIENTATION> {
    return ImageCompress.getOrientation(file);
  }

  /**
   * return a promise with the new image data and image orientation
   */
  public uploadFile(): Promise<UploadResponse> {
    return ImageCompress.uploadFile(this.render, false) as Promise<UploadResponse>;
  }

  /**
   * return a promise with an array of image data and image orientation
   */
  public uploadMultipleFiles(): Promise<UploadResponse[]> {
    return ImageCompress.uploadFile(this.render, true) as Promise<UploadResponse[]>;
  }

  /**
   * perform the compression from the DataUrl (string) given by the uploadFile or uploadMultipleFiles method
   */
  public compressFile(
    image: string,
    orientation: DOC_ORIENTATION,
    ratio: number = 50,
    quality: number = 50,
    maxWidth: number = 0,
    maxHeight: number = 0
  ): Promise<string> {
    return ImageCompress.compress(image, orientation, this.render, ratio, quality, maxWidth, maxHeight);
  }

  /**
   * Most simple function to use here.
   * Perform an upload and return an image dataUrl (string format) with a maximum size, given in *MegaBytes*
   * If the size can't be reached, the best that can be reached will be returned in promise *rejection*
   */
  public uploadAndGetImageWithMaxSize(maxSizeMb: number = 1): Promise<string> {
    return ImageCompress.getImageMaxSize(maxSizeMb, this.render);
  }
}
