import {ComponentFixture, TestBed} from '@angular/core/testing';
import {NgxImageCompressService} from 'ngx-image-compress';
import {DOC_ORIENTATION} from '../../projects/ngx-image-compress/src/lib/models/DOC_ORIENTATION';
import {AppComponent} from './app.component';

const ANGULAR_LOGO =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABwAAAAdCAYAAAC5UQwxAAAABHNCSVQICAgIfAhkiAAAABl0RVh0U29mdHdhcmUAZ25vbWUtc2NyZWVuc2hvdO8Dvz4AAAO+SURBVEiJlVZNSxtdFH7unbGJxaRX6rvRJELAHyBIaWjBnYsKkkJ3rhrRRRcJ7cZV6d5FV0WK1kWh0IUL7aZLwW0NFfoDSkwKUkFvEj/yNTPPu5gYE5LMTA8cuDP3nOc598y5Zw7oIc75Oavv3/MmlWJdStaBwSolb1IpWh8/0jk/94Ik+t7UarR3d9lMp9kIhQYTGIarA/YaoRCb6TSt3V06tdoQQtumfXDA1soKG0oNP0lbrxcXeb246GvXUIqtlRXaBwekbZMkhZ3P03r+HCyVEFSa378DAO49exbYR8TjGNnfhynIfyJzZmdhp1KdtTw+DuTHUglwHEjE44HJAMB69WrgOpDE4xB0HDbu3wfqdX+HWAy1n8fAiNlmtDA6Owv8+ePvGw4jdHMDWa5UwMnJQAGa2SzUfxNQSrk6MQEzmw3ky8lJlCsVSABwpqb8PcbGYKyuAgCcw0M4h4cAALm6ChGJ+LrfckgAQCzm62BkMoBSAAB7cxP25iYAQCgF+fKlf8BtjmAnNAyYuZy7Pj2Fs7cHZ28PPD11t3M5wDA8IXpOSB9CubQEJJMAAGtrC2i1gFYL9tYWAEAkkzDSae+gYzEIiDahT0qNN2/chWXB2d6+i3p7G7As1+b1a08MZ2oKBGHePgwT+egR5NOnrlM+DyQSEInEHVA+D/n4McSTJ+DcHEQ+P5QQAKC1pi4WWRdiYD+0v3717P7dUtnZGdxXhaAuFqm1plulkQgYjfZFxVgM8sULz1T1nGJpCRzQuRiNAu2rY3bexmJApdJjaK2tAaZrYn/4AP74MZBIzM3ByGYB04S1toaRt297DbprRGvNsi7zemGhNw2RCHWh4Obq8pKNaHT4r2hsjE6lQq01LwqFPtvrhQVqrd2UKqXwQD3AvXbZ34qRyUBNT6NcLuNyZwesVofn8uoKV58+QSmF8elpyEymZ3skmey0Q9lJS1flwTDcy9wW8/Pn4WQDbIxcrvMpAEB2Yd+97frYIpGA8+2bG93fv4H+efLXL9jv3gHj4x0M/v7dh92ZaZxqla31dTZGR31Hh6DaGB1la32dTrXqMUSdnLC1vOw9pfmplGwtL5MnJwGmttsTHx2xOT//z2TN+Xk6R0dDm8NQwk73+PKFtZkZX6LazAzt/X0/OH9CrTUvzs54ubHB2sOH/WQTE7zc2ODF2ZkvWWDCjhYKvMrlWA+HWQ+HeZXLURcKnf0gIkjSq9zL5fLddYEASYhS0a3w7rsLQLUnAi8RWmt2g0H0GgQBGRTcMMz/AdfWZTuEfWhGAAAAAElFTkSuQmCC';

describe('AppComponent', () => {
  let fixture: ComponentFixture<AppComponent>;
  let component: AppComponent;

  let mockNgxImageCompressService: Partial<NgxImageCompressService>;

  beforeEach(() => {
    mockNgxImageCompressService = jasmine.createSpyObj([
      'uploadFile',
      'uploadMultipleFiles',
      'compressFile',
      'byteCount',
      'uploadAndGetImageWithMaxSize'
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
        image: ANGULAR_LOGO.substring(0, 100),
        orientation: DOC_ORIENTATION.Up,
      })
    );
    (mockNgxImageCompressService.compressFile as jasmine.Spy).and.returnValue(
      Promise.resolve(ANGULAR_LOGO.substring(0, 50))
    );
    await component.compressFile();
    expect(mockNgxImageCompressService.uploadFile).toHaveBeenCalled();
    expect(component.imgResultBeforeCompress).toEqual(
      ANGULAR_LOGO.substring(0, 100)
    );
    expect(mockNgxImageCompressService.compressFile).toHaveBeenCalled();
    expect(component.imgResultAfterCompress).toEqual(
      ANGULAR_LOGO.substring(0, 50)
    );
  });

  it('should upload file', async () => {
    (mockNgxImageCompressService.uploadFile as jasmine.Spy).and.returnValue(
      Promise.resolve({
        image: ANGULAR_LOGO.substring(0, 200),
        orientation: DOC_ORIENTATION.Left,
      })
    );
    await component.uploadFile();
    expect(mockNgxImageCompressService.uploadFile).toHaveBeenCalled();
    expect(component.imgResultUpload).toEqual(ANGULAR_LOGO.substring(0, 200));
  });

  it('should upload multiple files', async () => {
    (
      mockNgxImageCompressService.uploadMultipleFiles as jasmine.Spy
    ).and.returnValue(
      Promise.resolve([
        {
          image: ANGULAR_LOGO.substring(0, 75),
          orientation: DOC_ORIENTATION.Left,
        },
        {
          image: ANGULAR_LOGO.substring(0, 125),
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
        image: ANGULAR_LOGO.substring(0, 150),
        orientation: DOC_ORIENTATION.Down,
      })
    );
    (mockNgxImageCompressService.compressFile as jasmine.Spy).and.returnValue(
      Promise.resolve(ANGULAR_LOGO.substring(0, 50))
    );
    await component.uploadAndResize();
    expect(mockNgxImageCompressService.uploadFile).toHaveBeenCalled();
    expect(mockNgxImageCompressService.compressFile).toHaveBeenCalledWith(
      ANGULAR_LOGO.substring(0, 150),
      DOC_ORIENTATION.Down,
      50,
      50,
      200,
      100
    );
    expect(component.imgResultAfterResize).toEqual(
      ANGULAR_LOGO.substring(0, 50)
    );
  });

  it('should upload, compress and resize at a 1 megabytes max', async () => {
    (mockNgxImageCompressService.uploadAndGetImageWithMaxSize as jasmine.Spy).and.returnValue(
      Promise.resolve(ANGULAR_LOGO.substring(0, 150))
    );
    await component.uploadAndReturnWithMaxSize();
    expect(mockNgxImageCompressService.uploadAndGetImageWithMaxSize).toHaveBeenCalled();
  });
});
