import {NgModule, Component} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterModule} from '@angular/router';
import {ActivatedRoute} from '@angular/router';
import {Observable, Subscription} from 'rxjs/Rx';

import {AngularFirestore} from 'angularfire2/firestore';
import {AngularFireAuth} from 'angularfire2/auth'
import {AngularFireDatabase} from 'angularfire2/database';

import {MarkdownToHtmlModule} from 'markdown-to-html-pipe';

import * as firebase from 'firebase/app';

@Component({
  selector: 'article-view',
  template: `
    <div *ngIf="article$ | async; let article; else loading">
      <h2>{{ article.title }}</h2>
      <p>
        By
        <span *ngIf="article.author | async; let author; else loading">
          <a [routerLink]="['/authors', author.id]">{{ author.get('name') }}</a>
        </span>
        |
        {{ article.publishedAt | date: 'fullDate' }}
        |
        Being read by
        <span *ngIf="viewCount$ | async; let viewCount; else loadingViwers">
          {{ viewCount }}
        </span>
        viewers
      </p>
      <div [innerHTML]=" article.body | MarkdownToHtml "></div>
    </div>
    <ng-template #loadingViwers>1</ng-template>
    <ng-template #loading>&hellip;</ng-template>
  `
})
export class ArticleComponent {
  public article$: Observable<any>;
  public viewCount$: Observable<any>;
  public visitorRef: firebase.database.Reference | null;

  constructor(afs: AngularFirestore, rtdb: AngularFireDatabase, route: ActivatedRoute, afAuth: AngularFireAuth) {
    this.article$ = route.params.switchMap(params =>
      afs.doc(`articles/${params['id']}`).valueChanges()
    ).map(article => {
      if (article) {
        article['author'] = afs.doc(article['author'].path).snapshotChanges().map(author => author.payload);
      }
      return article;
    });
    this.viewCount$ = route.params.switchMap(params =>
      rtdb.object(`articleViewCount/${params['id']}`).valueChanges()
    );
    Observable.combineLatest(route.params, afAuth.authState).subscribe(([params, authState]) => {
      if (this.visitorRef) {
        this.visitorRef.remove()
      }
      if (authState) {
        this.visitorRef = rtdb.database.ref(`articleVisitors/${params['id']}/${authState.uid}`);
        this.visitorRef.onDisconnect().remove();
        this.visitorRef.set(true);
      } else {
        afAuth.auth.signInAnonymously();
      }
    });
  }

  ngOnDestroy() {
    if (this.visitorRef) {
      this.visitorRef.remove();
    }
  }
}


@NgModule({
  declarations: [ArticleComponent],
  imports: [
    MarkdownToHtmlModule,
    CommonModule,
    RouterModule.forChild([
      {path: '', component: ArticleComponent, pathMatch: 'full'}
    ])
  ]
})
export class ArticleModule {
}
