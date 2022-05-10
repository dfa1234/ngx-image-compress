import {DOC_ORIENTATION} from './DOC_ORIENTATION';
import {DataUrl} from './data-url';

export interface UploadResponse {
    image: DataUrl;
    orientation: DOC_ORIENTATION;
    fileName: string;
}
