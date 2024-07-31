import { Injectable,Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Log } from '../models/log';

@Injectable({
  providedIn: 'root'
})
export class LogService {

  constructor(private httpClient:HttpClient,@Inject("url") private url: string) { }


  PostLog(data:Log){
    return this.httpClient.post(this.url+"api/Log",data);
  }

  GetLog(){
    return this.httpClient.get(this.url+"api/Log");
  }
  DeleteLog(id:number){
    return this.httpClient.delete(this.url+"api/Log?id="+id);
  }

  GetLogById(id:number){
    return this.httpClient.get(this.url+"api/Log/GetLogById?id="+id);
  }

  GetLogByString(secenek:string,deger:string){
    return this.httpClient.get(this.url+"api/Log/GetLogsByString?secenek="+secenek+"&deger="+deger);
  }
}
