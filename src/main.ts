import {bootstrapApplication} from '@angular/platform-browser';
import {AppComponent} from './app/app.component';
import {provideRouter, Route, withDebugTracing} from '@angular/router';
import {HomeComponent} from './app/home/home.component';

const routes: Route[] = [
  {path: '', component: HomeComponent}
]
bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes, withDebugTracing()),
  ]
}).catch(err => console.error(err));
