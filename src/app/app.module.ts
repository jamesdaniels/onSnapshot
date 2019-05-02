import { BrowserModule } from '@angular/platform-browser';
import { NgModule, NgZone } from '@angular/core';
import { RouterModule, PreloadAllModules } from '@angular/router';

import { AppComponent } from './app.component';
import { HomeComponent } from './home/home.component';
import { CommonModule } from '@angular/common';

import { FirebaseAppConfig, AngularFireModule } from '@angular/fire';
import { AngularFireAuthModule } from '@angular/fire/auth';
import { AngularFireDatabaseModule } from '@angular/fire/database';
import { environment } from '../environments/environment';
import { NavComponent } from './nav/nav.component';

import { ServiceWorkerModule } from '@angular/service-worker';
//import { EnableStateTransferToken } from '@angular/fire/firestore';
import { PrebootModule } from 'preboot';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    NavComponent
  ],
  imports: [
    CommonModule,
    BrowserModule.withServerTransition({appId: 'my-app'}),
    ServiceWorkerModule.register('/ngsw-worker.js', {enabled: environment.production}),
    RouterModule.forRoot([
      { path: '', component: HomeComponent, pathMatch: 'full'},
      { path: 'articles/:id', loadChildren: './article/article.module#ArticleModule'},
      { path: 'authors/:id', loadChildren: './author/author.module#AuthorModule'}
    ], { preloadingStrategy: PreloadAllModules, initialNavigation: 'enabled' }),
    AngularFireModule.initializeApp(environment.firebase),
    AngularFireAuthModule,
    AngularFireDatabaseModule,
    PrebootModule.withConfig({ appRoot: 'app-root' })
  ],
  bootstrap: [ ],
  providers: [
//    { provide: EnableStateTransferToken, useValue: true }
  ]
})
export class AppModule { }
