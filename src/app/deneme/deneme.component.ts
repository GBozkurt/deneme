import { Component, OnInit, } from '@angular/core';
import { DenemeService } from '../services/deneme.service';
import { UserService } from '../services/user.service';
import { Log } from '../models/log';
import { LogService } from '../services/log.service';
import { Tasinmaz } from '../models/tasinmaz';
import * as alertify from 'alertifyjs';

@Component({
  selector: 'app-deneme',
  templateUrl: './deneme.component.html',
  styleUrls: ['./deneme.component.css']
})
export class DenemeComponent implements OnInit {

  constructor(private denemeService: DenemeService, private userService: UserService, private logService: LogService) { }
  filtreleSecili: string = "filtrele";
  filtreleDeger: string;
  tasinmazlar: any = [];
  page: number = 1;
  pageSize: number = 8;
  bos: number = 0;
  list: number[] = [];
  log: Log;
  deger: Tasinmaz;
  selectedIds: number[] = [];
  data: any[];
  sonraki:boolean;
  onceki:boolean;
  ngOnInit() {
    if ((this.userService.loggedIn())) {
      this.userService.router.navigateByUrl('/giris');
    }
    this.userService.checkRole();
    
    this.get();

  }

  //TAŞINMAZLARI BÖLEREK LİSTELEME
  get paginatedTasinmazlar() {
    const start = (this.page - 1) * this.pageSize;
    return this.tasinmazlar.slice(start, start + this.pageSize);
  }

  //TAŞINMAZLARI ALMA
  get() {
    const id = this.userService.getCurrentUser();
    this.denemeService.GetTasinmazByUserId(id).subscribe(s => {
      this.onceki=false;
      this.sonraki=true;
      this.tasinmazlar = s;
      this.bos=0;
      this.page=1;
      this.selectedIds = [];
      this.control();
      this.filtreleDeger = null;
      this.filtreleSecili = "filtrele";
    }, e => { });
  }

  //BOŞ SATIR KONTROLÜ
  control() {
    const totalPages = Math.ceil(this.tasinmazlar.length / this.pageSize);
    const selectAllCheckbox = <HTMLInputElement>document.getElementById('selectAll');
        selectAllCheckbox.checked = false;
    if (this.page == totalPages || totalPages == 0) {
      this.bos = this.pageSize - this.tasinmazlar.length;
      this.sonraki=false;
      this.onceki=false;
    }
  }
  get listMaker() {
    this.list = [];
    for (let i = 0; i < this.bos; i++) {
      this.list.push(i);
    }
    return this.list;
  }

  //ÖNCEKİ SAYFA
  previousPage() {
    if (this.page > 1) {
      this.page--;
      this.bos = 0;
      this.onceki=true;
      this.sonraki=true;
      this.selectedIds=[];
      if(this.page == 1)
      {
        this.onceki=false;
      }
    }
  }
  //SONRAKİ SAYFA
  nextPage() {
    const totalPages = Math.ceil(this.tasinmazlar.length / this.pageSize);
    if (this.page < totalPages) {
      this.page++;
      this.bos = 0;
      this.selectedIds=[];
      this.onceki=true;
      this.sonraki=true;
      if (this.page == totalPages) {
        const kalan = this.tasinmazlar.length % this.pageSize;
        this.sonraki=false;
        if (kalan != 0) {
          this.bos = this.pageSize - kalan;
        }

      }
    }

  }

  //CHECKBOX DEĞİŞİNCE ID ALMA
  onCheckboxChange(event: any, id: number) {
    const selectAllCheckbox = <HTMLInputElement>document.getElementById('selectAll');
    
    if (event.target.checked) {
      this.selectedIds.push(id);
      if (this.selectedIds.length === this.paginatedTasinmazlar.length) {
        selectAllCheckbox.checked = true;
      }
    } else {
      const index = this.selectedIds.indexOf(id);
      if (index > -1) {
        this.selectedIds.splice(index, 1);
      }
      selectAllCheckbox.checked = false;
    }
  }
  onSelectAllChange(event: any) {
    this.selectedIds = [];
    if (event.target.checked) {
      this.paginatedTasinmazlar.forEach(item => {
        this.selectedIds.push(item.id);
      });
    }
  }

  isSelected(id: number): boolean {
    return this.selectedIds.includes(id);
  }

  selectAllCheckboxes(event: any) {
    if (event.target.checked) {
      this.selectedIds = this.paginatedTasinmazlar.map(tasinmaz => tasinmaz.id);
    } else {
      this.selectedIds = [];
    }
  }

  //TAŞINMAZ EKLEME
  ekle() {
    this.denemeService.router.navigateByUrl("/mapEkle");
  }

  //SEÇİLEN TAŞINMAZLARI DELETE'E GÖNDERME
  deleteSelected() {
    if(this.selectedIds.length==0 ){
      alertify.notify('Lütfen bir seçim yapınız!', 'error', 3, function(){  console.log('dismissed'); });
    }
    else{
      const secim = window.confirm('Seçili taşınmazları silmek istediğinize emin misiniz?');
      if (secim) {
        this.selectedIds.forEach(element => {
          this.delete(element);
  
        });
        const selectAllCheckbox = <HTMLInputElement>document.getElementById('selectAll');
        selectAllCheckbox.checked = false;
        this.selectedIds = [];
        
      }
    }
   
  }

