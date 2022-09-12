/**
 *    Copyright 2019 Sven Loesekann
   Licensed under the Apache License, Version 2.0 (the "License");
   you may not use this file except in compliance with the License.
   You may obtain a copy of the License at
       http://www.apache.org/licenses/LICENSE-2.0
   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
 */
import { Inject, Injectable } from '@angular/core';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { Observable, timer, Subscription, Subject } from 'rxjs';
import {
  shareReplay,
  switchMap,
  map,
  takeUntil,
  tap,
  retry,
} from 'rxjs/operators';
import { Router } from '@angular/router';
import {
  MODULE_CONFIG,
  SimpleChartsConfig,
} from './model/simple-charts-config';
//import { NgxSimpleChartsModule } from '../ngx-simple-charts.module';

export interface RefreshTokenResponse {
  refreshToken: string;
}

@Injectable()
//{providedIn: NgxSimpleChartsModule}
export class TokenService {
  private myTokenCache!: Observable<RefreshTokenResponse>;
  private readonly CACHE_SIZE = 1;
  private readonly REFRESH_INTERVAL = 45000; //45 sec
  private myToken!: string;
  private myUserId!: number;
  private myTokenSubscription!: Subscription;
  private stopTimer!: Subject<boolean>;
  public secUntilNextLogin = 0;

  constructor(
    private http: HttpClient,
    private router: Router,
    @Inject(MODULE_CONFIG) private moduleConfig: SimpleChartsConfig
  ) {}

  private refreshToken(): Observable<RefreshTokenResponse> {
    const path = !this.moduleConfig?.tokenRefreshPath
      ? '/rest/auth/refreshToken'
      : this.moduleConfig?.tokenRefreshPath;
    return this.http.get<RefreshTokenResponse>(path, {
      headers: this.createTokenHeader(),
    });
  }

  public createTokenHeader(): HttpHeaders {
    let reqOptions = new HttpHeaders().set('Content-Type', 'application/json');
    if (this.token) {
      reqOptions = new HttpHeaders()
        .set('Content-Type', 'application/json')
        .set('Authorization', `Bearer ${this.token}`);
    }
    return reqOptions;
  }

  public logout(): void {
    const path = !this.moduleConfig?.logoutPath
      ? '/rest/auth/logout'
      : this.moduleConfig?.logoutPath;
    this.http
      .put<boolean>(path, {
        headers: this.createTokenHeader(),
      })
      .pipe(tap(() => this.clear()))
      .subscribe();
  }

  private clear() {
    if (this.myTokenSubscription) {
      this.myTokenSubscription.unsubscribe();
    }
    if (this.stopTimer) {
      this.stopTimer.next(true);
      (this.stopTimer as unknown) = null;
    }
    (this.myTokenCache as unknown) = null;
    (this.myToken as unknown) = null;
    (this.myUserId as unknown) = null;
    const loginRoute = !this.moduleConfig?.loginRoute
      ? '/login'
      : this.moduleConfig.loginRoute;
    this.router.navigate([loginRoute]);
  }

  public get tokenStream(): Observable<string> {
    return this.myTokenCache.pipe(map((response) => response.refreshToken));
  }

  public get token(): string {
    return this.myToken;
  }

  public set token(token: string) {
    this.myToken = token;
    if (token && !this.myTokenCache) {
      const myStopTimer = new Subject<boolean>();
      this.stopTimer = myStopTimer;
      const myTimer = timer(0, this.REFRESH_INTERVAL);
      this.myTokenCache = myTimer.pipe(
        takeUntil(myStopTimer),
        switchMap(() => this.refreshToken()),
        retry({ count: 3, delay: 2000, resetOnSuccess: true }),
        shareReplay(this.CACHE_SIZE)
      );
      this.myTokenSubscription = this.myTokenCache.subscribe(
        (newToken) => (this.myToken = newToken.refreshToken),
        () => this.clear()
      );
    }
  }

  public get userId(): number {
    return this.myUserId;
  }

  public set userId(userId: number) {
    this.myUserId = userId;
  }
}

function NORMAL_LIB_CONFIG(NORMAL_LIB_CONFIG: any) {
  throw new Error('Function not implemented.');
}
