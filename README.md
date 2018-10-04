## ngx-simple-crypt

Angular utility for compressing image to a satisfying size, that you choose


### Import
```sh
npm i ngx-image-compress
```

### Usage

No module import needed, you can use anywhere:


```typescript
import {Component, Renderer2} from '@angular/core';
import {ImageCompress} from "ngx-image-compress";

@Component({...})
export class AppComponent {

  constructor(private render: Renderer2) {}

  compressFile() {
    ImageCompress.uploadFile(this.render, (image, orientation) => {
      console.warn('Size in bytes was:', ImageCompress.byteCount(image));
      ImageCompress.compress(image, orientation, this.render, 50, 50).then(
        result => {
          console.warn('Size in bytes is now:', ImageCompress.byteCount(result));
        }
      )
    })
  }

}
```

The above code is from the working example here : `ngx-image-compress/tests/src/app/app.component.ts`  
You can also start yourself the working sample project like this
```$xslt
cd test
npm i
npm run start
```


### How it's working underwood?

We will use Renderer2, and transform the image multiple time through HTML canvas encrustation.


## Updates

#### 2017/12/06

Upload to Github
Need some fixes and tests to be use as a static library


#### 2018/10/04

Adding Live example.
Everything is now working and tested but I will make some arrangement to the code in `index.ts` before submitting it again to `npm`, in order to make it more handy.