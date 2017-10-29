import {Component, OnInit} from '@angular/core';
import {AngularFirestore} from 'angularfire2/firestore';
import {Observable} from 'rxjs/Observable';

@Component({
  selector: 'home',
  template: `
    <div class="ons-lc">
      <nav class="ons-nb">
        <div class="ons-hi">
          <a routerLink="/">
            <img height="64" width="64" alt="onSnapshot Logo" src="assets/images/onSnapshot_logo.png"/>
          </a>
        </div>
        <div class="ons-nl">
          {{ date | date: 'fullDate' }}
        </div>
      </nav>
      
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
              by <span *ngIf="article.author | async; let author; else loading">
                <a [routerLink]="['authors', author.id]">{{ author.get('name') }}</a>
              </span>
              {{ article.doc.get('publishedAt') | date: 'fullDate' }}
            </div>
          </div>
        </article>
      </section>
      <ng-template #loading>&hellip;</ng-template>
    </div>
  `
})
export class HomeComponent implements OnInit {
  public date: Date;
  public catchphrase: string;
  public articles$: Observable<any[]>;

  constructor(db: AngularFirestore) {
    this.articles$ = db.collection('articles', ref => ref.orderBy('publishedAt', 'desc')).snapshotChanges().map(articles =>
      articles.map(article => {
        const id = article.payload.doc.id;
        const author = db.doc(article.payload.doc.get('author').path).snapshotChanges().map(author => author.payload);
        return {id, author, doc: article.payload.doc};
      })
    )
  }

  ngOnInit() {
    this.date = new Date();
    this.catchphrase = 'Developers, developers, developers!'; // TODO randomize
  }
}
