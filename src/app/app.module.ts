import { JwtHelperService, JWT_OPTIONS  } from '@auth0/angular-jwt';
import { NgModule } from '@angular/core';
import { HttpClientModule } from "@angular/common/http";
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserModule } from '@angular/platform-browser';
import { DenemeComponent } from './deneme/deneme.component';
import { EkleComponent } from './ekle/ekle.component';

import { ReactiveFormsModule,FormsModule } from '@angular/forms';
import { DuzenleComponent } from './duzenle/duzenle.component';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { NavComponent } from './nav/nav.component';
import { UserComponent } from './user/user.component';
import { MapComponent } from './map/map.component';
import { LogComponent } from './log/log.component';
import { MapEkleComponent } from './map-ekle/map-ekle.component';
import { UserDuzenleComponent } from './user-duzenle/user-duzenle.component';


@NgModule({
  declarations: [
    AppComponent,
    DenemeComponent,
    EkleComponent,
    DuzenleComponent,
    LoginComponent,
    RegisterComponent,
    NavComponent,
    UserComponent,
    MapComponent,
    LogComponent,
    MapEkleComponent,
    UserDuzenleComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule, 
  ],
  providers: [
    { provide: "url", useValue: "https://localhost:44330/"}, 
    { provide: JWT_OPTIONS, useValue: JWT_OPTIONS },
    JwtHelperService],
  bootstrap: [AppComponent]
})
export class AppModule { }
