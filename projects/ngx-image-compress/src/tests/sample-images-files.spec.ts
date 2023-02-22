import {sampleImagesDataUrls} from './sample-images-data-urls.spec';

export type SampleImages = typeof sampleImagesDataUrls;
export type SampleFiles = {
  [k in keyof SampleImages]: File;
};

const toBlob = async (file: string) => await (await fetch(file)).blob();

const toFile = async (key: string, content: string) => await new File([await toBlob(content)], `${key}.jpg`, {type: 'image/jpg'});

export const getSampleTestFiles = async (sampleImageObject: SampleImages): Promise<SampleFiles> => {
  const testFiles: Partial<SampleFiles> = {};
  for (const key of Object.keys(sampleImageObject) as (keyof SampleImages)[]) {
    const file = await toFile(key, sampleImageObject[key]);
    testFiles[key] = file;
  }
  return testFiles as SampleFiles;
};
