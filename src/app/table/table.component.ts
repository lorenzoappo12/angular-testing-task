import { HttpClient } from '@angular/common/http';
import { Component, ViewChild, AfterViewInit } from '@angular/core';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule, SortDirection } from '@angular/material/sort';
import { merge, Observable, of as observableOf } from 'rxjs';
import { catchError, map, startWith, switchMap } from 'rxjs/operators';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { DatePipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { HomeComponent } from '../home/home.component';
import { RouterLink } from '@angular/router';

/**
 * @title Table retrieving data through HTTP
 */
@Component({
  selector: 'app-table',
  templateUrl: './table.component.html',
  styleUrl: './table.component.scss',
  standalone: true,
  imports: [HomeComponent, MatButtonModule,RouterLink, MatTableModule, MatSortModule, MatPaginatorModule, DatePipe],
})

export class TableComponent implements AfterViewInit {
  displayedColumns: string[] = ['created', 'updated', 'title',];
  httpRequestBuilder: HttpRequestBuilder | null;
  data: GithubIssue[] = [];

  resultsLength = 0;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  constructor(private _httpClient: HttpClient) { }

  ngAfterViewInit() {
    this.httpRequestBuilder = new HttpRequestBuilder(this._httpClient);

    // If the user changes the sort order, reset back to the first page.
    this.sort.sortChange.subscribe(() => (this.paginator.pageIndex = 0));

    merge(this.sort.sortChange, this.paginator.page)
      .pipe(
        startWith({}),
        switchMap(() => {
          return this.httpRequestBuilder!.getRepoIssues(
            this.sort.active,
            this.sort.direction,
            this.paginator.pageIndex,
            this.paginator.pageSize
          ).pipe(catchError(() => observableOf(null)));
        }),
        map(data => {
          if (data === null) {
            return [];
          }

          this.resultsLength = data.total_count;
          return data.items;
        }),
      )
      .subscribe(data => (this.data = data));
  }
}

export interface GithubApi {
  items: GithubIssue[];
  total_count: number;
}

export interface GithubIssue {
  created_at: string;
  updated_at: string;
  title: string;
}

export class HttpRequestBuilder {
  constructor(private _httpClient: HttpClient) { }

  getRepoIssues(sort: string, order: SortDirection, page: number, per_page: number): Observable<GithubApi> {
    const href = 'https://api.github.com/search/issues';
    const requestUrl = `${href}?q=repo:angular/components&sort=${sort}&order=${order}&page=${page + 1
      }&per_page=${per_page}`;
console.log(requestUrl)
    return this._httpClient.get<GithubApi>(requestUrl);
  }
}


