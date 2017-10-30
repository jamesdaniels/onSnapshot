import {NgModule, Component, OnInit, OnDestroy} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterModule} from '@angular/router';
import {ActivatedRoute} from '@angular/router';
import {Observable, Subscription} from 'rxjs/Rx';

import {AngularFirestore, AngularFirestoreCollection} from 'angularfire2/firestore';
import {AngularFireAuth} from 'angularfire2/auth'
import {AngularFireDatabase} from 'angularfire2/database';

import { BehaviorSubject } from 'rxjs/BehaviorSubject';

import * as firebase from 'firebase/app';

@Component({
  selector: 'article-view',
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
            <a href="/?sort=hot">HOT</a>
          </li>
          <li>
            <a href="/?sort=fresh">FRESH</a>
          </li>
        </ul>
      </nav>

      <section class="ons-se">
        <article *ngIf="article$ | async; let article; else loading">
          <h2 class="article-title">{{ article.title }}</h2>
          <p class="article-byline">
            <span *ngIf="article.author | async; let author; else loadingAuthor">
              <img class="inline-icon" src="/assets/icons/if_pencil.svg" />
              <a [routerLink]="['/authors', author.id]">{{ author.get('name') }}</a>
            </span>
            <ng-template #loadingAuthor>Loading author...</ng-template>
            <span>
              <img class="inline-icon" src="/assets/icons/if_calendar.svg" />
              {{ article.publishedAt | date: 'fullDate' }}
            </span>
            <span *ngIf="viewCount$ | async; let viewCount; else loadingViewers">
              <img class="inline-icon" src="/assets/icons/if_glasses.svg" />
              {{ viewCount }} {{ viewCount !== 1 ? 'viewers' : 'viewer' }}
            </span>
            <ng-template #loadingViewers>1 viewer</ng-template>
          </p>
          <div class="article-text" [innerHTML]="article.body"></div>
        </article>

        <ul *ngIf="comments$ | async; let comments">
          <li *ngFor="let comment of comments">
            {{ comment.text }}
            {{ comment.profile | async | json }}
          </li>
        </ul>

        <div *ngIf="isAnonymous$ | async">
          <button (click)="signinWithGoogle()">Sign in with Google to comment</button>
        </div>
        <div *ngIf="!(isAnonymous$ | async)">
          <p>Hello {{ (afAuth.authState | async)?.displayName }},</p>
          <button (click)="addComment('test')">Add test comment</button>
          <button (click)="signout()">Sign out</button>
        </div>

        <ng-template class="loading-template" #loading>
          <div class="cssload-thecube">
            <div class="cssload-cube cssload-c1"></div>
            <div class="cssload-cube cssload-c2"></div>
            <div class="cssload-cube cssload-c4"></div>
            <div class="cssload-cube cssload-c3"></div>
          </div>
        </ng-template>
      </section>
    </div>
  `
})
export class ArticleComponent implements OnInit, OnDestroy {
  public date: Date;
  public catchphrase: string;
  public article$: Observable<any>;
  public viewCount$: Observable<any>;
  public visitorRef: firebase.database.Reference | null;
  public isAnonymous$: Observable<boolean>;
  public commentCollection$: BehaviorSubject<AngularFirestoreCollection<any>>;
  public comments$: Observable<any[]>;
  public profile$: BehaviorSubject<firebase.firestore.DocumentReference | null>;

  constructor(afs: AngularFirestore, rtdb: AngularFireDatabase, route: ActivatedRoute, public afAuth: AngularFireAuth) {
    this.profile$ = new BehaviorSubject(null);
    
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
    
    this.afAuth.authState.subscribe(user => this.profile$.next(user && afs.firestore.doc(`profiles/${user.uid}`)));
    
    Observable.combineLatest(
      afAuth.authState,
      this.profile$.switchMap(ref => ref ? Observable.fromPromise(ref.get()) : Observable.of(null))
    )
    .filter(([authState, profile]) => authState != null && profile && !profile.exists)
    .subscribe(([authState, profile]) =>
      profile.ref.set({
        name: authState.displayName
      })
    );

    Observable.combineLatest(route.params, afAuth.authState).subscribe(([params, authState]) => {
      console.log(params, authState);
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
    this.isAnonymous$ = afAuth.authState.map(user => user && user.isAnonymous);
    
    route.params.subscribe(params =>  {
      const collection = afs.collection(`articles/${params['id']}/comments`);
      if (this.commentCollection$) {
        this.commentCollection$.next(collection);
      } else {
        this.commentCollection$ = new BehaviorSubject(collection);
      }
    });

    this.comments$ = this.commentCollection$.switchMap(collection => 
      collection.valueChanges().map(comments =>
        comments.map(comment => {
          comment['profile'] = afs.doc(comment['profile'].path).valueChanges();
          return comment;
        })
      )
    );
  }

  signinWithGoogle() {
    this.afAuth.auth.signInWithPopup(new firebase.auth.GoogleAuthProvider());
  }

  signout() {
    this.afAuth.auth.signOut();
  }

  addComment(text) {
    this.commentCollection$.getValue().add({
      text: text,
      profile: this.profile$.getValue()
    });
  }

  ngOnInit() {
    this.date = new Date();
    this.catchphrase = 'Developers, developers, developers!'; // TODO randomize
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
      {path: '', component: ArticleComponent, pathMatch: 'full'}
    ])
  ]
})
export class ArticleModule {
}
