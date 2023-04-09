import {Component, OnInit} from '@angular/core';
import {RouterLink, RouterLinkActive, RouterOutlet} from '@angular/router';
import {FormsModule} from '@angular/forms';
import {NgForOf, NgIf} from '@angular/common';
import {hidden} from 'ansi-colors';
const  {ipcRenderer}: typeof import('electron') = window.require('electron');
interface AppRoute {
  routerLink: string;
  title: string;
}
@Component({
  standalone: true,
  selector: 'app-root',
  imports: [
    RouterOutlet,
    FormsModule,
    NgIf,
    RouterLink,
    RouterLinkActive,
    NgForOf
  ],
  template: `
      <div class="w-full   flex md:flex-row flex-col mx-0 md:mx-auto  bg-transparent text-[rgb(128,131,141)] md:max-w-7xl mt-auto h-screen">
          <div [class.hidden]="menuHidden"
               class="left-bar transition-all delay-0 ease-in-out flex  rounded-tl-md rounded-bl-md flex-col dark:bg-slate-600 justify-start w-[30%] xl:w-[25%] drop-shadow-xl bg-[rgb(240,240,240)]">
              <nav class=" border-r-2  dark:border-slate-700 dragable sticky flex flex-row items-center justify-between px-5 top-0 left-0 w-full h-[50px]  pt-2 pb-2 bg-white dark:dark:bg-slate-800 drop-shadow-md">
                  <button class="non-dragable dark:text-[rgb(128,131,141)] text-[rgb(128,131,141)]" (click)="close()">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
                           stroke="currentColor" class="w-6 h-6">
                          <path stroke-linecap="round" stroke-linejoin="round"
                                d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                      </svg>
                  </button>

                  <button (click)="toggleMenu()"
                          class="non-dragable dark:text-[rgb(128,131,141)] text-[rgb(128,131,141)]">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
                           stroke="currentColor" class="w-6 h-6">
                          <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"/>
                      </svg>

                  </button>
              </nav>
              <ul class="">
                  <a *ngFor="let link of links" [routerLink]="link.routerLink"
                     routerLinkActive="dark:!bg-slate-400 !bg-[rgb(220,220,220)]"
                     class="pl-2 h-12 text-xl items-center flex  bg-[rgb(230,230,230)] hover:bg-[rgb(220,220,220)] hover:dark:bg-slate-400 cursor-pointer hover:dark:text-white dark:text-white    non-dragable  dark:bg-slate-500 mt-1 text-[rgb(128,131,141)] drop-shadow-md">{{link.title}}</a>
              </ul>
          </div>
          <div [class.!xl:w-[100%]]="menuHidden" [class.!w-[100%]]="menuHidden"  class="overflow-y-scroll dark:bg-slate-700 dark:text-white  pb-12 flex  w-full flex-col xl:w-[75%] w-[70%] relative rounded-tr-md rounded-br-md drop-shadow-md bg-white">
              <nav class="sticky dragable flex flex-row items-center justify-between px-5 top-0 left-0 w-full h-[50px]  pt-2 pb-2 bg-white dark:dark:bg-slate-800 drop-shadow-md">
                  <div class="flex content-center">
                      <button *ngIf="menuHidden"
                              class="non-dragable dark:text-[rgb(128,131,141)] text-[rgb(128,131,141)]"
                              (click)="close()">
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
                               stroke="currentColor" class="w-6 h-6">
                              <path stroke-linecap="round" stroke-linejoin="round"
                                    d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                          </svg>

                      </button>
                      <button *ngIf="menuHidden"
                              class="ml-5 non-dragable dark:text-[rgb(128,131,141)] text-[rgb(128,131,141)]"
                              (click)="toggleMenu()">
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
                               stroke="currentColor" class="w-6 h-6">
                              <path stroke-linecap="round" stroke-linejoin="round"
                                    d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"/>
                          </svg>

                      </button>
                  </div>
                  <ul class="h-full flex gap-6  items-center">
                      <a class="hover:scale-125 non-dragable transition-all text-sm cursor-pointer">Sample app</a>
                  </ul>

                  <div class="flex items-center non-dragable">
                      <div class="w-14 h-8">
                          <input type="checkbox" id="dark-mode-toggle" [(ngModel)]="darkMode" class="hidden"
                                 (change)="darkModeChange()"/>
                          <label for="dark-mode-toggle"
                                 class="transition-all delay-0 w-full h-full bg-[rgb(220,220,220)] dark:bg-slate-600 rounded-full p-1 flex justify-between items-center  cursor-pointer">
                        <span class="inline ml-1 dark:hidden"><svg xmlns="http://www.w3.org/2000/svg" fill="none"
                                                                   viewBox="0 0 24 24" stroke-width="1.5"
                                                                   stroke="currentColor" class="w-6 h-6">
  <path stroke-linecap="round" stroke-linejoin="round"
        d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z"/>
</svg>
</span>
                              <span class="w-6 h-6 rounded-full bg-white dark:bg-gray-800 block float-right dark:float-left"></span>
                              <span class="hidden ml-1 dark:inline"><svg xmlns="http://www.w3.org/2000/svg" fill="none"
                                                                         viewBox="0 0 24 24" stroke-width="1.5"
                                                                         stroke="currentColor" class="w-6 h-6">
  <path stroke-linecap="round" stroke-linejoin="round"
        d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z"/>
</svg>
</span>
                          </label>
                      </div>
                  </div>
              </nav>
              <div class="px-5 py-5">
                  <router-outlet></router-outlet>
              </div>
          </div>
      </div>
  `,

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
  links: AppRoute[] = [
    {routerLink: 'home', title: 'Home'},
    {routerLink: 'settings', title: 'Settings'},
    {routerLink: 'unpack', title: 'Unpack'},
  ]
  darkMode = false;
  darkModeChange() {
    localStorage.setItem('dark', JSON.stringify(this.darkMode));
    if(this.darkMode) {
      document.body.classList.add('dark');

      return;
    }
    document.body.classList.remove('dark');
  }
  toggleMenu() {
    this.menuHidden = !this.menuHidden;
    localStorage.setItem('showMenu', JSON.stringify(!this.menuHidden));

  }
  ngOnInit() {
    this.darkMode = JSON.parse(localStorage.getItem('dark') ?? 'false');
    this.menuHidden = !JSON.parse(localStorage.getItem('showMenu') ?? 'true');
    this.darkModeChange();
  }
  menuHidden = false;
  close() {
    ipcRenderer.send('close');
  }

  protected readonly hidden = hidden;
}
