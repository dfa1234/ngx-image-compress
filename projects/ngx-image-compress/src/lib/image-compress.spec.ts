import {Renderer2} from '@angular/core';
import {fakeAsync, tick} from '@angular/core/testing';
import {UploadResponse} from 'ngx-image-compress';
import {sampleImagesDataUrls} from '../tests/sample-images-data-urls.spec';
import {getSampleTestFiles, SampleFiles} from '../tests/sample-images-files.spec';
import {ImageCompress} from './image-compress';
import {DOC_ORIENTATION} from './models/DOC_ORIENTATION';

describe(ImageCompress.name, () => {
    let testFiles: SampleFiles;
    let mockRender: Partial<Renderer2>;
    let mockInput: Partial<HTMLInputElement>;
    let mockCanvas: Partial<HTMLCanvasElement>;
    let mockContext: Partial<CanvasRenderingContext2D>;
    let mockResponse: any;
    let mockCSS: any;
    let imageCompress: ImageCompress;

    beforeEach(async () => {
        imageCompress = new ImageCompress();

        testFiles = await getSampleTestFiles(sampleImagesDataUrls);

        mockCSS = jasmine.createSpyObj(['supports']);

        window.CSS = mockCSS;

        mockInput = jasmine.createSpyObj<HTMLInputElement>(['click', 'setAttribute', 'addEventListener'], ['id', 'style']);
        //@ts-ignore
        Object.getOwnPropertyDescriptor(mockInput, 'style').get.and.returnValue({
            display: '',
        });

        mockCanvas = jasmine.createSpyObj<HTMLCanvasElement>(['getContext', 'toDataURL'], ['width', 'height']);
        mockContext = jasmine.createSpyObj<CanvasRenderingContext2D>(['save', 'rotate', 'translate', 'drawImage', 'restore']);
        mockResponse = {target: {value: 'test', files: [testFiles.up]}};
        (mockCanvas.getContext as jasmine.Spy).and.returnValue(mockContext);

        mockRender = {
            createElement: elementName => {
                if (elementName === 'input') {
                    return mockInput;
                } else if (elementName === 'canvas') {
                    return mockCanvas;
                }
                return null;
            },
            setStyle: jasmine.createSpy(),
            setProperty: jasmine.createSpy(),
            listen: (target, eventName, callback) => {
                setTimeout(
                    () => {
                        if (eventName === 'click') {
                            callback(mockResponse);
                        } else if (eventName === 'change') {
                            callback(mockResponse);
                        }
                    },
                    eventName === 'click' ? 10 : 20
                );
                return () => {};
            },
        };
    });

    it('should count byte', async () => {
        const result = imageCompress.byteCount(sampleImagesDataUrls.up);
        expect(result > 1024).toBeTruthy();
    });

    it('should get orientations', async () => {
        expect(await imageCompress.getOrientation(testFiles.defaultValue)).toEqual(DOC_ORIENTATION.NotDefined);
        expect(await imageCompress.getOrientation(testFiles.up)).toEqual(DOC_ORIENTATION.Up);
        expect(await imageCompress.getOrientation(testFiles.down)).toEqual(DOC_ORIENTATION.Down);
        expect(await imageCompress.getOrientation(testFiles.emptyFile)).toEqual(DOC_ORIENTATION.NotDefined);
    });

    it('should generate upload input for single file', async () => {
        const result = await imageCompress.generateUploadInputRenderer(mockRender as Renderer2, false);
        expect(result?.[0].name).toEqual(testFiles.up.name);
    });

    it('should generate upload input for multiple files', async () => {
        const result = await imageCompress.generateUploadInputRenderer(mockRender as Renderer2, true);
        expect(result?.[0].name).toEqual(testFiles.up.name);
    });

    it('should upload a single file', async () => {
        const result = await imageCompress.uploadFile(mockRender as Renderer2, false);
        expect((result as UploadResponse).image).toEqual(sampleImagesDataUrls.up);
    });

    it('should upload multiple files', async () => {
        const result = await imageCompress.uploadFile(mockRender as Renderer2, true);
        expect((result as UploadResponse[])[0].image).toEqual(sampleImagesDataUrls.up);
    });

    it('should get data url from file', async () => {
        const result = await imageCompress.fileToDataURL(testFiles.up);
        expect(result.dataUrl).toEqual(sampleImagesDataUrls.up);
    });

    it('should not get data url from file', async () => {
        try {
            const result = await imageCompress.fileToDataURL(null as any as File);
            console.log(result);
        } catch (e) {
            expect(e).toEqual(
                "ngx-image-compress - probably no file have been selected: TypeError: Failed to execute 'readAsDataURL' on 'FileReader': parameter 1 is not of type 'Blob'."
            );
        }
    });

    it('should generate input upload for a single file and click on it', fakeAsync(() => {
        imageCompress
            .generateUploadInputRenderer(mockRender as Renderer2, false)
            .then(result => expect(result?.[0].name).toEqual(testFiles.up.name));
        tick(1000);
        expect(mockInput.click).toHaveBeenCalled();
    }));

    it('should generate input using native js api and upload a multiple file', fakeAsync(() => {
        const mockBody = {
            appendChild: jasmine.createSpy(),
            removeChild: jasmine.createSpy(),
        };
        imageCompress
            .generateUploadInputNative(
                {
                    ...mockRender,
                    body: mockBody,
                },
                true
            )
            .then(result => expect(result?.[0].name).toEqual(testFiles.up.name));
        tick(1000);
        expect(mockInput.click).toHaveBeenCalled();
        expect(mockBody.appendChild).toHaveBeenCalled();
    }));

    it('should constrain max width and max height', async () => {
        (mockCanvas.toDataURL as jasmine.Spy).and.returnValue('data-url-test');
        const result = await imageCompress.compress(
            sampleImagesDataUrls.up,
            DOC_ORIENTATION.LeftMirrored,
            mockRender as Renderer2,
            100,
            80,
            20,
            20
        );
        expect(result).toEqual('data-url-test');
        const sizeSource = imageCompress.byteCount(sampleImagesDataUrls.up);
        const sizeResult = imageCompress.byteCount(result);
        expect(sizeSource > sizeResult * 10).toBeTruthy();
    });

    it('should compress with CSS new api', async () => {
        (mockCanvas.toDataURL as jasmine.Spy).and.returnValue('data-url-test');
        (mockCSS.supports as jasmine.Spy).and.returnValue(true);
        const result = await imageCompress.compress(sampleImagesDataUrls.up, DOC_ORIENTATION.LeftMirrored, mockRender as Renderer2);
        expect(result).toEqual('data-url-test');
    });

    it('should compress with orientation flip', async () => {
        (mockCanvas.toDataURL as jasmine.Spy).and.returnValue('data-url-test');
        (mockCSS.supports as jasmine.Spy).and.returnValue(false);
        let result = await imageCompress.compress(sampleImagesDataUrls.defaultValue, DOC_ORIENTATION.Left, mockRender as Renderer2);
        expect(result).toEqual('data-url-test');

        result = await imageCompress.compress(sampleImagesDataUrls.defaultValue, DOC_ORIENTATION.Right, mockRender as Renderer2);
        expect(result).toEqual('data-url-test');

        result = await imageCompress.compress(sampleImagesDataUrls.defaultValue, DOC_ORIENTATION.Down, mockRender as Renderer2);
        expect(result).toEqual('data-url-test');

        result = await imageCompress.compress(sampleImagesDataUrls.defaultValue, DOC_ORIENTATION.Up, mockRender as Renderer2);
        expect(result).toEqual('data-url-test');
    });

    it('should run the algorithm to upload and get a file with max size', async () => {
        (mockCanvas.toDataURL as jasmine.Spy).and.returnValue('data-url-test');
        const result = await imageCompress.uploadGetImageMaxSize(0.01, false, mockRender as Renderer2);
        expect(result).toEqual({image: 'data-url-test', orientation: DOC_ORIENTATION.Up, fileName: 'up.jpg'});
    });

    it('should run the algorithm and return the original', async () => {
        (mockCanvas.toDataURL as jasmine.Spy).and.returnValue(sampleImagesDataUrls.up);
        try {
            const result = await imageCompress.uploadGetImageMaxSize(0.01, true, mockRender as Renderer2);
        } catch (e: any) {
            expect(e.image).toEqual(sampleImagesDataUrls.up);
        }
    });

    it('should run the algorithm and return something smaller', async () => {
        (mockCanvas.toDataURL as jasmine.Spy).and.returnValue(sampleImagesDataUrls.defaultValue);

        const result = await imageCompress.uploadGetImageMaxSize(1, true, mockRender as Renderer2);

        expect(result).toEqual({image: sampleImagesDataUrls.defaultValue, orientation: 1, fileName: 'up.jpg'});
    });
});
