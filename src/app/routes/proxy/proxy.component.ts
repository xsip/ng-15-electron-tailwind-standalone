import {Component, inject} from '@angular/core';
import { CommonModule } from '@angular/common';
import {FormBuilder, ReactiveFormsModule, Validators} from '@angular/forms';
import {InputComponent} from '../../ui/input/input.component';
import {ExpressService, ProxyConfig} from '../../services/express.service';

@Component({
  selector: 'app-proxy',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, InputComponent],
  styles: [
  ],
  template: `
    <div class="w-full h-full">
      <div class="grid gap-6 mb-6 justify-end md:grid-cols-2">
        <div></div>
        <div class="flex justify-end">
          <div class="flex">
            <div class="flex justify-end">

              <div (click)="addProxyToList()"
                   class="cursor-pointer  transition-all delay-0 hover:scale-110 flex justify-center items-center border-2 bg-gray-50  w-12 max-w-[50px] border-gray-300 text-gray-900 text-sm rounded-lg w-full p-2.5 dark:bg-slate-500 dark:border-gray-600 dark:text-white">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
                     stroke="currentColor" class="w-6 h-6">
                  <path stroke-linecap="round" stroke-linejoin="round"
                        d="M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              </div>

            </div>
            <div
              (click)="toggleProxy()"
              class="cursor-pointer  transition-all delay-0 hover:scale-110 flex justify-center items-center border-2 bg-gray-50  w-12 max-w-[50px] border-gray-300 text-gray-900 text-sm rounded-lg w-full p-2.5 dark:bg-slate-500 dark:border-gray-600 dark:text-white">
              <svg *ngIf="!expressService.running" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                   stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
                <path stroke-linecap="round" stroke-linejoin="round"
                      d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z"/>
              </svg>
              <svg *ngIf="expressService.running" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                   stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
                <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 5.25v13.5m-7.5-13.5v13.5"/>
              </svg>

            </div>
          </div>
        </div>
      </div>
      <div>
        <ng-container [formGroup]="fg">
          <ng-container formArrayName="proxies">
            <ng-container *ngFor="let proxy of fg.controls.proxies.controls; let i = index">
              <div class="grid gap-6 mb-6 md:grid-cols-2" [formGroup]="proxy">
                <app-input (input)="inputChange($event, i)" formControlName="from" title="from"
                           placeholder="https://www.example.com"/>
                <app-input [disabled]="true" formControlName="to" title="to" placeholder="localhost:1111">
                  <div
                    class="cursor-pointer transition-all delay-0 hover:scale-110 ml-2 flex justify-center items-center w-12 max-w-[50px] border-2 bg-gray-50  border-gray-300 text-gray-900 text-sm rounded-lg block w-full p-2.5 dark:bg-slate-500 dark:border-gray-600 dark:text-white">
                    <svg (click)="removeProxy(i)" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                         stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
                      <path stroke-linecap="round" stroke-linejoin="round"
                            d="M15 12H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>

                  </div>
                  <div
                    (click)="addProxy(i)"
                    class="cursor-pointer transition-all pl-5 pr-5 delay-0 hover:scale-110 ml-2 flex justify-center items-center w-12 max-w-[70px] border-2 bg-gray-50  border-gray-300 text-gray-900 text-sm rounded-lg block w-full p-2.5 dark:bg-slate-500 dark:border-gray-600 dark:text-white">
                    <p>Enable</p>
                  </div>
                </app-input>

              </div>
            </ng-container>
          </ng-container>
        </ng-container>
      </div>
    </div>
  `
})
export class ProxyComponent {
  expressService = inject(ExpressService);
  fb = inject(FormBuilder);
  fg = this.fb.group({
    proxies: this.fb.array([
      this.fb.group({
        from: ['', Validators.required],
        to: ['', Validators.required],
      })
    ])
  });
  running = false;
  toggleProxy() {
    if(this.expressService.running) {
      this.expressService.stop();
      return;
    }
    this.expressService.start();
  }
  addProxyToList() {
    const proxyForm = this.fb.group({
      from: ['', Validators.required],
      to: ['', Validators.required],
    });
    this.fg.controls.proxies.push(proxyForm);
  }
  removeProxy(index: number) {
    this.expressService.removeProxy(this.fg.controls.proxies.at(index).value as ProxyConfig);
    this.fg.controls.proxies.removeAt(index);
  }
  addProxy(index: number) {
    this.expressService.addProxy(this.fg.controls.proxies.at(index).value as ProxyConfig);
  }
  inputChange({target}: Event, index: number) {
    const value = (target as HTMLInputElement).value;
    const outputValue: string | undefined = value.match(/www\.(.*?)\.(.*?)/)?.[1];
    if(!this.fg.controls.proxies.at(index).controls.to.touched && outputValue) {
      this.fg.controls.proxies.at(index).controls.to.patchValue(outputValue);
    }
  }
}
