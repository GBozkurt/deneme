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
  pageSize: number = 11;
  bos: number = 0;
  list: number[] = [];
  log: Log;
  deger: Tasinmaz;
  selectedIds: number[] = [];
  data: any[];
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
      this.tasinmazlar = s;
      this.control();
      this.filtreleDeger = null;
      this.filtreleSecili = "filtrele";
    }, e => { });
  }

  //BOŞ SATIR KONTROLÜ
  control() {
    const totalPages = Math.ceil(this.tasinmazlar.length / this.pageSize);
    if (this.page == totalPages || totalPages == 0) {
      this.bos = this.pageSize - this.tasinmazlar.length;
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

    }
  }
  //SONRAKİ SAYFA
  nextPage() {
    const totalPages = Math.ceil(this.tasinmazlar.length / this.pageSize);
    if (this.page < totalPages) {
      this.page++;
      this.bos = 0;
      if (this.page == totalPages) {
        const kalan = this.tasinmazlar.length % this.pageSize;
        if (kalan != 0) {
          this.bos = this.pageSize - kalan;
        }

      }
    }

  }

  //CHECKBOX DEĞİŞİNCE ID ALMA
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

  //TAŞINMAZ EKLEME
  ekle() {
    this.denemeService.router.navigateByUrl("/mapEkle");
  }

  //SEÇİLEN TAŞINMAZLARI DELETE'E GÖNDERME
  deleteSelected() {
    const secim = window.confirm('Seçili taşınmazları silmek istediğinize emin misiniz?');
    if (secim) {
      this.selectedIds.forEach(element => {
        this.delete(element);

      });
      
      this.selectedIds = [];
      
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
      alert("Lütfen sadece bir seçim yapınız!");
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
      }
      );
    }
    else {
      alertify.notify('Raporlama Başarısız!', 'error', 3, function(){  console.log('dismissed'); });
    }

  }

  //TAŞINMAZ SİLME
  delete(id: number) {
    this.deger = null;
    this.denemeService.GetTasinmazById(id).subscribe(s => { this.deger = s });
    this.denemeService.DeleteTasinmaz(id).subscribe(s => {
      
      const id = this.userService.getCurrentUser();
      const islem = "Taşınmaz Silme";
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
        const islem = "Taşınmaz Silme";
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
      this.denemeService.GetTasinmazById(Number(this.filtreleDeger)).subscribe(s => {
        this.tasinmazlar = [s];
        this.control();
      });
    }
    else if (this.filtreleSecili == "filtrele") {
      return null;
    }
    else {
      this.denemeService.GetTasinmazByString(this.filtreleSecili, this.filtreleDeger).subscribe(s => {
        this.tasinmazlar = s; this.control();
      })
    }
  }
}
