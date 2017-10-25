import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from 'angularfire2/firestore';
import { Observable } from 'rxjs/Observable';

@Component({
  selector: 'home',
  templateUrl: './home.component.html'
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
