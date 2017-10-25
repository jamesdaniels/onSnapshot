import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterModule} from '@angular/router';
import {LazyComponent} from "./lazy.component";

@NgModule({
  declarations: [LazyComponent],
  imports: [
    CommonModule,
    RouterModule.forChild([
      {path: '', component: LazyComponent, pathMatch: 'full'}
    ])
  ]
})
export class LazyModule {
}
