import {provideHttpClient} from '@angular/common/http';
import {provideHttpClientTesting} from '@angular/common/http/testing';
import {provideRouter} from '@angular/router';
import {ComponentFixture, TestBed} from '@angular/core/testing';

import {CardCreate} from './card-create';

describe('CardCreate', () => {
  let component: CardCreate;
  let fixture: ComponentFixture<CardCreate>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
      imports: [CardCreate]
    })
      .compileComponents();

    fixture = TestBed.createComponent(CardCreate);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('deckId', 1);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
