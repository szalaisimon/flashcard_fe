import {TestBed} from '@angular/core/testing';
import {provideRouter} from '@angular/router';
import {provideHttpClient} from '@angular/common/http';
import {provideHttpClientTesting, HttpTestingController} from '@angular/common/http/testing';
import {App} from './app';
import {environment} from '../environments/environment';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()]
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    TestBed.inject(HttpTestingController).expectOne(`${environment.apiUrl}/api/v1/user/me`).flush({username: 'learner'});
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should render the application title', () => {
    const fixture = TestBed.createComponent(App);
    TestBed.inject(HttpTestingController).expectOne(`${environment.apiUrl}/api/v1/user/me`).flush({username: 'learner'});
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.header-bar-center')?.textContent).toContain('FlashCard Application');
  });
});
