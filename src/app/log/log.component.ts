import { Component, OnInit } from '@angular/core';
import { LogService } from '../services/log.service';
import { UserService } from '../services/user.service';
import * as alertify from 'alertifyjs';
import { forkJoin } from 'rxjs';
@Component({
  selector: 'app-log',
  templateUrl: './log.component.html',
  styleUrls: ['./log.component.css']
})
export class LogComponent implements OnInit {
  logs: any = [];
  page: number = 1;
  pageSize: number = 8;
  bos: number = 0;
  list: number[] = [];
  selectedIds: number[] = [];
  data: any[];
  filtreleSecili: string = "filtrele";
  filtreleDeger: string;
  sonraki:boolean;
  onceki:boolean;
  constructor(private logService: LogService, private userService: UserService) { }

  ngOnInit() {
    if ((this.userService.loggedIn())) {

      this.userService.router.navigateByUrl('/giris');
    }
    this.checkRole();
    this.getLogs();
  }

  //KULLANICI ADMİN DEĞİLSE GİRİŞ YAPMA
  checkRole() {
    const id = this.userService.getCurrentUser();
    const a = "admin";
    this.userService.getUserRole(id).subscribe((response: string) => {

      if (response != a) {
        this.userService.router.navigateByUrl('/deneme');
      }
    }, e => { console.log("Hata", e) });
  }

  //LOGLARI GETİR
  getLogs() {
    
    this.logService.GetLog().subscribe(s => {
      this.onceki=false;
      this.sonraki=true;
      this.logs = s;
      this.bos=0;
      this.page=1;
      this.selectedIds = [];
      this.control();
      this.filtreleDeger = null;
      this.filtreleSecili = "filtrele";
    }, e => { console.log("Hata!"); });

  }

  //LOGLARI BÖL
  get paginatedKullanicilar() {
    const start = (this.page - 1) * this.pageSize;
    return this.logs.slice(start, start + this.pageSize);
  }

  //BOŞ SATIR KONTROLÜ
  control() {
    const totalPages = Math.ceil(this.logs.length / this.pageSize);
    const selectAllCheckbox = <HTMLInputElement>document.getElementById('selectAll');
    selectAllCheckbox.checked = false;
    if (this.page == totalPages || totalPages == 0) {
      this.bos = this.pageSize - this.logs.length;
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
    const totalPages = Math.ceil(this.logs.length / this.pageSize);
    if (this.page < totalPages) {
      this.page++;
      this.bos = 0;
      this.selectedIds=[];
      this.onceki=true;
      this.sonraki=true;
      if (this.page == totalPages) {
        const kalan = this.logs.length % this.pageSize;
        this.sonraki=false;
        if (kalan != 0) {
          this.bos = this.pageSize - kalan;
        }

      }
    }

  }

  //SEÇİLEN LOGLARI DELETE'E GÖNDER
  // deleteSelected() {
  //   const secim = window.confirm('Seçili logları silmek istediğinize emin misiniz?');
  //   if (secim) {
  //     this.selectedIds.forEach(element => {
  //       this.delete(element);
  //     });
  //     this.selectedIds = [];
  //   }
  // }

  // //LOGLARI SİL
  // delete(id: number) {
  //   this.logService.DeleteLog(id).subscribe(s => {
  //     this.getLogs();
  //     alertify.notify('Silme Başarılı!', 'success', 3, function () { console.log('dismissed'); });
  //   }, e => {
  //     alertify.notify('Silme Başarısız!', 'error', 3, function () { console.log('dismissed'); });
  //   });
  // }

  //CHECKBOXTAN ID ALMA
  onCheckboxChange(event: any, id: number) {
    const selectAllCheckbox = <HTMLInputElement>document.getElementById('selectAll');
    
    if (event.target.checked) {
      this.selectedIds.push(id);
      if (this.selectedIds.length === this.paginatedKullanicilar.length) {
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
      this.paginatedKullanicilar.forEach(item => {
        this.selectedIds.push(item.id);
      });
    }
  }

  isSelected(id: number): boolean {
    return this.selectedIds.includes(id);
  }

  selectAllCheckboxes(event: any) {
    if (event.target.checked) {
      this.selectedIds = this.paginatedKullanicilar.map(tasinmaz => tasinmaz.id);
      console.log(this.selectedIds);
    } else {
      this.selectedIds = [];
    }
  }

  //LOGLARI FİLTRELE
  filtrele() {
    if (this.filtreleSecili == "id") {
      this.logService.GetLogById(Number(this.filtreleDeger)).subscribe(s => {
        this.logs = [s];
        this.selectedIds = [];
        this.control();
      },e=>{
        alertify.notify('Böyle bir log yok!', 'error', 3, function(){  console.log('dismissed'); });
      });
    }
    else if (this.filtreleSecili == "filtrele") {
      return null;
    }
    else {
      this.logService.GetLogByString(this.filtreleSecili, this.filtreleDeger).subscribe(s => {
        this.selectedIds = [];
        this.logs = s; this.control();
      })
    }

  }

  //LOG RAPORLAMA
  exportToCSV(): void { 
    if(this.selectedIds.length==0){
      alertify.notify('Lütfen bir seçim Yapınız!', 'error', 3, function () { console.log('dismissed'); });
    }else{
      const requests = this.selectedIds.map(id => this.logService.GetLogById(id));
      forkJoin(requests).subscribe(responses => {
          this.data = responses;
          const header = Object.keys(this.data[0]).map(field => `"${field}"`).join(',');
          const rows = this.data.map(item => 
              Object.values(item).map(value => 
                  `"${String(value).replace(/"/g, '""')}"`
              ).join(',')
          );
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
          const selectAllCheckbox = <HTMLInputElement>document.getElementById('selectAll');
          selectAllCheckbox.checked = false;
          this.selectedIds = [];
          alertify.notify('Raporlama Başarılı!', 'success', 3, function () { console.log('dismissed'); });
      });
    }
   
}
}
