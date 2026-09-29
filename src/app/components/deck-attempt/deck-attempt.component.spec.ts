import {provideHttpClient} from '@angular/common/http';
import {provideHttpClientTesting} from '@angular/common/http/testing';
import {provideRouter} from '@angular/router';
import {ComponentFixture, TestBed} from '@angular/core/testing';

import {DeckAttemptComponent} from './deck-attempt.component';

describe('DeckAttempt', () => {
  let component: DeckAttemptComponent;
  let fixture: ComponentFixture<DeckAttemptComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
      imports: [DeckAttemptComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(DeckAttemptComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
