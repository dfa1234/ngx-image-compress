import { TestBed } from '@angular/core/testing';

import { NgxImageCompressService } from './ngx-image-compress.service';

describe('NgxImageCompressService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: NgxImageCompressService = TestBed.get(NgxImageCompressService);
    expect(service).toBeTruthy();
  });
});
