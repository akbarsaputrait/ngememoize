import { TestBed } from '@angular/core/testing';

import { NgememoizeService } from './ngememoize.service';

describe('NgememoizeService', () => {
  let service: NgememoizeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NgememoizeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
