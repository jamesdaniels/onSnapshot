import {NgModule, Component, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterModule} from '@angular/router';
import {ActivatedRoute} from '@angular/router';
import {Observable, Subscription} from 'rxjs/Rx';

import {AngularFirestore} from 'angularfire2/firestore';
import {AngularFireAuth} from 'angularfire2/auth'
import {AngularFireDatabase} from 'angularfire2/database';

import * as firebase from 'firebase/app';

@Component({
  selector: 'author-view',
  template: `
    <div class="hn-lc">
      <nav class="hn-nb">
        <div class="hn-hi">
          <a routerLink="/">
            <img height="64" width="64" alt="onSnapshot Logo" src="assets/images/onSnapshot_logo.png"/>
          </a>
        </div>
        <div class="hn-nl">
          {{ date | date: 'fullDate' }} | {{ catchphrase }}
        </div>
      </nav>
      
      <section>
        <hr class="header-divider" />
        <div class="author-details" *ngIf="author$ | async; let author; else loading">
          <div class="author-avatar" *ngIf="author.avatarUrl">
            <img [src]="author.avatarUrl" />
          </div>
          <div class="author-text">
            <h2>{{ author.name }}</h2>
            <p>{{ author.bio }}</p>
          </div>
        </div>
        <hr class="author-divider" />
        <h3 class="articles-header">Published Articles</h3>
        <section class="hn-sl" *ngIf="articles$ | async; let articles; else loading">
          <article *ngFor="let article of articles; let idx = index">
            <div class="hn-sr">
              <h2>{{ idx+1 }}</h2>
            </div>
            <div class="hn-sd">
              <h4>
                <a [routerLink]="['articles', article.id]">{{ article.doc.get('title') }}</a>
              </h4>
              <div class="hn-sm">
                published at {{ article.doc.get('publishedAt') | date: 'fullDate' }}
              </div>
            </div>
          </article>
        </section>
        <ng-template #loading>&hellip;</ng-template>
      </section>
    </div>
  `
})
export class AuthorComponent implements OnInit {
  public date: Date;
  public catchphrase: string;
  public author$: Observable<any>;
  public articles$: Observable<any[]>;

  constructor(afs: AngularFirestore, route: ActivatedRoute) {
    this.author$ = route.params.switchMap(params =>
      afs.doc(`authors/${params['id']}`).valueChanges()
    );
    this.articles$ = route.params.switchMap(params =>
      afs.collection('articles', ref => ref.orderBy('publishedAt', 'desc')
        .where('author', '==',
          afs.firestore.doc(`authors/${params['id']}`)))
        .snapshotChanges()
    ).map(articles =>
      articles.map(article => {
        const id = article.payload.doc.id;
        return {id, doc: article.payload.doc};
      })
    );
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
