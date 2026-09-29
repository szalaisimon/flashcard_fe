import {inject, Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class Flashcard {
  private readonly httpClient = inject(HttpClient);

}
