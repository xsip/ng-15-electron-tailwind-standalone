import {Component, inject, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {InputComponent} from '../../ui/input/input.component';
import {FormBuilder, ReactiveFormsModule} from '@angular/forms';
import {unpack} from '../../logic/webpack-unpack';
import {Observable, ReplaySubject} from 'rxjs';
// @ts-ignore
const  fs: typeof import("fs") = window.require('fs');
// @ts-ignore
const  {ipcRenderer} = window.require('electron');
@Component({
  selector: 'app-unpack',
  standalone: true,
  imports: [CommonModule, InputComponent, ReactiveFormsModule],
  template: `
      <form [formGroup]="fg">
          <div class="grid gap-6 mb-6 md:grid-cols-2">
              <app-input formControlName="inputFolder" title="Input Folder" placeholder="Input folder path">
                  <div (click)="selectFolder('inputFolder')"
                       class="cursor-pointer transition-all delay-0 hover:scale-110 ml-2 flex justify-center items-center w-12 max-w-[50px] border-2 bg-gray-50  border-gray-300 text-gray-900 text-sm rounded-lg block w-full p-2.5 dark:bg-slate-500 dark:border-gray-600 dark:text-white">
                      <p>...</p>
                  </div>
              </app-input>
            <div><label for="large" class="block mb-1 text-base  text-gray-900 dark:text-white">Select a File</label>
              <select id="large" formControlName="selectedFile" (change)="fileChange($event)"
                      class="border-2 bg-gray-50  border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-slate-500 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500">
                <option selected>Select a file</option>
                <option *ngFor="let file of jsFiles" [value]="file">{{file}}</option>
              </select>
            </div>
          </div>
          <div class="grid gap-6 mb-6 md:grid-cols-1">
            <app-input formControlName="outputFolder" title="Output Folder" placeholder="Output folder path">
              <div (click)="selectFolder('outputFolder')"
                   class="cursor-pointer transition-all delay-0 hover:scale-110 ml-2 flex justify-center items-center w-12 max-w-[50px] border-2 bg-gray-50  border-gray-300 text-gray-900 text-sm rounded-lg block w-full p-2.5 dark:bg-slate-500 dark:border-gray-600 dark:text-white">
                <p>...</p>
              </div>
            </app-input>
          </div>
        <div class="items-center grid gap-6 mb-6 md:grid-cols-2">
          <div>{{status |async}}</div>
        <div (click)="unpack()"
          class="cursor-pointer  transition-all delay-0 hover:scale-110 ml-2 flex justify-center items-center  border-2 bg-gray-50  border-gray-300 text-gray-900 text-sm rounded-lg block w-full p-2.5 dark:bg-slate-500 dark:border-gray-600 dark:text-white">
          <p>Unpack</p>
        </div>
        </div>
      </form>
  `,
  styles: [
  ]
})
export class UnpackComponent implements OnInit{
  fb = inject(FormBuilder);
  fg = this.fb.group({
    inputFolder: '',
    outputFolder: '',
    selectedFile: ''
  })
  config: typeof this.fg.value = {};
  async selectFolder(folder: 'inputFolder' | 'outputFolder') {

    const [path] = await ipcRenderer.invoke('folder-dialog')
    if(path) {
      this.fg.patchValue({[folder]: path});
    }
    this.onFormChange();
    this.loadFiles();
  }
  ngOnInit() {
    this.config = JSON.parse((localStorage.getItem('unpack-config')  ?? '{}'));
    this.fg.patchValue(this.config);
    this.loadFiles();
    this.status.next( 'Waiting for input');
  }

  onFormChange() {
    this.config = this.fg.value;
    localStorage.setItem('unpack-config', JSON.stringify(this.config));
  }

  jsFiles: string[] = [];
  loadFiles() {

    if(!this.fg.value.inputFolder)
      return;
    this.jsFiles = fs.readdirSync(this.fg.value.inputFolder)?.filter(file => {
      return file.includes('.js');
    }) ?? [];
  }
  fileChange(event: any) {
    this.onFormChange();
  }
  status = new ReplaySubject<string>();
  unpack() {
    const {inputFolder, selectedFile,outputFolder} = this.fg.value;
    if(!inputFolder || !outputFolder || !selectedFile)
      return;
    console.log('UNPACKING');
    unpack(inputFolder,selectedFile,outputFolder, this.status);
  }
}
