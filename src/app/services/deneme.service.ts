import { HttpClient } from "@angular/common/http";
import { Injectable, Inject,  } from '@angular/core';
import { Tasinmaz } from "../models/tasinmaz";
import { Router } from '@angular/router';
import { Observable } from "rxjs";

@Injectable({
  providedIn: 'root'
})
@Injectable()
export class DenemeService {
  id:number;
  constructor(@Inject("url") private url: string,private httpClient: HttpClient,public router: Router) { }

  //TAŞINMAZLARI LİSTELE
  GetAll() {
    return this.httpClient.get(this.url + "api/Tasinmaz");
  }
  
  //TAŞINMAZLARI ID'YE GÖRE LİSTELE
  GetTasinmazById(id:number): Observable<Tasinmaz> {
    return this.httpClient.get<Tasinmaz>(this.url + "api/Tasinmaz/GetTasinmazById?id="+id);
  }

  //TAŞINMAZLARI USERID'YE GÖRE LİSTELE
  GetTasinmazByUserId(id:number): Observable<any> {
    return this.httpClient.get(this.url + "api/Tasinmaz/GetTasinmazByUserId?id="+id);
  }

  //TAŞINMAZLARI ALANA GÖRE LİSTELE
  GetTasinmazByString(secenek:string,deger:string){
    return this.httpClient.get(this.url+"api/Tasinmaz/GetTasinmazByString?secenek="+secenek+"&deger="+deger);
  }

  //İLLERİ LİSTELE
  GetAllIl() {
    return this.httpClient.get(this.url + "api/Iller");
  }

  //İLE GÖRE İLÇELERİ LİSTELE
  GetAllIlce(id : number) {
    return this.httpClient.get(this.url + "api/Ilce/GetIlceByIlId?id="+id);
  }

  //İLÇEYE GÖRE MAHALLELERİ LİSTELE
  GetAllMahalle(id : number) {
    return this.httpClient.get(this.url + "api/Mahalle/GetMahalleByIlceId?id="+id);
  }

  //TAŞINMAZ EKLE
  PostAddTasinmaz(tasinmaz:Tasinmaz){
    return this.httpClient.post(this.url+"api/Tasinmaz/AddTasinmaz",tasinmaz);
  }
  
  //TAŞINMAZ GÜNCELLE
  PutUpdateTasinmaz(id:number,tasinmaz:Tasinmaz){
    return this.httpClient.put(this.url+"api/Tasinmaz/UpdateTasinmaz?id="+id,tasinmaz);
  }

  //TAŞINMAZ SİL
  DeleteTasinmaz(id:number){
    return this.httpClient.delete(this.url+"api/Tasinmaz/DeleteTasinmaz?id="+id);
  }
}
