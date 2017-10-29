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
    <div class="ons-lc">
      <nav class="ons-nb">
        <div class="ons-hi">
          <a routerLink="/">
            <img height="64" width="64" alt="onSnapshot Logo" src="assets/images/onSnapshot_logo.png"/>
          </a>
        </div>
        
        <ul class="ons-nl">
          <li>
            <a href="/?hot">HOT</a>
          </li>
          <li>
            <a href="/?fresh">FRESH</a>
          </li>
        </ul>
      </nav>
      
      <main>
        <div class="author-details" *ngIf="author$ | async; let author; else loading">
          <div class="author-avatar" *ngIf="author.avatarUrl">
            <img [src]="author.avatarUrl" />
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
                published {{ article.doc.get('publishedAt') | date: 'fullDate' }}
              </div>
            </div>
          </article>
        </section>
        <ng-template #loading>&hellip;</ng-template>
      </main>
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
