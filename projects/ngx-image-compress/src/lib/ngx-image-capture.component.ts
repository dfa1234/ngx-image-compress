import {Component, ElementRef, EventEmitter, Output, ViewChild} from '@angular/core';
import {DataUrl} from './models/data-url';

@Component({
    selector: 'ngx-image-capture',
    template: `
        <span (click)="startVideoCapture()" *ngIf="!streamOpened">
            <ng-content select="[openStreamBtn]"></ng-content>
        </span>
        <span (click)="acquireImage()" *ngIf="streamOpened">
            <ng-content select="[acquireImageBtn]"></ng-content>
        </span>
        <video #video autoplay *ngIf="streamOpened"></video>
    `,
    styles: [],
})
export class NgxImageCaptureComponent {
    @Output() imageCaptured = new EventEmitter<DataUrl>();
    @Output() errorCapture = new EventEmitter<string>();

    @ViewChild('video', {static: false})
    videoElement: ElementRef<HTMLVideoElement> | null = null;
    videoStream: MediaStream | null = ViewChild('video', {static: false});
    streamOpened = false;

    startVideoCapture() {
        this.streamOpened = true;

        const constraints = {
            audio: false,
            video: {
                width: {ideal: 1920},
                height: {ideal: 1080},
                facingMode: {ideal: 'user'},
            },
        };

        navigator.mediaDevices
            .getUserMedia(constraints)
            .then(stream => {
                this.videoStream = stream;
                setTimeout(() => {
                    if (this.videoElement && this.videoElement.nativeElement) {
                        this.videoElement.nativeElement.srcObject = stream;
                    }
                }, 100);
            })
            .catch(error => {
                this.errorCapture.emit(`Ngx Image Compress: Could not access the camera. ${error}`);
                this.streamOpened = true;
            });
    }

    acquireImage(): void {
        const canvas = document.createElement('canvas');
        const video = this.videoElement && this.videoElement.nativeElement;
        if (!video) {
            this.errorCapture.emit('Ngx Image Compress - Error in acquisition of video element.');
            this.streamOpened = false;
            return;
        }
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const context2d = canvas.getContext('2d');
        if (context2d) context2d.drawImage(video, 0, 0);
        const newImage = canvas.toDataURL('jpg', 95);
        if (this.videoStream) {
            this.videoStream.getVideoTracks().forEach(track => track.stop());
        }
        this.imageCaptured.emit(newImage);
        this.streamOpened = false;
    }
}
