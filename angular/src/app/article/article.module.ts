import { NgModule, Component, OnInit, OnDestroy, Inject, PLATFORM_ID } from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterModule} from '@angular/router';
import {ActivatedRoute} from '@angular/router';
import {Observable, Subscription} from 'rxjs/Rx';
import { FormsModule }   from '@angular/forms';

import {AngularFirestore, AngularFirestoreCollection} from 'angularfire2/firestore';
import {AngularFireAuth} from 'angularfire2/auth'
import {AngularFireDatabase} from 'angularfire2/database';

import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { isPlatformBrowser } from '@angular/common';

import * as firebase from 'firebase/app';

@Component({
  selector: 'article-view',
  template: `
    <div class="ons-lc">
      <nav class="ons-nb">
        <div class="ons-hi">
          <a routerLink="/">
            <picture>
              <source class="ons-logo" srcset="/assets/images/onSnapshot_logo.webp" type="image/webp">
              <source class="ons-logo" srcset="/assets/images/onSnapshot_logo_sm.png" type="image/png">
              <img class="ons-logo" src="/assets/images/onSnapshot_logo_sm.png" alt="onSnapshot logo">
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
            <ng-template #loadingViewers><img class="inline-icon" src="/assets/icons/if_glasses.svg" /> 1 viewer</ng-template>
          </p>
          <div class="article-text" [innerHTML]="article.body"></div>
        </article>
        
        <div class="comments" *ngIf="comments$ | async; let comments">
          <h3 class="comments-heading">Comments</h3>
          <div *ngFor="let comment of comments">
            <div class="comment-details" *ngIf="comment.profile | async; let profile">
              <div class="comment-avatar" *ngIf="profile.avatarUrl">
                <div class="comment-avatar-img" [style.background-image]="'url('+profile.avatarUrl+')'"></div>
              </div>
              <div class="comment-text">
                <h2>"{{ comment.text }}"</h2>
                <p>{{ profile.name }} <small *ngIf="comment.commentedAt">@ {{ comment.commentedAt }}</small></p>
              </div>
            </div>
          </div>
        </div>
        
        <div class="comments-auth" *ngIf="article$ | async">
          <h4>Add your 2¢</h4>
          <div *ngIf="isAnonymous$ | async">
            <button (click)="signinWithGoogle()">Sign in with Google to comment</button>
          </div>
          <div *ngIf="!(isAnonymous$ | async)">
            <p><textarea [(ngModel)]="newCommentText" name="newCommentText" rows="4" cols="50"></textarea></p>
            <p>Commenting as {{ (afAuth.authState | async)?.displayName }} <button (click)="addComment()" [disabled]="newCommentText == ''">Add comment</button></p>
            <p><button (click)="signout()">Sign out</button></p>
          </div>
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
  public visitorRef$: BehaviorSubject<firebase.database.Reference>;
  public isAnonymous$: Observable<boolean>;
  public commentCollection$: BehaviorSubject<AngularFirestoreCollection<any>>;
  public comments$: Observable<any[]>;
  public profileRef$: BehaviorSubject<firebase.firestore.DocumentReference | null>;
  public profile$: Observable<firebase.firestore.DocumentSnapshot | null>;
  public newCommentText: string = '';

  constructor(afs: AngularFirestore, rtdb: AngularFireDatabase, route: ActivatedRoute, public afAuth: AngularFireAuth, @Inject(PLATFORM_ID) platformId) {
    this.profileRef$ = new BehaviorSubject(undefined);
    this.visitorRef$ = new BehaviorSubject(undefined);
    this.commentCollection$ = new BehaviorSubject(undefined);

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

    this.afAuth.authState.map(user =>
      user && afs.firestore.doc(`profiles/${user.uid}`)
    ).subscribe(this.profileRef$);

    this.profile$ = this.profileRef$.switchMap(ref =>
      ref ? Observable.fromPromise(ref.get()) : Observable.of(null)
    );

    // when profile$ changes, if the profile doesn't exist create it (so long as we aren't anon)
    this.profile$.withLatestFrom(this.profileRef$, afAuth.authState)
    .filter(([profile, ref, user]) => !!user && !user.isAnonymous && !!ref && !profile.exists)
    .subscribe(([_, ref, user]) =>
      ref.set({
        name: user.displayName,
        avatarUrl: user.photoURL
      })
    );
    
    this.visitorRef$.distinctUntilChanged().pairwise().subscribe(([prevRef, _]) => {
      prevRef && prevRef.remove();
    });

    if (isPlatformBrowser(platformId)) {
      afAuth.authState.filter(u => !u).subscribe(() => afAuth.auth.signInAnonymously());
      Observable.combineLatest(route.params, afAuth.authState.filter(u => !!u)).map(([params, authState]) =>
        rtdb.database.ref(`articleVisitors/${params['id']}/${authState.uid}`)
      ).subscribe(this.visitorRef$);
    }

    this.visitorRef$.filter(r => !!r).subscribe(r => {
      r.set(true).then(() => r.onDisconnect().remove());
    });

    this.isAnonymous$ = afAuth.authState.map(user => user && user.isAnonymous);

    route.params.map(params =>
      afs.collection(`articles/${params['id']}/comments`, ref => ref.orderBy('commentedAt', 'asc'))
    ).subscribe(this.commentCollection$);

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
    this.afAuth.auth.signInWithPopup(new firebase.auth.GoogleAuthProvider())
  }

  signout() {
    this.afAuth.auth.signOut();
  }

  addComment() {
    this.commentCollection$.getValue().add({
      text: this.newCommentText,
      profile: this.profileRef$.getValue(),
      commentedAt: new Date()
    }).then(() => {
      this.newCommentText = "";
    });
    return false;
  }

  ngOnInit() {
    this.date = new Date();
    this.catchphrase = 'Developers, developers, developers!'; // TODO randomize
  }

  ngOnDestroy() {
    if (this.visitorRef$.getValue()) {
      this.visitorRef$.getValue().remove();
    }
  }
}


@NgModule({
  declarations: [ArticleComponent],
  imports: [
    FormsModule,
    CommonModule,
    RouterModule.forChild([
      {path: '', component: ArticleComponent, pathMatch: 'full'}
    ])
  ]
})
export class ArticleModule {
}
