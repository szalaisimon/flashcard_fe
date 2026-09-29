import {provideHttpClient} from '@angular/common/http';
import {provideHttpClientTesting} from '@angular/common/http/testing';
import {provideRouter} from '@angular/router';
import {ComponentFixture, TestBed} from '@angular/core/testing';

import {DeckAttemptHistoryComponent} from './deck-attempt-history.component';

describe('DeckAttemptHistory', () => {
  let component: DeckAttemptHistoryComponent;
  let fixture: ComponentFixture<DeckAttemptHistoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
      imports: [DeckAttemptHistoryComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(DeckAttemptHistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
