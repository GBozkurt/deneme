import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { registerUser } from '../models/registerUser';
import { UserService } from '../services/user.service';
import { LogService } from '../services/log.service';
import { Log } from '../models/log';


@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {
  myForm: FormGroup;
  userRegister:registerUser;
  log:Log;
  rol:string = "user";
  constructor(private formBuilder: FormBuilder,private userService:UserService,private logService:LogService) { }

  ngOnInit() {
    if((this.userService.loggedIn())){
      this.userService.router.navigateByUrl('/deneme');
    }
    this.checkRole();
    this.myForm = this.formBuilder.group({
      name: ['', [Validators.required]],
      username: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required,this.passwordValidator()]],
      rol:['',[Validators.required]]
    });
  }

  checkRole(){
    var id  = this.userService.getCurrentUser();
    var a = "admin";
    this.userService.getUserRole(id).subscribe((response: string)=>{
      console.log(response,a);
      if(response != a){
        this.userService.router.navigateByUrl('/deneme');
      }
    },e=>{console.log("Hata",e)});
  }

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

  onSubmit() {
    if(this.myForm.valid){
     
      this.userRegister =  new registerUser(this.myForm.value.name,this.myForm.value.username,this.myForm.value.password,this.myForm.value.rol);
      this.postFormData(this.userRegister);
    }
    else{
      alert('Bilgileri doğru girin!');
    }
    }

  postFormData(registerUser: registerUser) {
    this.userService.PostRegister(registerUser).subscribe(s=>{
        
      var id = this.userService.getCurrentUser();
      var islem = "Register";
      var aciklama = "Register işlemi yapılmıştır"+ JSON.stringify(s);
      var durum = "Başarılı!";
      var ip;
      this.userService.getUserIp().subscribe((data: string)=>{
        ip= data;
        this.log = new Log(Number(id),durum,islem,aciklama,ip);
        this.logService.PostLog(this.log).subscribe(s=>{});
        this.userService.router.navigateByUrl('/admin');
      });
      
    },e=>{
      var id = this.userService.getCurrentUser();
      var islem = "Register";
      var aciklama = "Register işlemi yapılamamıştır: "+e;
      var durum = "Başarısız!";
      var ip;
      this.userService.getUserIp().subscribe((data: string)=>{
        ip= data;
        this.log = new Log(Number(id),durum,islem,aciklama,ip);
        this.logService.PostLog(this.log).subscribe(s=>{});
        this.userService.router.navigateByUrl('/admin');
      });
      })
  }
}
