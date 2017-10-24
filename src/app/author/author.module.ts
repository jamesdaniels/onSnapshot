import { NgModule, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { Observable, Subscription } from 'rxjs/Rx';

import { AngularFirestore } from 'angularfire2/firestore';
import { AngularFireAuth } from 'angularfire2/auth'
import { AngularFireDatabase } from 'angularfire2/database';

import * as firebase from 'firebase/app';

@Component({
  selector: 'author-view',
  template: `
    <div *ngIf="author$ | async; let author; else loading">
      <h2>{{ author.name }}</h2>
      <p>{{ author.bio }}</p>
    </div>
    <h3>Published Articles</h3>
    <ul *ngIf="articles$ | async; let articles; else loading">
      <li class="text" *ngFor="let article of articles">
        <h4><a [routerLink]="['/articles', article.id]">{{ article.doc.get('title') }}</a></h4>
        <p>{{ article.doc.get('publishedAt') | date: 'fullDate' }}</p>
      </li>
    </ul>
    <ng-template #loading>&hellip;</ng-template>
  `
})
export class AuthorComponent {
  public author$: Observable<any>;
  public articles$: Observable<any[]>;

  constructor(afs: AngularFirestore, route: ActivatedRoute) {
    this.author$ = route.params.switchMap(params => 
      afs.doc(`authors/${params['id']}`).valueChanges()
    );
    this.articles$ = route.params.switchMap(params =>
      afs.collection('articles', ref => ref.orderBy('publishedAt', 'desc').where('author', '==', afs.firestore.doc(`authors/${params['id']}`))).snapshotChanges()
    ).map(articles =>
      articles.map(article => {
        const id = article.payload.doc.id;
        return { id, doc: article.payload.doc };
      })
    );
  }
}


@NgModule({
  declarations: [AuthorComponent],
  imports: [
    CommonModule,
    RouterModule.forChild([
      { path: '', component: AuthorComponent, pathMatch: 'full'}
    ])
  ]
})
export class AuthorModule {
}