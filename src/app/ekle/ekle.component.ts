import { Component, OnInit } from '@angular/core';
import { DenemeService } from '../services/deneme.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Tasinmaz } from '../models/tasinmaz';
import { UserService } from '../services/user.service';
import { LogService } from '../services/log.service';
import { Log } from '../models/log';

@Component({
  selector: 'app-ekle',
  templateUrl: './ekle.component.html',
  styleUrls: ['./ekle.component.css']
})
export class EkleComponent implements OnInit {
  il:any;
  ilce:any;
  mahalle:any;
  selectedIlId:number;
  selectedIlceId:number;
  selectedMahalleId:number;
  deger: Tasinmaz;
  myForm: FormGroup;
  coordinates: string | null = null;
  log:Log;
  constructor( private formBuilder: FormBuilder,private denemeService:DenemeService,private userService:UserService, private logService:LogService) { }

  ngOnInit() {
    if(this.userService.loggedIn()){
      this.userService.router.navigateByUrl('/giris');
    }
    this.userService.checkRole();
    this.getIl();
    const storedCoordinates = localStorage.getItem('selectedCoordinates');
    if (storedCoordinates) {
      this.coordinates = storedCoordinates;
      localStorage.removeItem('selectedCoordinates');
    }
    this.myForm = this.formBuilder.group({
      mahalleId: ['', Validators.required],
      ada: ['', Validators.required],
      parsel: ['', Validators.required],
      nitelik: ['', Validators.required],
      koordinatBilgileri: ['', Validators.required],
      ilSelect: ['', Validators.required],
      ilceSelect: ['', Validators.required],
      
    });
  }
  
  onIlChange(){
    if(this.selectedIlId){
      this.getIlceByIl(this.selectedIlId);
      this.selectedIlceId = null;
    }
    else{
      this.ilce = null;
    }
  }
  
  onIlceChange(){
    if(this.selectedIlceId){
      this.getMahalleByIlce(this.selectedIlceId);
    }
    else{
      this.mahalle = null;
    }
  }

  getIl(){
    this.denemeService.GetAllIl().subscribe(s=>{this.il=s},e=>{} );
  }
  
  getIlceByIl(il:number){
    this.denemeService.GetAllIlce(il).subscribe(s=>{this.ilce=s},e=>{} );
  }
  
  getMahalleByIlce(ilce:number){
    this.denemeService.GetAllMahalle(ilce).subscribe(s=>{this.mahalle=s},e=>{} );
  }

  onSubmit() {
    if(this.myForm.valid){
      const id = this.userService.getCurrentUser();
      const formData = this.myForm.value;
      this.deger = new Tasinmaz(parseInt(formData.mahalleId,10),formData.ada,formData.parsel,formData.nitelik,formData.koordinatBilgileri,Number(id));
      this.postFormData(this.deger);
    }
    }
  
  


  postFormData(tasinmaz:Tasinmaz){
    const secim = window.confirm('Yeni taşınmazı eklemek istediğinize emin misiniz?');
    if (secim){
      this.denemeService.PostAddTasinmaz(tasinmaz).subscribe(s=>{
        var id = this.userService.getCurrentUser(); 
        var islem = "Add";
        var aciklama = "Add işlemi yapılmıştır. Eklenen Taşınmaz: "+ JSON.stringify(tasinmaz);
        var durum = "Başarılı!";
        var ip;
        this.userService.getUserIp().subscribe((data: string)=>{
          ip = data;
          this.log = new Log(Number(id),durum,islem,aciklama,ip);
          this.logService.PostLog(this.log).subscribe(s=>{});
          this.denemeService.router.navigate(['/deneme']);
      });
      },e=>{ 
        var id = this.userService.getCurrentUser(); 
        var islem = "Add";
        var aciklama = "Add işlemi yapılamamıştır. "+e;
        var durum = "Başarısız!";
        var ip;
        this.userService.getUserIp().subscribe((data: string)=>{
          ip = data;
          this.log = new Log(Number(id),durum,islem,aciklama,ip);
          this.logService.PostLog(this.log).subscribe(s=>{});
          this.denemeService.router.navigate(['/deneme']);
      });});
    }   
  } 
}
