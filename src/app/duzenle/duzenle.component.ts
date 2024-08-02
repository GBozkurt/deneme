import { Component, OnInit} from '@angular/core';
import { DenemeService } from '../services/deneme.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Tasinmaz } from '../models/tasinmaz';
import { UserService } from '../services/user.service';
import { Log } from '../models/log';
import { LogService } from '../services/log.service';
import * as alertify from 'alertifyjs';
@Component({
  selector: 'app-duzenle',
  templateUrl: './duzenle.component.html',
  styleUrls: ['./duzenle.component.css']
})
export class DuzenleComponent implements OnInit {
  id: number;
  il: any;
  ilce: any;
  mahalle: any;
  selectedIlId: number;
  selectedIlceId: number;
  selectedMahalleId: number;
  deger: Tasinmaz;
  myForm: FormGroup;
  log: Log;

  constructor(private formBuilder: FormBuilder, private denemeService: DenemeService, private userService: UserService, private logService: LogService) { }


  ngOnInit() {
    if (this.userService.loggedIn()) {
      this.userService.router.navigateByUrl('/giris');
    }
    this.userService.checkRole();
    this.getIl();
    this.myForm = this.formBuilder.group({
      mahalleId: ['', Validators.required],
      ada: ['', Validators.required],
      parsel: ['', Validators.required],
      nitelik: ['', Validators.required],
      koordinatBilgileri: ['', Validators.required],
      ilSelect: ['', Validators.required],
      ilceSelect: ['', Validators.required],
    });

    this.id = Number(localStorage.getItem('tasinmazId'));
    if (this.id) {
      this.getTasinmazById(this.id);
      localStorage.removeItem('tasinmazId');
    }
  }

  //İL DEĞİŞİNCE İLİ ÇAĞIR
  onIlChange() {
    if (this.selectedIlId) {
      this.getIlceByIl(this.selectedIlId);
      this.selectedIlceId = null;
    }
    else {
      this.ilce = null;
    }
  }

  //İLÇE DEĞİŞİNCE MAHALLEYİ ÇAĞIR
  onIlceChange() {
    if (this.selectedIlceId) {
      this.getMahalleByIlce(this.selectedIlceId);
    }
    else {
      this.mahalle = null;
    }
  }

  //İL, İLÇE, MAHALLEYİ ÇAĞIR
  getIl() {
    this.denemeService.GetAllIl().subscribe(s => { this.il = s }, e => { });
  }
  getIlceByIl(il: number) {
    this.denemeService.GetAllIlce(il).subscribe(s => { this.ilce = s }, e => { });
  }
  getMahalleByIlce(ilce: number) {
    this.denemeService.GetAllMahalle(ilce).subscribe(s => { this.mahalle = s; }, e => { });
  }

  //TAŞINMAZI IDSİNE GÖRE FORM'A GETİRME
  getTasinmazById(id: number) {
    this.denemeService.GetTasinmazById(id).subscribe((item) => {
      this.myForm.patchValue({
        ada: item.ada,
        parsel: item.parsel,
        nitelik: item.nitelik,
        koordinatBilgileri: item.koordinatBilgileri,
        ilceSelect: item.mahalle.ilce.il.id,
        ilSelect: item.mahalle.ilce.id,
        mahalleId: item.mahalleId
      });
      this.selectedIlId = item.mahalle.ilce.il.id;
      this.getIlceByIl(this.selectedIlId);
      this.selectedIlceId = item.mahalle.ilce.id;
      this.getMahalleByIlce(this.selectedIlceId);
      this.selectedMahalleId = item.mahalleId;

    }, e => { console.error('Error loading item details: ', e); });
  }

  //FORMDAKİ VERİYİ DÖNÜŞTÜR
  onSubmit() {
    if (this.myForm.valid) {
      const id = this.userService.getCurrentUser();
      const formData = this.myForm.value;
      this.deger = new Tasinmaz(parseInt(formData.mahalleId, 10), formData.ada, formData.parsel, formData.nitelik, formData.koordinatBilgileri, Number(id));
      this.postFormData(this.id, this.deger);
    }
  }

  //FORMDAKİ VERİYİ BACKENDE GÖNDER
  postFormData(id: number, tasinmaz: Tasinmaz) {
    const secim = window.confirm('Seçili taşınmazı güncellemek istediğinize emin misiniz?');
    if (secim) {
      this.deger = null;
      this.denemeService.GetTasinmazById(this.id).subscribe(s => { this.deger = s });
      this.denemeService.PutUpdateTasinmaz(id, tasinmaz).subscribe(s => {

        const id = this.userService.getCurrentUser();
        const islem = "Taşınmaz Güncelleme";
        const aciklama = "Taşınmaz güncelleme işlemi yapılmıştır. Eski Taşınmaz: " + JSON.stringify(this.deger);
        const durum = "Başarılı!";
        
        this.userService.getUserIp().subscribe((data: string) => {
          const ip = data;
          this.log = new Log(Number(id), durum, islem, aciklama, ip);
          this.logService.PostLog(this.log).subscribe(s => { });
          this.denemeService.router.navigate(['/deneme']);
          alertify.notify('Düzenleme Başarılı!', 'success', 3, function(){  console.log('dismissed'); });
        });
      }, e => {
        const id = this.userService.getCurrentUser();
        const islem = "Taşınmaz Güncelleme";
        const aciklama = "Taşınmaz güncelleme işlemi yapılamamıştır: " + e;
        const durum = "Başarısız!";
        
        this.userService.getUserIp().subscribe((data: string) => {
          const ip = data;
          this.log = new Log(Number(id), durum, islem, aciklama, ip);
          this.denemeService.router.navigate(['/deneme']);
          alertify.notify('Düzenleme Başarısız!', 'error', 3, function(){  console.log('dismissed'); });
        });
      });
    }
  }


}





