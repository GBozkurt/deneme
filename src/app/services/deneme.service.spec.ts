import { TestBed } from '@angular/core/testing';

import { DenemeService } from './deneme.service';

describe('DenemeService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: DenemeService = TestBed.get(DenemeService);
    expect(service).toBeTruthy();
  });
});
