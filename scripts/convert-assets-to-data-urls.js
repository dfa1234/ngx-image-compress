const fs = require("fs");

const dirAssets = `./src/assets/tests-images`;
const targetFile = `./projects/ngx-image-compress/src/tests/sample-images-data-urls.spec.ts`;

const dirList = fs.readdirSync(dirAssets);

const resultObject = {};

dirList.forEach((filename) => {
  const fileContent = fs.readFileSync(`${dirAssets}/${filename}`);
  const keyFileName = filename.replace(/\.[^/.]+$/, "");
  const contentBase64 = `data:image/jpg;base64,${fileContent.toString(
    "base64"
  )}`;
  resultObject[keyFileName] = contentBase64;
});

fs.writeFileSync(targetFile,
  `// generated with ./scripts/convert-assets-to-data-urls.js
export const sampleImagesDataUrls = ${JSON.stringify(resultObject, null, 2)}`,
  {encoding: "utf-8"}
);

console.log(`done > ${targetFile}`);
