import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from 'angularfire2/firestore';
import { Observable } from 'rxjs/Observable';

@Component({
  selector: 'home',
  template: `
    <p>{{ date | date: 'fullDate' }} | {{ catchphrase }}</p>
    <ul>
      <li class="text" *ngFor="let article of articles | async">
        <h4>{{ article.title }}</h4>
        <p>By {{ (article.author | async) | json }}</p>
        {{ article.body }}
      </li>
    </ul>
  `
})
export class HomeComponent implements OnInit {
  public date: Date;
  public catchphrase: string;
  public articles: Observable<any[]>;

  constructor(db: AngularFirestore) {
    this.articles = db.collection('articles').valueChanges().map(articles =>
      articles.map(article => {
        // TODO figure out why this isn't working
        article['author'] = db.doc(article['author'].path).valueChanges();
        return article;
      })
    )
  }

  ngOnInit() {
    this.date = new Date();
    this.catchphrase = 'Developers, developers, developers!'; // TODO randomize
  }
}