import {Component, Input} from '@angular/core';
import { CommonModule } from '@angular/common';
import {FormGroup, ReactiveFormsModule} from '@angular/forms';

export type MetaData<T> = Record<keyof T,  {
  label: string;
  placeholder?: string;
  type?: 'text' | 'email' | 'password';
}>
@Component({
  selector: 'app-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <form [formGroup]="fg">
      <div class="grid gap-6 mb-6 md:grid-cols-3">
        <div *ngFor="let key of keys(metaData)">
          <label for="{{key}}" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">{{metaData[key].label}}</label>
          <input type="{{metaData[key].type ? metaData[key].type: 'text'}}" id="{{key}}" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-slate-500 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="{{metaData[key].placeholder}}">
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