  //TAŞINMAZ DÜZENLEME
  duzenle() {
    const id = localStorage.getItem('tasinmazId');
    if (id) {
      localStorage.removeItem('tasinmazId');
    }
    if (this.selectedIds.length == 1) {
      localStorage.setItem('tasinmazId', this.selectedIds[0].toString());
      this.denemeService.router.navigate(['/duzenle']);
    }
    else {
      alertify.notify('Lütfen bir seçim yapınız!', 'error', 3, function(){  console.log('dismissed'); });
    }

  }

  //TAŞINMAZ RAPORLAMA
  exportToCSV(): void {
    if (this.selectedIds.length == 1) {
      this.denemeService.GetTasinmazById(this.selectedIds[0]).subscribe(s => {
        const id = s.id;
        const ilAdi = s.mahalle.ilce.il.ilAdi;
        const ilceAdi = s.mahalle.ilce.ilceAdi;
        const mahalleAdi = s.mahalle.mahalleAdi;
        const ada = s.ada;
        const parsel = s.parsel;
        const nitelik = s.nitelik;
        const koordinatBilgileri = s.koordinatBilgileri;
        this.data = [
          { Id: id, Il: ilAdi, Ilce: ilceAdi, Mahalle: mahalleAdi, Ada: ada, Parsel: parsel, Nitelik: nitelik, Koordinatx: koordinatBilgileri.split(",")[0], Koordinaty: koordinatBilgileri.split(",")[1] }
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
        alertify.notify('Raporlama Başarılı!', 'success', 3, function(){  console.log('dismissed'); });
        const selectAllCheckbox = <HTMLInputElement>document.getElementById('selectAll');
        selectAllCheckbox.checked = false;
        this.selectedIds = [];
      }
      );
    }
    else {
      alertify.notify('Lütfen bir seçim yapınız!', 'error', 3, function(){  console.log('dismissed'); });
    }

  }

  //TAŞINMAZ SİLME
  delete(id: number) {
    this.deger = null;
    this.denemeService.GetTasinmazById(id).subscribe(s => { this.deger = s });
    this.denemeService.DeleteTasinmaz(id).subscribe(s => {
      
      const id = this.userService.getCurrentUser();
      const islem = "T-Silme";
      const aciklama = "Taşınmaz silme işlemi yapılmıştır. Silinen Taşınmaz: " + JSON.stringify(this.deger);
      const durum = "Başarılı!";
      
      this.userService.getUserIp().subscribe((data: string) => {
        const ip = data;
        this.log = new Log(Number(id), durum, islem, aciklama, ip);
        this.logService.PostLog(this.log).subscribe(s => { });
        this.get();
        alertify.notify('Silme Başarılı!', 'success', 3, function(){  console.log('dismissed'); });
      });
      
    },
      e => {
        const id = this.userService.getCurrentUser();
        const islem = "T-Silme";
        const aciklama = "Taşınmaz silme işlemi yapılamamıştır. " + e;
        const durum = "Başarısız!";
        
        this.userService.getUserIp().subscribe((data: string) => {
          const ip = data;
          this.log = new Log(Number(id), durum, islem, aciklama, ip);
          this.logService.PostLog(this.log).subscribe(s => { });
          alertify.notify('Silme Başarısız!', 'error', 3, function(){  console.log('dismissed'); });
        });
      });
  }

  //TAŞINMAZLARI FİLTRELEME
  filtrele() {
    if (this.filtreleSecili == "id") {
      if(this.filtreleDeger==null){
        alertify.notify('Lütfen değer giriniz!', 'error', 3, function(){  console.log('dismissed'); });
      }
      else{
        this.denemeService.GetTasinmazById(Number(this.filtreleDeger)).subscribe(s => {
          this.selectedIds = [];
          
          this.tasinmazlar = [s];
          this.control();
        },e=>{
          alertify.notify('Böyle bir taşınmaz yok!', 'error', 3, function(){  console.log('dismissed'); });
        });
      }
     
    }
    else if (this.filtreleSecili == "filtrele") {
      alertify.notify('Lütfen filtre seçiniz!', 'error', 3, function(){  console.log('dismissed'); });
    }
    else {
      if(this.filtreleDeger==null){
        alertify.notify('Lütfen değer giriniz!', 'error', 3, function(){  console.log('dismissed'); });
      }
      else{
        this.denemeService.GetTasinmazByString(this.filtreleSecili, this.filtreleDeger).subscribe(s => {
          this.selectedIds = [];
          const selectAllCheckbox = <HTMLInputElement>document.getElementById('selectAll');
          selectAllCheckbox.checked = false;
          this.tasinmazlar = s; this.control();

        });
      }
      
    }
  }
}
