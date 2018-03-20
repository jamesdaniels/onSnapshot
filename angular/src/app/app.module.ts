import { BrowserModule } from '@angular/platform-browser';
import { NgModule, NgZone } from '@angular/core';
import { RouterModule } from '@angular/router';

import { AppComponent } from './app.component';
import { HomeComponent } from './home/home.component';
import { CommonModule } from '@angular/common';

import { FirebaseAppConfig, AngularFireModule } from 'angularfire2';
import { AngularFireAuthModule } from 'angularfire2/auth';
import { AngularFireDatabaseModule } from 'angularfire2/database';
import { environment } from '../environments/environment';
import { NavComponent } from './nav/nav.component';

import { ServiceWorkerModule } from '@angular/service-worker';

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
    ]),
    AngularFireModule.initializeApp(environment.firebase),
    AngularFireAuthModule,
    AngularFireDatabaseModule
  ],
  bootstrap: [ ]
})
export class AppModule { }
