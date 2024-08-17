import { Component, OnInit } from '@angular/core';
import { UserService } from '../services/user.service';
import { AbstractControl, FormBuilder, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { registerUser } from '../models/registerUser';
import { Log } from '../models/log';
import { LogService } from '../services/log.service';
import * as alertify from 'alertifyjs';
@Component({
  selector: 'app-user-duzenle',
  templateUrl: './user-duzenle.component.html',
  styleUrls: ['./user-duzenle.component.css']
})
export class UserDuzenleComponent implements OnInit {
  myForm: FormGroup;
  rol:string;
  deger:registerUser;
  id:number;
  log:Log
  constructor(private userService:UserService,private formBuilder:FormBuilder,private logService:LogService) { }

  ngOnInit() {
    if(this.userService.loggedIn()){
      this.userService.router.navigateByUrl('/giris');
    }
    this.checkRole();
    this.myForm = this.formBuilder.group({
      name: ['', [Validators.required]],
      username: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required,this.passwordValidator()]],
      rol: ['', [Validators.required]],
    });
    this.id = Number(localStorage.getItem('userId'));
    if (this.id) {
      this.getUserById(this.id);
      localStorage.removeItem('userId');
    }
  }

  //KULLANICIYI ALIP FORMA GİRME
  getUserById(id:number){
    this.userService.getUserById(id).subscribe((item)=>{
      this.myForm.patchValue({
        name:item.name,
        username:item.email,
        role:item.role,
      });
      console.log(item);
      this.rol = item.role;
    });
  }

  //PAROLA KONTROLÜ
  passwordValidator(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      const value = control.value;
      if (!value) {
        return null;
      }

      const hasUpperCase = /[A-Z]/.test(value);
      const hasLowerCase = /[a-z]/.test(value);
      const hasNumeric = /[0-9]/.test(value);
      const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(value);

      const isValid = hasUpperCase && hasLowerCase && hasNumeric && hasSpecialChar;
      return isValid ? null : { passwordStrength: true };
    };
  }
  
  //ROL KONTROLÜ
  checkRole(){
    const id  = this.userService.getCurrentUser();
    const a = "admin";
    this.userService.getUserRole(id).subscribe((response: string)=>{
     
      if(response != a){
        this.userService.router.navigateByUrl('/deneme');
      }
    },e=>{console.log("Hata",e)});
  }

  //VERİYİ BACKENDE GÖNDER
  onSubmit(){
    if(this.myForm.valid){
      const secim = window.confirm('Seçili taşınmazı güncellemek istediğinize emin misiniz?');
      if (secim){
        const formData = this.myForm.value;
        this.deger = new registerUser(formData.name,formData.username,formData.password,formData.rol);
        this.userService.PutUpdateUser(this.deger,this.id).subscribe(s=>{
          const id = this.userService.getCurrentUser(); 
          const islem = "K-Güncelle";
          const aciklama = "Update işlemi yapılmıştır. Eski Kullanıcı: "+ JSON.stringify(this.deger);
          const durum = "Başarılı!";
          
          this.userService.getUserIp().subscribe((data: string)=>{
            const ip = data;
            this.log = new Log(Number(id),durum,islem,aciklama,ip);
            this.logService.PostLog(this.log).subscribe(s=>{});
            this.userService.router.navigate(['/admin']);
            alertify.notify('Düzenleme Başarılı!', 'success', 3, function(){  console.log('dismissed'); });
        });
        });
      }
    }
    else{
      alertify.notify('Düzenleme Başarısız!', 'error', 3, function(){  console.log('dismissed'); });
    }
  }
}
