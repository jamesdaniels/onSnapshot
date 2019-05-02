import { Component, ApplicationRef } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';

@Component({
  selector: 'app-root',
  template: `
    <router-outlet></router-outlet>
  `,
  styles: []
})
export class AppComponent {
  constructor(appRef: ApplicationRef) {
    // Good performance monitoring opp
    // appRef.isStable.subscribe(isStable => console.log('isStable', isStable));
  }
}
