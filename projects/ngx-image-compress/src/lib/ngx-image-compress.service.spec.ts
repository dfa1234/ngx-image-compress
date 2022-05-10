import {TestBed} from '@angular/core/testing';

import {NgxImageCompressService} from './ngx-image-compress.service';
import {DOC_ORIENTATION} from './models/DOC_ORIENTATION';
import {sampleImagesDataUrls} from '../tests/sample-images-data-urls.spec';

describe('NgxImageCompress Library', () => {
    beforeEach(() =>
        TestBed.configureTestingModule({
            providers: [NgxImageCompressService],
        })
    );

    it('should be created', async () => {
        const ngxImageCompressService: NgxImageCompressService = TestBed.inject(NgxImageCompressService);
        expect(ngxImageCompressService).toBeTruthy();
    });

    it('should be count byte', async () => {
        const ngxImageCompressService: NgxImageCompressService = TestBed.inject(NgxImageCompressService);
        const result = ngxImageCompressService.byteCount(sampleImagesDataUrls.up);
        expect(result > 5000 && result < 6000).toBeTruthy();
    });

    it('should compress and reduce size', async () => {
        const ngxImageCompressService: NgxImageCompressService = TestBed.inject(NgxImageCompressService);
        const sizeSource = ngxImageCompressService.byteCount(sampleImagesDataUrls.up);
        const resultCompress = await ngxImageCompressService.compressFile(sampleImagesDataUrls.up, DOC_ORIENTATION.Up, 50, 50);
        const sizeResult = ngxImageCompressService.byteCount(resultCompress);
        expect(sizeSource > sizeResult && sizeResult < 1024).toBeTruthy();
    });

    it('should compress and reduce size without parameters', async () => {
        const ngxImageCompressService: NgxImageCompressService = TestBed.inject(NgxImageCompressService);
        const sizeSource = ngxImageCompressService.byteCount(sampleImagesDataUrls.up);
        const resultCompress = await ngxImageCompressService.compressFile(sampleImagesDataUrls.down, DOC_ORIENTATION.Down);
        const sizeResult = ngxImageCompressService.byteCount(resultCompress);
        expect(sizeSource > sizeResult && sizeResult < 1024).toBeTruthy();
    });

    it('should compress and encrust left side', async () => {
        const ngxImageCompressService: NgxImageCompressService = TestBed.inject(NgxImageCompressService);
        const resultCompress = await ngxImageCompressService.compressFile(sampleImagesDataUrls.up, DOC_ORIENTATION.Left);
        const sizeResult = ngxImageCompressService.byteCount(resultCompress);
        expect(sizeResult < 1024).toBeTruthy();
    });

    it('should compress and encrust right side', async () => {
        const ngxImageCompressService: NgxImageCompressService = TestBed.inject(NgxImageCompressService);
        const resultCompress = await ngxImageCompressService.compressFile(sampleImagesDataUrls.up, DOC_ORIENTATION.Right);
        const sizeResult = ngxImageCompressService.byteCount(resultCompress);
        expect(sizeResult < 1024).toBeTruthy();
    });

    it('should constrain by max width and max height', async () => {
        const ngxImageCompressService: NgxImageCompressService = TestBed.inject(NgxImageCompressService);
        const sizeSource = ngxImageCompressService.byteCount(sampleImagesDataUrls.up);
        const resultCompress = await ngxImageCompressService.compressFile(sampleImagesDataUrls.up, DOC_ORIENTATION.Up, 90, 80, 28, 21);
        const sizeResult = ngxImageCompressService.byteCount(resultCompress);
        expect(sizeSource > sizeResult && sizeResult < 2048).toBeTruthy();
    });
});
