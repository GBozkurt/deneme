import { Component, OnInit } from '@angular/core';

import { UserService } from '../services/user.service';
import { LogService } from '../services/log.service';
import { Log } from '../models/log';
import * as alertify from 'alertifyjs';
@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.css']
})
export class UserComponent implements OnInit {
  filtreleSecili:string = "filtrele";
  filtreleDeger:string;
  kullanicilar: any = [];
  page: number = 1; 
  pageSize: number = 11; 
  bos: number = 0;
  list:number[] = []; 
  log:Log;
  selectedIds: number[] = [];
  data: any[]; 
  id: number; 
  constructor(private userService:UserService,private logService:LogService) { }
 
  ngOnInit() {
    if((this.userService.loggedIn())){
      this.userService.router.navigateByUrl('/giris');
    }
    this.checkRole();
    this.get();
    this. id =this.userService.getCurrentUser();
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

  //KULLANICILARI GETİR
  get(){
    this.userService.getAllUsers().subscribe(s=>{
      this.kullanicilar = s;
      this.control();this.filtreleDeger=null;
      this.filtreleSecili="filtrele";},e=>{
        const id = this.userService.getCurrentUser();
        const islem = "Kullanıcıları Listeleme";
        const aciklama = "Kullanıcıları getitirken bir hata oluştu!: "+e;
        const durum = "Başarılı!";
        let ip;
      this.userService.getUserIp().subscribe(s=>{ip =s;});
      this.log = new Log(id,durum,islem,aciklama,ip)
      this.logService.PostLog(this.log);
      this.log =null;
      
    })
  }

  //KULLANICILARI LİSTELE
  get paginatedKullanicilar() {
    const start = (this.page - 1) * this.pageSize;
    return this.kullanicilar.slice(start, start + this.pageSize);
  }

  //BOŞ SATIRLARI KONTROL ET
  control(){
    const totalPages = Math.ceil(this.kullanicilar.length / this.pageSize);
    if(this.page==totalPages){
      this.bos = this.pageSize-this.kullanicilar.length;
    } 
  }
  get listMaker(){
    this.list = [];
    for(let i=0;i<this.bos;i++){
      this.list.push(i);
    }
    return this.list;
  }

  //ÖNCEKİ SAYFA
  previousPage() {
    if (this.page > 1) {
      this.page--;
      this.bos = 0;
      
    }
  }

  //SONRAKİ SAYFA
  nextPage() {
    const totalPages = Math.ceil(this.kullanicilar.length / this.pageSize);
    if (this.page < totalPages) {
      this.page++;
      this.bos = 0;
      if(this.page==totalPages){
        const kalan = this.kullanicilar.length % this.pageSize;
        if(kalan!=0){
          this.bos = this.pageSize - kalan;
        }
      }
    }
  }

  //CHECKBOXA GÖRE İD ALMA
  onCheckboxChange(event: any, id: number) {
    if (event.target.checked) {
      this.selectedIds.push(id);
    } else {
      const index = this.selectedIds.indexOf(id);
      if (index > -1) {
        this.selectedIds.splice(index, 1);
      }
    }
  }

  //KULLANICI EKLEME
  ekle(){
    this.userService.router.navigateByUrl("/kayit");
  }

  //SEÇİLEN KULLANICILARI DELETE'E GÖNDERME
  deleteSelected(){
    const secim = window.confirm('Seçili taşınmazları silmek istediğinize emin misiniz?');
    if (secim){
      this.selectedIds.forEach(element => {
        this.delete(element);
        
      });
      
      this.selectedIds = [];
    }   
  }

  //KULLANICI SİLME
  delete(id:number){
    this.userService.DeleteUser(id).subscribe(s=>{
      const id = this.userService.getCurrentUser();
      const islem = "Kullanıcı Silme";
      const aciklama = "Kullanıcı başarıyla silindi: "+JSON.stringify(s);
      const durum = "Başarılı!";
      
      this.userService.getUserIp().subscribe((data: string)=>{
      const ip = data;
        this.log = new Log(Number(id),durum,islem,aciklama,ip);
        console.log("aa");
        this.logService.PostLog(this.log).subscribe(s=>{});
        this.get();
        alertify.notify('Silme Başarılı!', 'success', 3, function(){  console.log('dismissed'); });
      });
      },e=>{
        const id = this.userService.getCurrentUser();
        const islem = "Kullanıcı Silme";
        const aciklama = "Kullanıcı silerken hata!: "+e;
        const durum = "Başarısız!";
        
        this.userService.getUserIp().subscribe((data: string)=>{
          const ip =data;
          this.log = new Log(Number(id),durum,islem,aciklama,ip)
          this.logService.PostLog(this.log).subscribe(s=>{});
          alertify.notify('Silme Başarısız!', 'error', 3, function(){  console.log('dismissed'); });
        });
      })
  }
 
  //KULLANICI RAPORLA
  exportToCSV(): void {
    if(this.selectedIds.length ==1){
      this.userService.getUserById(this.selectedIds[0]).subscribe(s=>
      {
       this.data = [s];
        const header = Object.keys(this.data[0]).join(','); 
        const rows = this.data.map(item => Object.values(item).join(',')); 
      let csvContent = header + '\n' + rows.join('\n');
      const BOM = '\uFEFF';
      csvContent = BOM + csvContent;
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      if (link.download !== undefined) { 
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', 'rapor.csv');
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
      alertify.notify('Raporlama Başarılı!', 'success', 3, function(){  console.log('dismissed'); });
      }
      );
    }
    else{
      
      alertify.notify('Bir Seçim Yapınız!', 'error', 3, function(){  console.log('dismissed'); });
    }
    
  }

  //KULLANICILARI FİLTRELEME
  filtrele(){
    if(this.filtreleSecili == "id"){
      this.userService.getUserById(Number(this.filtreleDeger)).subscribe(s=>{
       
        this.kullanicilar = [s];        
        this.control();
      });
    }
    else if(this.filtreleSecili == "filtrele"){
      return null;
    }
    else{
       this.userService.getUsersByString(this.filtreleSecili,this.filtreleDeger).subscribe(s=>{
         this.kullanicilar=s;this.control();
       })
     }
  }

  //KULLANICI DÜZENLE
  duzenle(){
    const id = localStorage.getItem('userId');
    if (id) {
      localStorage.removeItem('userId');
    }
    if(this.selectedIds.length ==1){
      localStorage.setItem('userId', this.selectedIds[0].toString());
      this.userService.router.navigate(['/userDuzenle']);
    }
    else{
      alert("Lütfen sadece bir seçim yapınız!");
    } 
  }
}
