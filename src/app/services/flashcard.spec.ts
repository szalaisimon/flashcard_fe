import {provideHttpClient} from '@angular/common/http';
import {provideHttpClientTesting} from '@angular/common/http/testing';
import {TestBed} from '@angular/core/testing';

import {Flashcard} from './flashcard';

describe('Flashcard', () => {
  let service: Flashcard;

  beforeEach(() => {
    TestBed.configureTestingModule({providers: [provideHttpClient(), provideHttpClientTesting()]});
    service = TestBed.inject(Flashcard);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
