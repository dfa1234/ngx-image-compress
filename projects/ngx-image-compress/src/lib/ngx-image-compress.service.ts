import {Injectable, Renderer2, RendererFactory2} from '@angular/core';
import {ImageCompress} from './image-compress';
import {DOC_ORIENTATION} from './DOC_ORIENTATION';

@Injectable()
export class NgxImageCompressService {

  private render: Renderer2;

  public DOC_ORIENTATION = DOC_ORIENTATION;

  constructor(rendererFactory: RendererFactory2) {
    this.render = rendererFactory.createRenderer(null, null);
  }

  public byteCount(image) {
    return ImageCompress.byteCount(image);
  }

  public uploadFile():Promise<{image: string, orientation: DOC_ORIENTATION}> {
    return ImageCompress.uploadFile(this.render);
  }

  public compressFile(image, orientation, ratio: number = 50, quality: number = 50): Promise<string> {
    return ImageCompress.compress(image, orientation, this.render, ratio, quality);
  }

}
