import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from 'angularfire2/firestore';
import { Observable } from 'rxjs/Observable';

@Component({
  selector: 'home',
  template: `
    <p>{{ date | date: 'fullDate' }} | {{ catchphrase }}</p>
    <ul *ngIf="articles$ | async; let articles; else loading">
      <li class="text" *ngFor="let article of articles">
        <h4 [routerLink]="['articles', article.id]">{{ article.doc.get('title') }}</h4>
        <p>{{ article.doc.get('publishedAt') | date: 'fullDate' }}</p>
        <p>
          <span *ngIf="article.author | async; let author; else loading">
            By {{ author.name }}
          </span>
        </p>
      </li>
    </ul>
    <ng-template #loading>&hellip;</ng-template>
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
        const author = db.doc(article.payload.doc.get('author').path).valueChanges();
        return { id, author, doc: article.payload.doc };
      })
    )
  }

  ngOnInit() {
    this.date = new Date();
    this.catchphrase = 'Developers, developers, developers!'; // TODO randomize
  }
}