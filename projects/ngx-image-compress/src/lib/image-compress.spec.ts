import {ImageCompress} from './image-compress';
import {DOC_ORIENTATION} from './models/DOC_ORIENTATION';
import {Renderer2} from '@angular/core';
import {fakeAsync, tick} from '@angular/core/testing';
import {sampleImagesDataUrls} from '../tests/sample-images-data-urls.spec';
import {getSampleTestFiles, SampleFiles} from '../tests/sample-images-files.spec';
import {UploadResponse} from 'ngx-image-compress';


describe('ImageCompress Static Utility', () => {

  let testFiles: SampleFiles;
  let mockRender: Partial<Renderer2>;
  let mockInput: Partial<HTMLInputElement>;
  let mockCanvas: Partial<HTMLCanvasElement>;
  let mockContext: Partial<CanvasRenderingContext2D>;
  let mockResponse: any;

  beforeEach(async () => {

    testFiles = await getSampleTestFiles(sampleImagesDataUrls);

    mockInput = jasmine.createSpyObj<HTMLInputElement>(['click']);
    mockCanvas = jasmine.createSpyObj<HTMLCanvasElement>(['getContext', 'toDataURL'], ['width', 'height']);
    mockContext = jasmine.createSpyObj<CanvasRenderingContext2D>(['save', 'rotate', 'translate', 'drawImage', 'restore']);
    mockResponse = {target: {value: 'test', files: [testFiles.up]}};
    (mockCanvas.getContext as jasmine.Spy).and.returnValue(mockContext);

    mockRender = {
      createElement: (elementName) => {
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
        setTimeout(() => {
          if (eventName === 'click') {
            callback(mockResponse);
          } else if (eventName === 'change') {
            callback(mockResponse);
          }
        }, eventName === 'click' ? 10 : 20);
        return () => {
        };
      },
    };
  });

  it('should count byte', async () => {
    const result = ImageCompress.byteCount(sampleImagesDataUrls.up);
    expect(result > 1024).toBeTruthy();
  });

  it('should get orientations', async () => {
    expect(await ImageCompress.getOrientation(testFiles.defaultValue)).toEqual(DOC_ORIENTATION.NotDefined);
    expect(await ImageCompress.getOrientation(testFiles.up)).toEqual(DOC_ORIENTATION.Up);
    expect(await ImageCompress.getOrientation(testFiles.down)).toEqual(DOC_ORIENTATION.Down);
    expect(await ImageCompress.getOrientation(testFiles.emptyFile)).toEqual(DOC_ORIENTATION.NotDefined);
  });

  it('should generate upload input for single file', async () => {
    const result = await ImageCompress.generateUploadInput(mockRender as Renderer2, false);
    expect(result[0].name).toEqual(testFiles.up.name);
  });

  it('should generate upload input for multiple files', async () => {
    const result = await ImageCompress.generateUploadInput(mockRender as Renderer2, true);
    expect(result[0].name).toEqual(testFiles.up.name);
  });

  it('should upload a single file', async () => {
    const result = await ImageCompress.uploadFile(mockRender as Renderer2, false);
    expect((result as  UploadResponse).image).toEqual(sampleImagesDataUrls.up);
  });

  it('should upload multiple files', async () => {
    const result = await ImageCompress.uploadFile(mockRender as Renderer2, true);
    expect((result as  UploadResponse[])[0].image).toEqual(sampleImagesDataUrls.up);
  });

  it('should get data url from file', async () => {
    const result = await ImageCompress.fileToDataURL(testFiles.up);
    expect(result).toEqual(sampleImagesDataUrls.up);
  });

  it('should generate input upload for a single file and click on it', fakeAsync(() => {
    ImageCompress.generateUploadInput(mockRender as Renderer2, false).then(result =>
      expect(result[0].name).toEqual(testFiles.up.name)
    );
    tick(1000);
    expect(mockInput.click).toHaveBeenCalled();
  }));


  it('should constrain max width and max height', async () => {
    (mockCanvas.toDataURL as jasmine.Spy).and.returnValue('data-url-test');
    const result = await ImageCompress.compress(sampleImagesDataUrls.up,
      DOC_ORIENTATION.LeftMirrored,
      mockRender as Renderer2,
      100,
      80,
      20,
      20);
    expect(result).toEqual('data-url-test');
    const sizeSource = ImageCompress.byteCount(sampleImagesDataUrls.up);
    const sizeResult = ImageCompress.byteCount(result);
    expect(sizeSource > sizeResult * 10).toBeTruthy();
  });

  it('should run the algorithm to upload and get a file with max size', async () => {
    (mockCanvas.toDataURL as jasmine.Spy).and.returnValue('data-url-test');
    const result = await ImageCompress.getImageMaxSize(0.01, true, mockRender as Renderer2);
    expect(result).toEqual('data-url-test');
  });

});
