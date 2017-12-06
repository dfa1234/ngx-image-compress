import { Renderer2} from "@angular/core";

export enum DOC_ORIENTATION{
    Up=1,
    Down=3,
    Right=6,
    Left=8,
    UpMirrored=2,
    DownMirrored=4,
    LeftMirrored=5,
    RightMirrored=7,
    NotJpeg=-1,
    NotDefined=-2
}


export class ImageCompress {


    /**
     * Get the correct Orientation value from tags, in order to write correctly in our canvas
     * @param {File} file
     * @param {(result: DOC_ORIENTATION) => void} callback
     */
    static getOrientation(file:File, callback:(result:DOC_ORIENTATION)=>void) {
        let reader = new FileReader();
        try{
            reader.onload = function($event) {
                let view = new DataView(reader.result);
                if (view.getUint16(0, false) != 0xFFD8) return callback(-2);
                let length = view.byteLength, offset = 2;
                while (offset < length) {
                    let marker = view.getUint16(offset, false);
                    offset += 2;
                    if (marker == 0xFFE1) {
                        if (view.getUint32(offset += 2, false) != 0x45786966) return callback(-1);
                        let little = view.getUint16(offset += 6, false) == 0x4949;
                        offset += view.getUint32(offset + 4, little);
                        let tags = view.getUint16(offset, little);
                        offset += 2;
                        for (let i = 0; i < tags; i++)
                            if (view.getUint16(offset + (i * 12), little) == 0x0112)
                                return callback(view.getUint16(offset + (i * 12) + 8, little));
                    }
                    else if ((marker & 0xFF00) != 0xFF00) break;
                    else offset += view.getUint16(offset, false);
                }
                return callback(-1);
            };
            reader.readAsArrayBuffer(file);
        }catch(e){
            return callback(0);
        }

    }

    /**
     * return a callback with the new image data and image orientation
     * @param render
     * @param callBack
     */
    static uploadFile(render: Renderer2, callBack: (image: string,orientation:DOC_ORIENTATION) => void) {
        let inputElement = render.createElement("input");
        render.setStyle(inputElement, "display", "none");
        render.setProperty(inputElement, "type", "file");

        render.listen(inputElement, "click", ($event) => {
            //javascript teachable moment
            console.log('MouseEvent:',$event);
            console.log('Input:',$event.target);
            $event.target.value = null;
        });


        render.listen(inputElement, "change", ($event) => {
            let file: File = $event.target.files[0];

            let myReader: FileReader = new FileReader();

            myReader.onloadend = (e) => {
                try {
                    ImageCompress.getOrientation(file,orientation=>{
                        callBack(myReader.result,orientation);
                    });
                } catch (e) {
                    console.log(`ERROR ${e}`);
                    callBack(null,null);
                }
            };

            try {
                myReader.readAsDataURL(file);
            } catch (e) {
                console.log(`ERROR - probably no file have been selected: ${e}`);
                callBack(null,null);
            }

        });
        inputElement.click();
    }





    static compress(imageDataUrlSource: string, orientation:DOC_ORIENTATION, render: Renderer2, ratio: number = 50, quality: number = 50): Promise<string> {

        return new Promise((resolve, reject) => {

            quality = quality / 100;
            ratio = ratio / 100;
            const sourceImage = new Image();

            //important for safari: we need to wait for onload event
            sourceImage.onload = function () {
                const canvas: HTMLCanvasElement = render.createElement('canvas');
                const ctx: CanvasRenderingContext2D = canvas.getContext("2d");

                let w, h;
                w = sourceImage.naturalWidth;
                h = sourceImage.naturalHeight;

                if(orientation== DOC_ORIENTATION.Right || orientation == DOC_ORIENTATION.Left){
                    let t = w;
                    w = h;
                    h = t;
                }

                canvas.width = w * ratio;
                canvas.height = h * ratio;


                const TO_RADIANS = Math.PI/180;

                if(orientation == DOC_ORIENTATION.Up){

                    ctx.drawImage(sourceImage, 0, 0, canvas.width, canvas.height);

                }else if(orientation == DOC_ORIENTATION.Right){

                    ctx.save();
                    ctx.rotate(90 * TO_RADIANS);
                    ctx.translate(0,-canvas.width);
                    ctx.drawImage(sourceImage, 0, 0,canvas.height, canvas.width);
                    ctx.restore();

                }else if(orientation == DOC_ORIENTATION.Left){

                    ctx.save();
                    ctx.rotate(-90 * TO_RADIANS);
                    ctx.translate(-canvas.width,0);
                    ctx.drawImage(sourceImage, 0, 0,canvas.height, canvas.width);
                    ctx.restore();

                }else if(orientation == DOC_ORIENTATION.Down){

                    ctx.save();
                    ctx.rotate(180 * TO_RADIANS);
                    ctx.translate(-canvas.width,-canvas.height);
                    ctx.drawImage(sourceImage, 0, 0,canvas.width, canvas.height);
                    ctx.restore();

                }else{
                    console.error('Wrong orientation value');
                    //same as default UP
                    ctx.drawImage(sourceImage, 0, 0, canvas.width, canvas.height);
                }



                let mime = imageDataUrlSource.substr(5, imageDataUrlSource[0].length);
                //TODO test on mime
                let result = canvas.toDataURL(mime, quality);

                resolve(result);

            };

            sourceImage.src = imageDataUrlSource;

        });

    }

}
