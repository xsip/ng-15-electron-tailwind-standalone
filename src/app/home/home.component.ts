import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  template: `
    <p class="bg-slate-800 text-white">
      home works!
    </p>
  `,
  styles: [
  ]
})
export class HomeComponent {

}
