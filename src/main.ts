import {bootstrapApplication} from '@angular/platform-browser';
import {AppComponent} from './app/app.component';
import {provideRouter, Route, withDebugTracing} from '@angular/router';
import {HomeComponent} from './app/routes/home/home.component';
import {SettingsComponent} from './app/routes/settings/settings.component';

const routes: Route[] = [
  {path: '',pathMatch: 'full', redirectTo: 'home'},
  {path: 'home', component: HomeComponent},
  {path: 'settngs', component: SettingsComponent}
]
bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes, withDebugTracing()),
  ]
}).catch(err => console.error(err));
