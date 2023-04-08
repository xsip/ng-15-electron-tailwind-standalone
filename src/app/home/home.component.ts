import {Component, inject} from '@angular/core';
import { CommonModule } from '@angular/common';
import {FormBuilder, Validators} from '@angular/forms';
import {FormComponent, MetaData} from '../ui/form/form.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormComponent],
  template: `
      <app-form [fg]="fg" [metaData]="metaData"></app-form>
  `,
  styles: [
  ]
})
export class HomeComponent {
  fb = inject(FormBuilder);
  fg = this.fb.group({
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
  });
  metaData: MetaData<typeof this.fg.value> = {
    firstName: {
      placeholder: 'Firstname',
      label: 'Firstname'
    },
    lastName: {
      placeholder: 'Lastname',
      label: 'Lastname'
    }
  }
}
