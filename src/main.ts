import {bootstrapApplication} from '@angular/platform-browser';
import {AppComponent} from './app/app.component';
import {provideRouter, Route, withDebugTracing} from '@angular/router';
import {HomeComponent} from './app/routes/home/home.component';
import {SettingsComponent} from './app/routes/settings/settings.component';
import {UnpackComponent} from './app/routes/unpack/unpack.component';

const routes: Route[] = [
  {path: '',pathMatch: 'full', redirectTo: 'home'},
  {path: 'home', component: HomeComponent},
  {path: 'settings', component: SettingsComponent},
  {path: 'unpack', component: UnpackComponent}
]
bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes),
  ]
}).catch(err => console.error(err));

