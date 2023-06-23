import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { NgxImageCompressService } from 'ngx-image-compress';
import { AppComponent } from './app.component';
import { NgxImageCaptureModule } from 'ngx-image-compress';

@NgModule({
  declarations: [AppComponent],
  imports: [BrowserModule, NgxImageCaptureModule],
  providers: [NgxImageCompressService],
  bootstrap: [AppComponent],
})
export class AppModule {}
