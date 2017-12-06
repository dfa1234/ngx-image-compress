## ngx-simple-crypt

Angular utility for compressing image to a satisfying size, that you choose

Warning: working project, please read "Updates" sections above

### Import
```sh
npm i ngx-image-compress
# or 
yarn add ngx-image-compress
```

### Usage

No module import needed, you can use anywhere:

```typescript
import {ImageCompress} from "ngx-image-compress";
// To get your image data source string (aka "data:image/jpeg:base64...")
ImageCompress.uploadFile(...)
// To start the compression
ImageCompress.compress(...)
```

### How it works?

We will use Renderer2, and transform the image multiple time through HTML canvas.


## Update 

####2017/12/06

Upload to Github
 
Still a some fixes to be make as static, external library