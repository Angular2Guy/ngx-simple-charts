/**
 *    Copyright 2021 Sven Loesekann
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
import { ModuleWithProviders, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  MODULE_CONFIG,
  SimpleChartsConfig,
} from './service/model/simple-charts-config';
import { TokenService } from './service/token.service';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { TokenInterceptor } from './service/token.interceptor';
import { RouterModule } from '@angular/router';

@NgModule({
  imports: [CommonModule, RouterModule],
})
export class NgxSimpleChartsModule {
  static forRoot(
    config: SimpleChartsConfig
  ): ModuleWithProviders<NgxSimpleChartsModule> {
    return {
      ngModule: NgxSimpleChartsModule,
      providers: [
        TokenService,
        { provide: MODULE_CONFIG, useValue: config },
        {
          provide: HTTP_INTERCEPTORS,
          useClass: TokenInterceptor,
          multi: true,
        },
      ],
    };
  }
}
