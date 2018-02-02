import {Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import {AngularFirestore} from 'angularfire2/firestore';
import {AngularFireDatabase, AngularFireAction} from 'angularfire2/database';
import {Observable} from 'rxjs/Observable';
import { isPlatformBrowser } from '@angular/common';
import { AngularFireAuth } from 'angularfire2/auth';

import * as firebase from 'firebase/app';
import { User } from '@firebase/auth-types';

@Component({
  selector: 'home',
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

      {{ (user$ | async) | json }}
      
      <section class="ons-sl" *ngIf="articles$ | async; let articles; else loading">
        <article *ngFor="let article of articles; let idx = index">
          <div class="ons-sr">
            <h2>{{ idx+1 }}</h2>
          </div>
          <div class="ons-sd">
            <h4>
              <a [routerLink]="['articles', article.id]">{{ article.doc.get('title') }}</a>
            </h4>
            <div class="ons-sm">
              <span *ngIf="article.author | async; let author; else loadingAuthor">
                <a [routerLink]="['authors', author.id]">{{ author.get('name') }}</a>
              </span>
              <ng-template #loadingAuthor>Loading author...</ng-template>
              <span class="article-date">
                | {{ article.doc.get('publishedAt') | date: 'short' }}
              </span>
              <span>
                | {{ (article.viewCount | async) || 0 }} {{ (article.viewCount | async) !== 1 ? 'viewers' : 'viewer' }}
              </span>
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
    </div>
  `
})
export class HomeComponent implements OnInit {
  public date: Date;
  public catchphrase: string;
  public articles$: Observable<any[]>;
  public articleViewCounts$: Observable<AngularFireAction<firebase.database.DataSnapshot>[]>;
  public user$: Observable<User|null>;

  constructor(auth: AngularFireAuth, afs: AngularFirestore, rtdb: AngularFireDatabase, @Inject(PLATFORM_ID) platformId) {
    this.articles$ = afs.collection('articles', ref => ref.orderBy('publishedAt', 'desc'))
      .snapshotChanges().map(articles =>
        articles.map(article => {
          const id = article.payload.doc.id;
          const author = afs.doc(article.payload.doc.get('author').path).snapshotChanges().map(author => author.payload);
          const viewCount = this.articleViewCounts$.switchMap(articleViewCounts => 
            articleViewCounts.filter(value => 
              value.key == id
            ).map(value => value.payload.val() as number)
          )
          return {id, author, viewCount, doc: article.payload.doc};
        })
      );

    this.user$ = auth.authState;

    this.articleViewCounts$ = rtdb.list('articleViewCount').snapshotChanges();
  }

  ngOnInit() {
    this.date = new Date();
    this.catchphrase = 'Developers, developers, developers!'; // TODO randomize
  }
}
