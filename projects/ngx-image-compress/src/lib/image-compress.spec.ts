import {ImageCompress} from './image-compress';
import {DOC_ORIENTATION} from './models/DOC_ORIENTATION';
import {Renderer2} from '@angular/core';
import {fakeAsync, tick} from '@angular/core/testing';
import {sampleImagesDataUrls} from '../tests/sample-images-data-urls.spec';

type SampleImages = typeof sampleImagesDataUrls;
type SampleFiles = {
  [k in keyof SampleImages]: File;
};

const toBlob = async (file: string) => await (await fetch(file)).blob();

const toFile = async (key: string, content: string) => await new File([await toBlob(content)], `${key}.jpg`, {type: 'image/jpg'});

const getSampleTestFiles = async (sampleImageObject: SampleImages): Promise<SampleFiles> => {
  const testFiles: Partial<SampleFiles> = {};
  for (let key of Object.keys(sampleImagesDataUrls) as (keyof SampleImages)[]) {
    const file = await toFile(key, sampleImageObject[key]);
    testFiles[key] = file;
  }
  return testFiles as SampleFiles;
};

describe('ImageCompress Static Utility', () => {

  let testFiles: SampleFiles;
  let SampleRender: Partial<Renderer2>;
  let SampleInput: Partial<HTMLInputElement>;
  let SampleCanvas: Partial<HTMLCanvasElement>;
  let SampleContext: Partial<CanvasRenderingContext2D>;

  beforeEach(async () => {

    testFiles = await getSampleTestFiles(sampleImagesDataUrls);

    SampleInput = jasmine.createSpyObj<HTMLInputElement>(['click']);
    SampleCanvas = jasmine.createSpyObj<HTMLCanvasElement>(['getContext', 'toDataURL'], ['width', 'height']);
    SampleContext = jasmine.createSpyObj<CanvasRenderingContext2D>(['save', 'rotate', 'translate', 'drawImage', 'restore']);

    (SampleCanvas.getContext as jasmine.Spy).and.returnValue(SampleContext);

    SampleRender = {
      createElement: (type) => {
        if (type === 'input') {
          return SampleInput;
        } else if (type === 'canvas') {
          return SampleCanvas;
        }
        return null;
      },
      setStyle: jasmine.createSpy(),
      setProperty: jasmine.createSpy(),
      listen: (target, eventName, callback) => () => {
        callback({target: {value: 'test', files: []}});
      },
    };

    SampleRender.listen?.(SampleInput, 'change', jasmine.createSpy())();
    SampleRender.listen?.(SampleInput, 'click', jasmine.createSpy())();

  });

  it('should count byte', async () => {
    const result = ImageCompress.byteCount(sampleImagesDataUrls.up);
    expect(result > 1024).toBeTruthy();
  });

  it('should get orientations', async () => {
    expect(await ImageCompress.getOrientation(testFiles.defaultValue)).toEqual(DOC_ORIENTATION.NotDefined);
    expect(await ImageCompress.getOrientation(testFiles.up)).toEqual(DOC_ORIENTATION.Up);
    expect(await ImageCompress.getOrientation(testFiles.down)).toEqual(DOC_ORIENTATION.Down);
  });

  it('should get data url from file', async () => {
    const result = await ImageCompress.fileToDataURL(testFiles.up);
    expect(result).toEqual(sampleImagesDataUrls.up);
  });

  it('should generate input upload for a single file and click on it', fakeAsync(() => {
    ImageCompress.generateUploadInput(SampleRender as Renderer2, false).then(result =>
      expect(Object.keys(result)).toEqual(['image'])
    );
    tick(1000);
    expect(SampleInput.click).toHaveBeenCalled();
  }));


  it('should constrain by max width', async () => {

    (SampleCanvas.toDataURL as jasmine.Spy).and.returnValue('data-url-test');
    const result = await ImageCompress.compress(sampleImagesDataUrls.up,
      DOC_ORIENTATION.LeftMirrored,
      SampleRender as Renderer2,
      100,
      80,
      20,
      20);
    expect(result).toEqual('data-url-test');
    const sizeSource = ImageCompress.byteCount(sampleImagesDataUrls.up);
    const sizeResult = ImageCompress.byteCount(result);
    expect(sizeSource > sizeResult * 10).toBeTruthy();
  });

});
