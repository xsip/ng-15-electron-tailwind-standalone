import {Component, Input} from '@angular/core';
import { CommonModule } from '@angular/common';
import {FormGroup, ReactiveFormsModule} from '@angular/forms';
import {InputComponent} from '../input/input.component';

export type MetaData<T> = Record<keyof T,  {
  label: string;
  placeholder?: string;
  type?: 'text' | 'email' | 'password';
}>
@Component({
  selector: 'app-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, InputComponent],
  template: `
    <form [formGroup]="fg">
      <div class="grid gap-6 mb-6 md:grid-cols-3">
        <app-input  [formControlName]="key" *ngFor="let key of keys(metaData)" [placeholder]="metaData[key].placeholder" [title]="metaData[key].label">

        </app-input>
        <div >
        </div>
      </div>
    </form>
  `,
  styles: [
  ]
})
export class FormComponent {
  @Input() fg!: FormGroup;
  @Input() metaData!: MetaData<any>;
  keys = Object.keys;
}
