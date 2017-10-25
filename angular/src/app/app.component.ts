import { Component } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';

@Component({
  selector: 'app-root',
  template: `
    <h1 routerLink="/">onSnapshot</h1>
    <router-outlet></router-outlet>
  `,
  styles: []
})
export class AppComponent {

}
