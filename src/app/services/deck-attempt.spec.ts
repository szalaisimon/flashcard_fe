import {provideHttpClient} from '@angular/common/http';
import {provideHttpClientTesting} from '@angular/common/http/testing';
import {TestBed} from '@angular/core/testing';

import {DeckAttemptService} from './deck-attempt.service';

describe('DeckAttempt', () => {
  let service: DeckAttemptService;

  beforeEach(() => {
    TestBed.configureTestingModule({providers: [provideHttpClient(), provideHttpClientTesting()]});
    service = TestBed.inject(DeckAttemptService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
