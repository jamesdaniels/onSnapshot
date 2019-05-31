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
//import { PrebootModule } from 'preboot';
import { canActivate, loggedIn, AngularFireAuthGuardModule } from '@angular/fire/auth-guard';
import { AngularFirestoreModule } from '@angular/fire/firestore';
import { AngularFirePerformanceModule } from '@angular/fire/performance';
import { AngularFireMessagingModule } from '@angular/fire/messaging';

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
      { path: 'articles/:id', loadChildren: () => import('./article/article.module').then(m => m.ArticleModule)},
      { path: 'authors/:id', loadChildren: () => import('./author/author.module').then(m => m.AuthorModule), ...canActivate(loggedIn)}
    ], { preloadingStrategy: PreloadAllModules, initialNavigation: 'enabled' }),
    AngularFireModule.initializeApp(environment.firebase),
    AngularFireAuthModule,
    AngularFireDatabaseModule,
    AngularFirestoreModule.enablePersistence(),
    AngularFireAuthGuardModule,
    AngularFirePerformanceModule,
    AngularFireMessagingModule
    //PrebootModule.withConfig({ appRoot: 'app-root' })
  ],
  bootstrap: [ ],
  providers: [
//    { provide: EnableStateTransferToken, useValue: true }
  ]
})
export class AppModule { }
