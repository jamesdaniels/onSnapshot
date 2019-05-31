import {NgModule, Component, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterModule} from '@angular/router';
import {ActivatedRoute} from '@angular/router';
import { Observable, Subscription } from 'rxjs';
import { switchMap, map } from 'rxjs/operators';
import * as firebase from 'firebase/app';

import {AngularFirestore} from '@angular/fire/firestore';
import { AngularFirePerformance } from '@angular/fire/performance';
import { AngularFireMessaging } from '@angular/fire/messaging';

@Component({
  selector: 'author-view',
  template: `
    <div class="ons-lc">
      <nav class="ons-nb">
        <div class="ons-hi">
          <a routerLink="/">
            <picture>
              <source class="ons-logo" srcset="/assets/images/onSnapshot_logo.webp" type="image/webp">
              <source class="ons-logo" srcset="/assets/images/onSnapshot_logo.png" type="image/png">
              <img class="ons-logo" src="/assets/images/onSnapshot_logo.png" alt="onSnapshot logo">
            </picture>
          </a>
        </div>

        <ul class="ons-nl">
          <li>
            <a href="/?sort=hot">HOT</a>
          </li>
          <li>
            <a href="/?sort=fresh">FRESH</a>
          </li>
        </ul>
      </nav>
      
      <main>
        <div class="author-details" *ngIf="author$ | async; let author">
          <div class="author-avatar" *ngIf="author.avatarUrl">
            <div class="author-avatar-img" [style.background-image]="'url('+author.avatarUrl+')'"></div>
          </div>
          <div class="author-text">
            <h2>{{ author.name }}</h2>
            <p>{{ author.bio }}</p>
          </div>
        </div>
        <section class="ons-sl" *ngIf="articles$ | async; let articles; else loading">
          <article *ngFor="let article of articles; let idx = index">
            <div class="ons-sr">
              <h2>{{ idx+1 }}</h2>
            </div>
            <div class="ons-sd">
              <h4>
                <a [routerLink]="['/articles', article.id]">{{ article.doc.get('title') }}</a>
              </h4>
              <div class="ons-sm">
                published {{ article.doc.get('publishedAt').toDate() | date: 'fullDate' }}
              </div>
            </div>
          </article>
        </section>
        <ng-template class="loading-template" #loading>
          <div class="cssload-thecube">
            <div class="cssload-cube cssload-c1"></div>
            <div class="cssload-cube cssload-c2"></div>
            <div class="cssload-cube cssload-c4"></div>
            <div class="cssload-cube cssload-c3"></div>
          </div>
        </ng-template>
      </main>
    </div>
  `
})
export class AuthorComponent implements OnInit {
  public date: Date;
  public catchphrase: string;
  public author$: Observable<any>;
  public articles$: Observable<any[]>;

  constructor(afm: AngularFireMessaging, afs: AngularFirestore, route: ActivatedRoute) {

    // WIP
    // Is this user subscribed to push notifications?
    afm.getToken.subscribe(console.log, console.error);

    this.author$ = route.params.pipe(switchMap(params =>
      afs.doc(`authors/${params['id']}`).valueChanges()
    ));
    this.articles$ = route.params.pipe(switchMap(params =>
      afs.collection('articles', ref => ref.orderBy('publishedAt', 'desc')
        .where('author', '==',
          afs.firestore.doc(`authors/${params['id']}`)))
        .snapshotChanges()
    ),map(articles =>
      articles.map(article => {
        const id = article.payload.doc.id;
        return {id, doc: article.payload.doc};
      })
    ));
  }

  ngOnInit() {
    this.date = new Date();
    this.catchphrase = 'Developers, developers, developers!'; // TODO randomize
  }
}


@NgModule({
  declarations: [AuthorComponent],
  imports: [
    CommonModule,
    RouterModule.forChild([
      {path: '', component: AuthorComponent, pathMatch: 'full'}
    ])
  ]
})
export class AuthorModule {
}
