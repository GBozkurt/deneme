import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { DenemeComponent } from './deneme/deneme.component';
import { EkleComponent } from './ekle/ekle.component';
import { DuzenleComponent } from './duzenle/duzenle.component';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { UserComponent } from './user/user.component';
import { MapComponent } from './map/map.component';
import { LogComponent } from './log/log.component';
import { MapEkleComponent } from './map-ekle/map-ekle.component';
import { UserDuzenleComponent } from './user-duzenle/user-duzenle.component';

const routes: Routes = [
  { path: '', redirectTo: '/giris', pathMatch: 'full' },
  { path: 'deneme', component: DenemeComponent },
  { path: 'ekle', component: EkleComponent },
  { path: 'duzenle', component: DuzenleComponent },
  { path: 'giris', component: LoginComponent },
  { path: 'kayit', component: RegisterComponent },
  { path: 'admin', component: UserComponent },
  { path: 'map', component: MapComponent },
  { path: 'log', component: LogComponent },
  { path: 'mapEkle', component: MapEkleComponent },
  { path: 'userDuzenle', component: UserDuzenleComponent },

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
