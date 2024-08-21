import { TestBed } from '@angular/core/testing';

import { EventOperationsService } from './event-operations.service';

describe('EventOperationsService', () => {
  let service: EventOperationsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EventOperationsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
