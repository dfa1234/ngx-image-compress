import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DataUrl, NgxImageCompressService } from 'ngx-image-compress';
import { DOC_ORIENTATION } from 'projects/ngx-image-compress/src/lib/models/DOC_ORIENTATION';
import { AppComponent } from './app.component';

const testDataUrl: DataUrl =
  'data:image/jpg;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsIAAA7CARUoSoAAAABaZVhJZk1NACoAAAAIAAUBEgADAAAAAQAAAAABGgAFAAAAAQAAAEoBGwAFAAAAAQAAAFIBKAADAAAAAQACAAACEwADAAAAAQABAAAAAAAAAAAASAAAAAEAAABIAAAAAcVrKdwAAAAhSURBVBhXY/wPBAxogAlKowC4ICMjI5SFJIhsChbtDAwA+yoHBp7NHHkAAAAASUVORK5CYII=';

describe('AppComponent', () => {
  let fixture: ComponentFixture<AppComponent>;
  let component: AppComponent;

  let mockNgxImageCompressService: Partial<NgxImageCompressService>;

  beforeEach(() => {
    mockNgxImageCompressService = jasmine.createSpyObj([
      'uploadFile',
      'uploadMultipleFiles',
      'uploadFileOrReject',
      'uploadMultipleFilesOrReject',
      'compressFile',
      'byteCount',
      'uploadAndGetImageWithMaxSize',
    ]);
    (mockNgxImageCompressService.byteCount as jasmine.Spy).and.returnValue(123);

    TestBed.configureTestingModule({
      declarations: [AppComponent],
      providers: [
        {
          provide: NgxImageCompressService,
          useValue: mockNgxImageCompressService,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should render in template Upload/Compress button', () => {
    fixture.detectChanges();
    const nativeCompiledElement = fixture.debugElement.nativeElement;
    expect(nativeCompiledElement.querySelector('button').textContent).toContain(
      'Upload and compress Image'
    );
  });

  it('should compress file', async () => {
    (mockNgxImageCompressService.uploadFile as jasmine.Spy).and.returnValue(
      Promise.resolve({
        image: testDataUrl.substring(0, 100),
        orientation: DOC_ORIENTATION.Up,
      })
    );
    (mockNgxImageCompressService.compressFile as jasmine.Spy).and.returnValue(
      Promise.resolve(testDataUrl.substring(0, 50))
    );
    await component.compressFile();
    expect(mockNgxImageCompressService.uploadFile).toHaveBeenCalled();
    expect(component.imgResultBeforeCompress).toEqual(
      testDataUrl.substring(0, 100)
    );
    expect(mockNgxImageCompressService.compressFile).toHaveBeenCalled();
    expect(component.imgResultAfterCompress).toEqual(
      testDataUrl.substring(0, 50)
    );
  });

  it('should upload file', async () => {
    (mockNgxImageCompressService.uploadFileOrReject as jasmine.Spy).and.returnValue(
      Promise.resolve({
        image: testDataUrl.substring(0, 200),
        orientation: DOC_ORIENTATION.Left,
      })
    );
    await component.uploadFile();
    expect(mockNgxImageCompressService.uploadFileOrReject).toHaveBeenCalled();
    expect(component.imgResultUpload).toEqual(testDataUrl.substring(0, 200));
  });

  it('should upload multiple files', async () => {
    (
      mockNgxImageCompressService.uploadMultipleFiles as jasmine.Spy
    ).and.returnValue(
      Promise.resolve([
        {
          image: testDataUrl.substring(0, 75),
          orientation: DOC_ORIENTATION.Left,
        },
        {
          image: testDataUrl.substring(0, 125),
          orientation: DOC_ORIENTATION.Right,
        },
      ])
    );
    await component.uploadMultipleFiles();
    expect(mockNgxImageCompressService.uploadMultipleFiles).toHaveBeenCalled();
    expect(component.imgResultMultiple.length).toEqual(2);
  });

  it('should upload, compress and resize at a maximum width and height', async () => {
    (mockNgxImageCompressService.uploadFile as jasmine.Spy).and.returnValue(
      Promise.resolve({
        image: testDataUrl.substring(0, 150),
        orientation: DOC_ORIENTATION.Down,
      })
    );
    (mockNgxImageCompressService.compressFile as jasmine.Spy).and.returnValue(
      Promise.resolve(testDataUrl.substring(0, 50))
    );
    await component.uploadAndResize();
    expect(mockNgxImageCompressService.uploadFile).toHaveBeenCalled();
    expect(mockNgxImageCompressService.compressFile).toHaveBeenCalledWith(
      testDataUrl.substring(0, 150),
      DOC_ORIENTATION.Down,
      50,
      50,
      200,
      100
    );
    expect(component.imgResultAfterResize).toEqual(
      testDataUrl.substring(0, 50)
    );
  });

  it('should upload, compress and resize at a 1 megabytes max', async () => {
    (
      mockNgxImageCompressService.uploadAndGetImageWithMaxSize as jasmine.Spy
    ).and.returnValue(Promise.resolve(testDataUrl.substring(0, 150)));
    await component.uploadAndReturnWithMaxSize();
    expect(
      mockNgxImageCompressService.uploadAndGetImageWithMaxSize
    ).toHaveBeenCalled();
  });

  it('should upload, compress and be unable to resize', async () => {
    (
      mockNgxImageCompressService.uploadAndGetImageWithMaxSize as jasmine.Spy
    ).and.returnValue(Promise.reject(testDataUrl.substring(0, 150)));
    await component.uploadAndReturnWithMaxSize();
    expect(
      mockNgxImageCompressService.uploadAndGetImageWithMaxSize
    ).toHaveBeenCalled();
  });
});
