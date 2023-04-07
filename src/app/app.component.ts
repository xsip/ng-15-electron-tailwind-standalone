import {Component, OnInit} from '@angular/core';
import {RouterOutlet} from '@angular/router';
import {FormsModule} from '@angular/forms';
// @ts-ignore
const  {ipcRenderer} = window.require('electron');

@Component({
  standalone: true,
  selector: 'app-root',
  template: `
      <div class="w-full   flex md:flex-row flex-col mx-0 md:mx-auto  bg-transparent text-[rgb(128,131,141)] md:max-w-7xl mt-auto h-screen">
          <div class="flex dragable rounded-tl-md rounded-bl-md flex-col dark:bg-slate-600 justify-between w-[100%] md:w-[30%] drop-shadow-xl bg-[rgb(240,240,240)]">
              <nav class="sticky flex flex-row items-center justify-between px-5 top-0 left-0 w-full h-[50px]  pt-2 pb-2 bg-white dark:dark:bg-slate-800 drop-shadow-md">
                <button class="non-dragable text-white hover:text-slate-600" (click)="close()"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                </button>
              </nav>
          </div>
          <div class="overflow-y-scroll dark:bg-slate-700 dark:text-white  pb-12 flex  w-full flex-col md:w-[70%] relative rounded-tr-md rounded-br-md drop-shadow-md bg-white">
              <nav class="sticky dragable flex flex-row items-center justify-between px-5 top-0 left-0 w-full h-[50px]  pt-2 pb-2 bg-white dark:dark:bg-slate-800 drop-shadow-md">
                  <ul class="h-full flex gap-6  items-center">
                      <a class="hover:scale-125 non-dragable transition-all text-sm cursor-pointer">Home</a>
                  </ul>
                  <div class="flex items-center non-dragable">
                      <input
                              (change)="darkModeChange()"
                              [(ngModel)]="darkMode"
                              class="mr-2 mt-[0.3rem] h-3.5 w-8 appearance-none rounded-[0.4375rem] bg-neutral-300 before:pointer-events-none before:absolute before:h-3.5 before:w-3.5 before:rounded-full before:bg-transparent before:content-[''] after:absolute after:z-[2] after:-mt-[0.1875rem] after:h-5 after:w-5 after:rounded-full after:border-none after:bg-neutral-100 after:shadow-[0_0px_3px_0_rgb(0_0_0_/_7%),_0_2px_2px_0_rgb(0_0_0_/_4%)] after:transition-[background-color_0.2s,transform_0.2s] after:content-[''] checked:bg-primary checked:after:absolute checked:after:z-[2] checked:after:-mt-[3px] checked:after:ml-[1.0625rem] checked:after:h-5 checked:after:w-5 checked:after:rounded-full checked:after:border-none checked:after:bg-primary checked:after:shadow-[0_3px_1px_-2px_rgba(0,0,0,0.2),_0_2px_2px_0_rgba(0,0,0,0.14),_0_1px_5px_0_rgba(0,0,0,0.12)] checked:after:transition-[background-color_0.2s,transform_0.2s] checked:after:content-[''] hover:cursor-pointer focus:before:scale-100 focus:before:opacity-[0.12] focus:before:shadow-[3px_-1px_0px_13px_rgba(0,0,0,0.6)] focus:before:transition-[box-shadow_0.2s,transform_0.2s] focus:after:absolute focus:after:z-[1] focus:after:block focus:after:h-5 focus:after:w-5 focus:after:rounded-full focus:after:content-[''] checked:focus:border-primary checked:focus:bg-primary checked:focus:before:ml-[1.0625rem] checked:focus:before:scale-100 checked:focus:before:shadow-[3px_-1px_0px_13px_#3b71ca] checked:focus:before:transition-[box-shadow_0.2s,transform_0.2s] dark:bg-neutral-600 dark:after:bg-neutral-400 dark:checked:bg-primary dark:checked:after:bg-primary"
                              type="checkbox"
                              role="switch"
                              id="flexSwitchCheckDefault"/>
                      <label
                              class="inline-block text-sm pl-[0.15rem] hover:cursor-pointer"
                              for="flexSwitchCheckDefault"
                      >darkmode</label
                      >
                  </div>
              </nav>
              <div class="px-5 py-5">
                  <router-outlet></router-outlet>
              </div>
          </div>
      </div>
  `,
  imports: [
    RouterOutlet,
    FormsModule
  ],
  styles: [
    `.dragable {
      -webkit-user-select: none;
      -webkit-app-region: drag;
    }

    .non-dragable {
      -webkit-app-region: no-drag;
    }`
  ]
})
export class AppComponent implements OnInit{
  darkMode = false;
  darkModeChange() {
    localStorage.setItem('dark', JSON.stringify(this.darkMode));
    if(this.darkMode) {
      document.body.classList.add('dark');

      return;
    }
    document.body.classList.remove('dark');
  }
  ngOnInit() {
    this.darkMode = JSON.parse(localStorage.getItem('dark') ?? 'false');
    this.darkModeChange();
  }

  close() {
    ipcRenderer.send('close');
  }
}
