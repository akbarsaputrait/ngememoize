import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterOutlet } from '@angular/router';
import { AppService, User } from './app.service';
import { debounceTime, Subject } from 'rxjs';
import { Ngememoize, NgememoizeService, NgememoizeWithDeps } from 'ngememoize';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, FormsModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent implements OnInit {
  title = 'example';
  users: User[] = [];
  searchTerm: string = '';
  private searchSubject: Subject<string> = new Subject<string>();

  appService = inject(AppService);
  memoizeService = inject(NgememoizeService);

  @NgememoizeWithDeps<[string], User[]>(
    function (this: AppComponent) {
      return ['adminUsersList', this.searchTerm];
    },
    {
      debugLabel: 'adminUsersList',
      maxAge: 30000,
      maxSize: 100,
      keyGenerator: (...args: any[]) => {
        console.log(args);
        const filteredArgs = args.filter(
          (arg) => arg !== null && arg !== undefined
        );
        const searchTerm = filteredArgs[1] || '';
        return searchTerm ? `adminUsersList_${searchTerm}` : '';
      },
    }
  )
  get adminUsersList() {
    return this.users.filter((user) => user.role === 'admin');
  }

  ngOnInit() {
    this.searchSubject
      .pipe(debounceTime(500))
      .subscribe((term) => this.searchUsers(term));
  }

  onSearchChange(searchValue: string) {
    this.searchTerm = searchValue;
    this.searchSubject.next(searchValue);
  }

  private searchUsers(q: string) {
    if (q) {
      console.log(
        'Cache Exist: ',
        this.memoizeService.getCache('adminUsersList')
      );
      this.appService.searchUsers(q).subscribe((data) => {
        this.users = data.users;
        console.log('Caches: ', this.memoizeService.getAllCache());
        console.log('Stats: ', this.memoizeService.getCacheStats());
      });
    } else {
      this.users = [];
    }
  }
}
