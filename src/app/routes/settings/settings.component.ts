import {Component, inject, OnInit} from '@angular/core';
import { CommonModule } from '@angular/common';
import {FormBuilder, ReactiveFormsModule} from '@angular/forms';

import {InputComponent} from '../../ui/input/input.component';
// @ts-ignore
const  {ipcRenderer} = window.require('electron');
@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, InputComponent],
  template: `
    <form [formGroup]="fg">
      <div class="grid gap-6 mb-6 md:grid-cols-2">
        <app-input  formControlName="dataFolder" title="Data Folder" placeholder="Data folder path">
          <div (click)="selectFolder()" class="cursor-pointer transition-all delay-0 hover:scale-110 ml-2 flex justify-center items-center w-12 max-w-[50px] border-2 bg-gray-50  border-gray-300 text-gray-900 text-sm rounded-lg block w-full p-2.5 dark:bg-slate-500 dark:border-gray-600 dark:text-white">
            <p>...</p>
          </div>
        </app-input>
      </div>
    </form>
  `,
  styles: [
  ]
})
export class SettingsComponent implements OnInit{
  fb = inject(FormBuilder);
  fg = this.fb.group({
    dataFolder: ''
  })
  config: typeof this.fg.value = {};
  async selectFolder() {

    const [path] = await ipcRenderer.invoke('folder-dialog')
    if(path) {
      this.fg.patchValue({dataFolder: path});
    }
    this.onFormChange();
  }

  ngOnInit() {
    this.config = JSON.parse((localStorage.getItem('config')  ?? '{}'));
    this.fg.patchValue(this.config);
  }

  onFormChange() {
    this.config = this.fg.value;
    localStorage.setItem('config', JSON.stringify(this.config));
  }
}
