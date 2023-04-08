import { TestBed } from '@angular/core/testing';

import { ExpressService } from './express.service';

describe('ExpressServiceTsService', () => {
  let service: ExpressService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ExpressService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
