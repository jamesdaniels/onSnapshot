import {Component, OnInit} from '@angular/core';

@Component({
  selector: 'app-nav',
  template: `
      <ul class="ons-nl">
        <li>
          <a href="/?hot">HOT</a>
        </li>
        <li>
          <a href="/?fresh">FRESH</a>
        </li>
      </ul>
  `
})
export class NavComponent implements OnInit {

  constructor() { }

  ngOnInit() { }
}
