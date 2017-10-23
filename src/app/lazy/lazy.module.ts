import { NgModule, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ActivatedRoute } from '@angular/router';

import { AngularFirestore } from 'angularfire2/firestore';
import { Observable } from 'rxjs/Observable';

@Component({
  selector: 'lazy-view',
  template: `
    <div *ngIf="article$ | async; let article; else loading">
      <h3>{{ article.title }}</h3>
      <p>
        <span *ngIf="article.author | async; let author; else loading">
          By {{ author.name }}
        </span>
      </p>
      {{ article.body }}
    </div>
    <ng-template #loading>&hellip;</ng-template>
  `
})
export class LazyComponent {
  public article$: Observable<any>;

  constructor(db: AngularFirestore, route: ActivatedRoute) {
    this.article$ = route.params.switchMap(params => 
      db.doc(`articles/${params['id']}`).valueChanges().map(article => {
        if (article) {
          // TODO do this automatically in AngularFire
          article['author'] = db.doc(article['author'].path).valueChanges();
        }
        return article;
      })
    );
  }
}


@NgModule({
  declarations: [LazyComponent],
  imports: [
    CommonModule,
    RouterModule.forChild([
      { path: '', component: LazyComponent, pathMatch: 'full'}
    ])
  ]
})
export class LazyModule {
}