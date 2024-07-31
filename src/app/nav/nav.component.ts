import { Component, OnInit } from '@angular/core';
import { UserService } from '../services/user.service';
import { Log } from '../models/log';
import { LogService } from '../services/log.service';


@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.css']
})
export class NavComponent implements OnInit {
  isAuthenticated: boolean;
  role:boolean;
  log:Log;
  constructor(private userService:UserService,private logService:LogService) { }

  ngOnInit() {
    this.userService.authStatus$.subscribe(status => {
      this.isAuthenticated = status;
     
    });
    
    //this.userService.checkRole();

    this.userService.role$.subscribe(status=>{
      this.role = status;
    
    });
  }

  cikis(){
    const secim = window.confirm('Çıkış yapmak istediğinize emin misiniz?');
    if(secim){
      var id = this.userService.getCurrentUser();
      var islem = "Exit";
      var aciklama = "Exit işlemi Yapılmıştır";
      var durum = "Başarılı!";
      this.userService.getUserIp().subscribe((data: string)=>{
        var ip = data;
        this.log = new Log(Number(id),durum,islem,aciklama,ip);
        this.logService.PostLog(this.log).subscribe(s=>{});
        this.userService.router.navigateByUrl('/deneme');
        this.userService.clearToken();
        this.role = false;
        this.userService.router.navigateByUrl('/giris');
      });
    }
  }

}
