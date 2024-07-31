import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UserService } from '../services/user.service';
import { LogService } from '../services/log.service';
import { Log } from '../models/log';

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
  constructor(private formBuilder: FormBuilder,private userService:UserService,private logService:LogService) { }
 
  ngOnInit() {
    if((this.userService.loggedIn())){
      this.userService.router.navigateByUrl('/giris');
    }
    this.checkRole();
    this.get();
  }

  checkRole(){
    var id  = this.userService.getCurrentUser();
    var a = "admin";
    this.userService.getUserRole(id).subscribe((response: string)=>{
     
      if(response != a){
        this.userService.router.navigateByUrl('/deneme');
      }
    },e=>{console.log("Hata",e)});
  }

  get(){
    this.userService.getAllUsers().subscribe(s=>{this.kullanicilar = s;this.control();this.filtreleDeger=null;
      this.filtreleSecili="filtrele";},e=>{
      var id = this.userService.getCurrentUser();
      var islem = "Kullanıcıları Listeleme";
      var aciklama = "Kullanıcıları getitirken bir hata oluştu!: "+e;
      var durum = "Başarılı!";
      var ip;
      this.userService.getUserIp().subscribe(s=>{ip =s;});
      this.log = new Log(id,durum,islem,aciklama,ip)
      this.logService.PostLog(this.log);
      this.log =null;
      
    })
  }

  get paginatedKullanicilar() {
    const start = (this.page - 1) * this.pageSize;
    return this.kullanicilar.slice(start, start + this.pageSize);
  }

  control(){
    const totalPages = Math.ceil(this.kullanicilar.length / this.pageSize);
    if(this.page==totalPages){
      this.bos = this.pageSize-this.kullanicilar.length;
    } 
  }

  previousPage() {
    if (this.page > 1) {
      this.page--;
      this.bos = 0;
      
    }
  }

  get listMaker(){
    this.list = [];
    for(let i=0;i<this.bos;i++){
      this.list.push(i);
    }
    return this.list;
  }

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

  ekle(){
    this.userService.router.navigateByUrl("/kayit");
  }

  deleteSelected(){
    const secim = window.confirm('Seçili taşınmazları silmek istediğinize emin misiniz?');
    if (secim){
      this.selectedIds.forEach(element => {
        this.delete(element);
        
      });
      location.reload();
      this.selectedIds = [];
    }   
  }

  delete(id:number){
    this.userService.DeleteUSer(id).subscribe(s=>{
      var id = this.userService.getCurrentUser();
      var islem = "Kullanıcı Silme";
      var aciklama = "Kullanıcı başarıyla silindi: "+JSON.stringify(s);
      var durum = "Başarılı!";
      var ip;
      this.userService.getUserIp().subscribe((data: string)=>{
        ip = data;
        this.log = new Log(Number(id),durum,islem,aciklama,ip);
        console.log("aa");
        this.logService.PostLog(this.log).subscribe(s=>{});
        location.reload();
      });
      },e=>{
        var id = this.userService.getCurrentUser();
        var islem = "Kullanıcı Silme";
        var aciklama = "Kullanıcı silerken hata!: "+e;
        var durum = "Başarısız!";
        var ip;
        this.userService.getUserIp().subscribe((data: string)=>{
          ip =data;
          this.log = new Log(Number(id),durum,islem,aciklama,ip)
          this.logService.PostLog(this.log).subscribe(s=>{});
        });
      })
  }
 
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
      }
      );
    }
    else{
      alert("Lütfen sadece bir seçim yapınız!");
    }
    
  }

  filtrele(){
    
    
    if(this.filtreleSecili == "id"){
      this.userService.getUserById(Number(this.filtreleDeger)).subscribe(s=>{
       
        this.kullanicilar = [s];        
        this.control();
      });
    }
    else if(this.filtreleSecili == "filtrele"){
    }
    else{
       this.userService.getUsersByString(this.filtreleSecili,this.filtreleDeger).subscribe(s=>{
         this.kullanicilar=s;this.control();
       })
     }
    
  }
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
