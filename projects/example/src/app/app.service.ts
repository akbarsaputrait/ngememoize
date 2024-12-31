// projects/example/src/app/app.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface User {
  id: number;
  firstName: string;
  lastName: string;
  role: 'admin' | 'user' | 'moderator';
}

@Injectable({
  providedIn: 'root',
})
export class AppService {
  private apiUrl = 'https://dummyjson.com/users/search';

  constructor(private http: HttpClient) {}

  searchUsers(q: string): Observable<{ users: User[] }> {
    const searchUrl = `${this.apiUrl}?q=${encodeURIComponent(q)}`;
    return this.http.get<{ users: User[] }>(searchUrl);
  }
}
