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
  selector: 'article-view',
  template: `
    <div *ngIf="article$ | async; let article; else loading">
      <h3>{{ article.title }}</h3>
      <p>
        <span *ngIf="viewCount$ | async; let viewCount; else loading">
          Viewers {{ viewCount }}
        </span>
      </p>
      <p>
        <span *ngIf="article.author | async; let author; else loading">
          By <a [routerLink]="['/authors', author.id]">{{ author.get('name') }}</a>
        </span>
      </p>
      {{ article.body }}
    </div>
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
        // TODO do this automatically in AngularFire
        article['author'] = afs.doc(article['author'].path).snapshotChanges().map(author => author.payload);
      }
      return article;
    });
    this.viewCount$ = route.params.switchMap(params => 
      rtdb.object(`articleViewCount/${params['id']}`).valueChanges()
    )
    Observable.combineLatest(route.params, afAuth.authState).subscribe(([params, authState]) => {
      if (authState) {
        if (this.visitorRef) {
          this.visitorRef.remove();
        }
        this.visitorRef = rtdb.database.ref(`articleVisitors/${params['id']}/${authState.uid}`);
        this.visitorRef.onDisconnect().remove();
        return Observable.fromPromise(this.visitorRef.set(true));
      } else {
        if (this.visitorRef) {
          this.visitorRef.remove();
        }
        return Observable.fromPromise(afAuth.auth.signInAnonymously());
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
    CommonModule,
    RouterModule.forChild([
      { path: '', component: ArticleComponent, pathMatch: 'full'}
    ])
  ]
})
export class ArticleModule {
}