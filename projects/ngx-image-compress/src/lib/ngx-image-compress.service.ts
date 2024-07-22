import {Injectable, Renderer2, RendererFactory2} from '@angular/core';
import {ImageCompress} from './image-compress';
import {DataUrl} from './models/data-url';
import {DOC_ORIENTATION} from './models/DOC_ORIENTATION';
import {UploadResponse} from './models/upload-response';

@Injectable({
    providedIn: 'root',
})
export class NgxImageCompressService {
    private readonly render: Renderer2;

    private imageCompress: ImageCompress;

    public DOC_ORIENTATION = DOC_ORIENTATION;

    constructor(rendererFactory: RendererFactory2) {
        this.render = rendererFactory.createRenderer(null, null);
        this.imageCompress = new ImageCompress();
    }

    /**
     * helper to evaluate the compression rate
     * @param imgString the image in base64 string format
     */
    public byteCount(image: DataUrl) {
        return this.imageCompress.byteCount(image);
    }

    /**
     * Get the correct Orientation value from image tags
     */
    public getOrientation(file: File): Promise<DOC_ORIENTATION> {
        return this.imageCompress.getOrientation(file);
    }

    /**
     * return a promise with the new image data and image orientation
     * Nothing happen if no file have been selected
     */
    public uploadFile(): Promise<UploadResponse> {
        return this.imageCompress.uploadFile(this.render, false) as Promise<UploadResponse>;
    }

    /**
     * return a promise with an array of image data and image orientation
     * Nothing happen if no files have been selected
     */
    public uploadMultipleFiles(): Promise<UploadResponse[]> {
        return this.imageCompress.uploadFile(this.render, true) as Promise<UploadResponse[]>;
    }

    /**
     * return a promise with the new image data and image orientation
     * the promise will reject if no file have been selected
     */
    public uploadFileOrReject(): Promise<UploadResponse> {
        return this.imageCompress.uploadFile(this.render, false, true) as Promise<UploadResponse>;
    }

    /**
     * return a promise with an array of image data and image orientation
     * the promise will reject if no files have been selected
     */
    public uploadMultipleFilesOrReject(): Promise<UploadResponse[]> {
        return this.imageCompress.uploadFile(this.render, true, true) as Promise<UploadResponse[]>;
    }

    /**
   * perform a compression from the given DataUrl (string), provided by the uploadFile, or uploadMultipleFiles method
   *
   *
   | Parameter   | Type   | Description                                                                       |
   | ----------- | ------ | --------------------------------------------------------------------------------- |
   | image       | string | DataUrl (string) representing the image                                           |
   | orientation | number | EXIF Orientation value using the DOC_ORIENTATION enum value                       |
   | ratio       | number | Maximum scale factor as a percentage (optional, default: 50) <sup>[1](#fn1)</sup> |
   | quality     | number | JPEG quality factor as a percentage (optional, default: 50) <sup>[2](#fn2)</sup>  |
   | maxwidth    | number | Maximum width in pixels if you need to resize (optional, default: 0 - no resize)  |
   | maxheight   | number | Maximum height in pixels if you need to resize (optional, default: 0 - no resize) |
   */
    public compressFile(
        image: DataUrl,
        orientation: DOC_ORIENTATION,
        ratio = 50,
        quality = 50,
        maxWidth = 0,
        maxHeight = 0
    ): Promise<DataUrl> {
        return this.imageCompress.compress(image, orientation, this.render, ratio, quality, maxWidth, maxHeight);
    }

    /**
     * Most simple function to use here.
     * Perform an upload and return an image dataUrl (string format) with a maximum size, given in *MegaBytes*
     * If the size can't be reached, the best that can be reached will be returned in promise *rejection*
     * Put debugMode to true if you have some trouble to print some help using console.debug
     */
    public uploadAndGetImageWithMaxSize(maxSizeMb = 1, debugMode = false, rejectOnCancel = false): Promise<DataUrl> {
        return this.imageCompress.uploadGetImageMaxSize(maxSizeMb, debugMode, this.render, rejectOnCancel)
            .then(uploadResponse => uploadResponse.image)
            .catch(e => {
                throw e.image;
            });
    }

    /**
     * Same as before, but return more informations (file name...)
     */
    public uploadAndGetImageWithMaxSizeAndMetas(maxSizeMb = 1, debugMode = false, rejectOnCancel = false): Promise<UploadResponse> {
        return this.imageCompress.uploadGetImageMaxSize(maxSizeMb, debugMode, this.render, rejectOnCancel);
    }

    /**
     * Not handling the upload, you need to provide the file and the orientation by yourself
     */
    public getImageWithMaxSizeAndMetas(file: UploadResponse, maxSizeMb = 1, debugMode = false): Promise<UploadResponse> {
        return this.imageCompress.getImageMaxSize(file, maxSizeMb, debugMode, this.render);
    }
}
