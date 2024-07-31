import { Component, OnInit,} from '@angular/core';
import { DenemeService } from '../services/deneme.service';
import { UserService } from '../services/user.service';
import { Log } from '../models/log';
import { LogService } from '../services/log.service';
import { Tasinmaz } from '../models/tasinmaz';


@Component({
  selector: 'app-deneme',
  templateUrl: './deneme.component.html',
  styleUrls: ['./deneme.component.css']
})
export class DenemeComponent implements OnInit {

  constructor(private denemeService:DenemeService,private userService:UserService,private logService:LogService) { }
  filtreleSecili:string = "filtrele";
  filtreleDeger:string;
  tasinmazlar: any = [];
  page: number = 1; 
  pageSize: number = 11; 
  bos: number = 0;
  list:number[] = []; 
  log:Log;
  deger:Tasinmaz;
  selectedIds: number[] = [];
  data: any[];
  ngOnInit() {
    if((this.userService.loggedIn())){
      this.userService.router.navigateByUrl('/giris');
    }
    this.userService.checkRole();
    this.get();
    this.denemeService.id = 0;
  }

  get paginatedTasinmazlar() {
    const start = (this.page - 1) * this.pageSize;
    return this.tasinmazlar.slice(start, start + this.pageSize);
  }
  get(){
    const id = this.userService.getCurrentUser();
    this.denemeService.GetTasinmazByUserId(id).subscribe(s=>{
      this.tasinmazlar = s;
      this.control();
      this.filtreleDeger = null;
      this.filtreleSecili = "filtrele";
    },e=>{});
  }

  control(){
    const totalPages = Math.ceil(this.tasinmazlar.length / this.pageSize);
    if(this.page==totalPages || totalPages== 0){
      this.bos = this.pageSize-this.tasinmazlar.length;
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
    const totalPages = Math.ceil(this.tasinmazlar.length / this.pageSize);
    if (this.page < totalPages) {
      this.page++;
      this.bos = 0;
      if(this.page==totalPages){
        const kalan = this.tasinmazlar.length % this.pageSize;
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
    this.denemeService.router.navigateByUrl("/mapEkle");
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

  duzenle(){
    const id = localStorage.getItem('tasinmazId');
    if (id) {
      localStorage.removeItem('tasinmazId');
    }
    if(this.selectedIds.length ==1){
      localStorage.setItem('tasinmazId', this.selectedIds[0].toString());
      this.denemeService.router.navigate(['/duzenle']);
    }
    else{
      alert("Lütfen sadece bir seçim yapınız!");
    }

  }

  exportToCSV(): void {
    if(this.selectedIds.length ==1){
      this.denemeService.GetTasinmazById(this.selectedIds[0]).subscribe(s=>
      {
        var id = s.id; 
        var ilAdi = s.mahalle.ilce.il.ilAdi;
        var ilceAdi = s.mahalle.ilce.ilceAdi;
        var mahalleAdi = s.mahalle.mahalleAdi;
        var ada = s.ada;
        var parsel = s.parsel;
        var nitelik = s.nitelik;
        var koordinatBilgileri = s.koordinatBilgileri;
        this.data = [
          { Id: id, Il: ilAdi, Ilce: ilceAdi, Mahalle:mahalleAdi, Ada:ada,Parsel:parsel,Nitelik:nitelik,Koordinatx: koordinatBilgileri.split(",")[0],Koordinaty: koordinatBilgileri.split(",")[1] }
        ];
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
  
  delete(id:number){
    this.deger =null;
    this.denemeService.GetTasinmazById(id).subscribe(s=>{this.deger=s});
    this.denemeService.DeleteTasinmaz(id).subscribe(s=>{
      var id = this.userService.getCurrentUser(); 
      var islem = "Delete";
      var aciklama = "Delete işlemi yapılmıştır. Silinen Taşınmaz: "+ JSON.stringify(this.deger);
      var durum = "Başarılı!";
      var ip;
      this.userService.getUserIp().subscribe((data: string)=>{
        ip = data;
        this.log = new Log(Number(id),durum,islem,aciklama,ip);
        this.logService.PostLog(this.log).subscribe(s=>{});
        
    });
      },
      e=>{
        var id = this.userService.getCurrentUser(); 
        var islem = "Delete";
        var aciklama = "Delete işlemi yapılamamıştır. "+ e;
        var durum = "Başarısız!";
        var ip;
        this.userService.getUserIp().subscribe((data: string)=>{
          ip = data;
          this.log = new Log(Number(id),durum,islem,aciklama,ip);
          this.logService.PostLog(this.log).subscribe(s=>{});
        });
      });
  }

  filtrele(){
    
    
    if(this.filtreleSecili == "id"){
      this.denemeService.GetTasinmazById(Number(this.filtreleDeger)).subscribe(s=>{
        
        this.tasinmazlar = [s];        
        
        this.control();
      });
    }
    else if(this.filtreleSecili == "filtrele"){
    }
    else{
      this.denemeService.GetTasinmazByString(this.filtreleSecili,this.filtreleDeger).subscribe(s=>{
        this.tasinmazlar=s;this.control();
      })
    }
    
  }
}
