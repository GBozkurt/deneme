import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { UserService } from '../services/user.service';
import { loginUser } from '../models/loginUser';
import { LogService } from '../services/log.service';
import { Log } from '../models/log';
import * as alertify from 'alertifyjs';
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  myForm: FormGroup;
  loginUser: loginUser;
  kullanicilar: any = [];
  log: Log;
  ip: string = '';
  constructor(private formBuilder: FormBuilder, private userService: UserService, private logService: LogService) { }

  ngOnInit() {
    if (!(this.userService.loggedIn())) {
      this.userService.router.navigateByUrl('/deneme');
    }
    this.myForm = this.formBuilder.group({
      email: ['', Validators.required],
      password: ['', Validators.required],
    });
  }

  //VERİYİ DÖNÜŞTÜRME
  onSubmit() {
    if (this.myForm.valid) {
      this.loginUser = new loginUser(this.myForm.value.email, this.myForm.value.password);
      this.postFormData(this.loginUser);
    }
  }

  //VERİYİ BACKENDE GÖNDERME
  postFormData(data: loginUser) {
    this.userService.PostLogin(data).subscribe(s => {
      this.userService.setToken(s['token'].toString());
      const id = this.userService.getCurrentUser();
      const islem = "Giriş";
      const aciklama = "Giriş işlemi Yapılmıştır";
      const durum = "Başarılı!";
      this.userService.getUserIp().subscribe((data: string) => {
        const ip = data;
        this.log = new Log(Number(id), durum, islem, aciklama, ip);
        this.logService.PostLog(this.log).subscribe(s => { });
        this.userService.checkRole();
        this.userService.router.navigateByUrl('/deneme');
        alertify.notify('Giriş Başarılı!', 'success', 3, function(){  console.log('dismissed'); });
      });
    }, e => {
      
      alertify.notify('Email veya şifre yanlış!', 'error', 3, function(){  console.log('dismissed'); });
    });
  }
}
