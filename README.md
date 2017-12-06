## ngx-simple-crypt

Angular utility for compressing image to a satisfying size, that you choose

### Import
```sh
npm i ngx-image-compress
# or 
yarn add ngx-image-compress
```

### Usage

No module import needed, you can use anywhere:

```javascript
import {ImageCompress} from "ngx-image-compress";
```


### How it work?

We will use Renderer2, and transform the image multiple time through HTML canvas.
