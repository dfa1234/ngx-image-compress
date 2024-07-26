import {Renderer2} from '@angular/core';
import {DataUrl} from './models/data-url';
import {DOC_ORIENTATION} from './models/DOC_ORIENTATION';
import {UploadResponse} from './models/upload-response';

export class ImageCompress {
    getOrientation(file: File): Promise<DOC_ORIENTATION> {
        return new Promise<DOC_ORIENTATION>((resolve, reject) => {
            try {
                const reader = new FileReader();
                reader.onload = () => {
                    const view = new DataView(reader.result as ArrayBuffer);
                    if (!view.byteLength) {
                        return resolve(DOC_ORIENTATION.NotDefined);
                    }
                    if (view.getUint16(0, false) !== 0xffd8) {
                        return resolve(DOC_ORIENTATION.NotDefined);
                    }
                    const length = view.byteLength;
                    let offset = 2;
                    while (offset < length) {
                        const marker = view.getUint16(offset, false);
                        offset += 2;
                        if (marker === 0xffe1) {
                            if (view.getUint32((offset += 2), false) !== 0x45786966) {
                                return resolve(DOC_ORIENTATION.NotJpeg);
                            }
                            const little = view.getUint16((offset += 6), false) === 0x4949;
                            offset += view.getUint32(offset + 4, little);
                            const tags = view.getUint16(offset, little);
                            offset += 2;
                            for (let i = 0; i < tags; i++) {
                                if (view.getUint16(offset + i * 12, little) === 0x0112) {
                                    return resolve(view.getUint16(offset + i * 12 + 8, little));
                                }
                            }
                        } else if ((marker & 0xff00) !== 0xff00) {
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
    }

    uploadFile(render: Renderer2, multiple = true, rejectOnCancel = false): Promise<UploadResponse | UploadResponse[]> {
        return new Promise((resolve, reject) => {
            const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
            const isIOS = /iPad|iPhone|iPod/i.test(navigator.userAgent);

            Promise.resolve(isSafari || isIOS)
                .then(onlyNative => {
                    if (onlyNative) {
                        return this.generateUploadInputNative(window.document, multiple, rejectOnCancel);
                    } else {
                        return this.generateUploadInputRenderer(render, multiple, rejectOnCancel);
                    }
                })
                .then((filesList: FileList | null) => {
                    const files = filesList ? Array.from(filesList) : [];
                    const orientationPromises = files.map(file => this.getOrientation(file));
                    const readerPromises = files.map(file => this.fileToDataURL(file));

                    let orientationsResult: DOC_ORIENTATION[] = [];

                    Promise.all(orientationPromises)
                        .then((orientations: DOC_ORIENTATION[]) => {
                            orientationsResult = orientations;
                            return Promise.all(readerPromises);
                        })
                        .then(readerResult => {
                            const resultArray = readerResult.map((parsedFile, index) => ({
                                image: parsedFile.dataUrl,
                                orientation: orientationsResult[index],
                                fileName: parsedFile.fileName,
                            }));

                            if (multiple) {
                                resolve(resultArray);
                            } else {
                                resolve(resultArray[0]);
                            }
                        });
                })
                .catch(err => reject(err));
        });
    }

    fileToDataURL(file: File): Promise<{dataUrl: string; fileName: string}> {
        return new Promise<{dataUrl: string; fileName: string}>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e: any) => {
                //myReader.onloadend = (progressEvent: ProgressEvent<FileReader>)
                resolve({dataUrl: e.target.result, fileName: file.name});
            };
            try {
                reader.readAsDataURL(file);
            } catch (e) {
                reject(`ngx-image-compress - probably no file have been selected: ${e}`);
            }
        });
    }

    generateUploadInputRenderer(render: Renderer2, multiple = true, rejectOnCancel = false) {
        let lock = false;
        return new Promise<FileList | null>((resolve, reject) => {
            const inputElement = render.createElement('input');
            render.setStyle(inputElement, 'display', 'none');
            render.setProperty(inputElement, 'type', 'file');
            render.setProperty(inputElement, 'accept', 'image/*, .heic');

            if (multiple) {
                render.setProperty(inputElement, 'multiple', 'true');
            }

            render.listen(inputElement, 'click', ($event: MouseEvent) => {
                ($event.target as any as HTMLInputElement).value = '';
            });

            render.listen(inputElement, 'change', $event => {
                lock = true;
                const files: FileList = $event.target.files;
                resolve(files);
            });

            if (rejectOnCancel) {
                window.addEventListener(
                    'focus',
                    () => {
                        setTimeout(() => {
                            if (!lock) {
                                reject(new Error('file upload on blur - no file selected'));
                            }
                        }, 300);
                    },
                    {once: true}
                );
            }

            inputElement.click();
        });
    }

    generateUploadInputNative(documentNativeApi: any, multiple = true, rejectOnCancel = false) {
        let lock = false;
        return new Promise<FileList | null>((resolve, reject) => {
            const inputElement = documentNativeApi.createElement('input');
            inputElement.id = 'upload-input' + new Date();
            inputElement.style.display = 'none';
            inputElement.setAttribute('type', 'file');
            inputElement.setAttribute('accept', 'image/*, .heic');

            if (multiple) {
                inputElement.setAttribute('multiple', 'true');
            }

            documentNativeApi.body.appendChild(inputElement);

            inputElement.addEventListener(
                'change',
                () => {
                    lock = true;
                    resolve(inputElement.files);
                    documentNativeApi.body.removeChild(documentNativeApi.getElementById(inputElement.id) as Node);
                },
                {once: true}
            );

            if (rejectOnCancel) {
                window.addEventListener(
                    'focus',
                    () => {
                        setTimeout(() => {
                            if (!lock && documentNativeApi.getElementById(inputElement.id)) {
                                reject(new Error('file upload on blur - no file selected'));
                                documentNativeApi.body.removeChild(documentNativeApi.getElementById(inputElement.id) as Node);
                            }
                        }, 300);
                    },
                    {once: true}
                );
            }

            // open file select box
            inputElement.click();
        });
    }

    compress(
        imageDataUrlSource: DataUrl,
        orientation: DOC_ORIENTATION,
        render: Renderer2,
        ratio = 50,
        quality = 50,
        maxwidth = 0,
        maxheight = 0
    ): Promise<string> {
        return new Promise(function (resolve, reject) {
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

                if (!CSS.supports('image-orientation', 'from-image')) {
                    if (orientation === DOC_ORIENTATION.Right || orientation === DOC_ORIENTATION.Left) {
                        const t = w;
                        w = h;
                        h = t;
                    }
                }

                const xratio = maxwidth ? maxwidth / w : 1;
                const yratio = maxheight ? maxheight / h : 1;
                ratio = Math.min(ratio, xratio, yratio);
                canvas.width = w * ratio;
                canvas.height = h * ratio;

                const TO_RADIANS = Math.PI / 180;

                if (CSS.supports('image-orientation', 'from-image') || orientation === DOC_ORIENTATION.Up) {
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
                    // no orientation value found - same as default UP
                    ctx.drawImage(sourceImage, 0, 0, canvas.width, canvas.height);
                }

                const mime = imageDataUrlSource.substr(5, imageDataUrlSource.split(';')[0].length - 5);
                // TODO test on mime
                const result = canvas.toDataURL(mime, quality);

                resolve(result);
            };

            sourceImage.onerror = e => reject(e);
            sourceImage.src = imageDataUrlSource;
        });
    }

    byteCount = (imgString: DataUrl): number => encodeURI(imgString).split(/%..|./).length - 1;

    async uploadGetImageMaxSize(maxSizeMb: number, debugMode: boolean, render: Renderer2, rejectOnCancel = false): Promise<UploadResponse> {
        if (debugMode) {
            console.debug('Ngxthis - Opening upload window');
        }

        const myFile: UploadResponse = (await this.uploadFile(render, false, rejectOnCancel)) as UploadResponse;

        return await this.getImageMaxSize(myFile, maxSizeMb, debugMode, render);
    }

    async getImageMaxSize(myFile: UploadResponse, maxSizeMb: number, debugMode: boolean, render: Renderer2): Promise<UploadResponse> {
        const MAX_TRIES = 10;

        const bytesToMB = (bytes: number) => (bytes / 1024 / 1024).toFixed(2);

        if (debugMode) {
            console.debug('Ngxthis - Opening upload window');
        }

        let compressedFile;

        for (let i = 0; i < MAX_TRIES; i++) {
            const previousSize = this.byteCount(myFile.image);
            compressedFile = await this.compress(myFile.image, myFile.orientation, render, 50, 100);
            const newSize = this.byteCount(compressedFile);
            console.debug('Ngxthis -', 'Compression from', bytesToMB(previousSize), 'MB to', bytesToMB(newSize), 'MB');
            if (newSize >= previousSize) {
                if (i === 0) {
                    if (debugMode) {
                        console.debug(
                            'Ngxthis -',
                            "File can't be reduced at all - returning the original",
                            bytesToMB(previousSize),
                            'MB large'
                        );
                    }
                    throw {...myFile, image: compressedFile};
                } else {
                    if (debugMode) {
                        console.debug(
                            'Ngxthis -',
                            "File can't be reduced more - returning the best we can, which is ",
                            bytesToMB(previousSize),
                            'MB large'
                        );
                    }
                    throw {...myFile, image: compressedFile};
                }
            } else {
                if (newSize < maxSizeMb * 1024 * 1024) {
                    if (debugMode) {
                        console.debug('Ngxthis -', 'Here your file', bytesToMB(newSize), 'MB large');
                    }
                    return {...myFile, image: compressedFile};
                } else if (i === 9) {
                    if (debugMode) {
                        console.debug(
                            'Ngxthis -',
                            "File can't reach the desired size after",
                            MAX_TRIES,
                            'tries. Returning file ',
                            bytesToMB(previousSize),
                            'MB large'
                        );
                    }
                    throw {...myFile, image: compressedFile};
                }
            }
            if (debugMode) {
                console.debug('Ngxthis -', 'Reached', bytesToMB(newSize), 'MB large. Trying another time after', i + 1, 'times');
            }
            myFile.image = compressedFile;
        }
        if (debugMode) {
            console.debug('Ngxthis - Unexpected error');
        }
        throw {};
    }
}
