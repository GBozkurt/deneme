import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Injectable, Inject,  } from '@angular/core';
import { registerUser } from '../models/registerUser';
import { loginUser } from '../models/loginUser';
import { JwtHelperService} from '@auth0/angular-jwt';
import { BehaviorSubject, Observable } from 'rxjs';
import { user } from '../models/user';


@Injectable({
  providedIn: 'root'
})
export class UserService {
  token_key = "token";
  token:any;
  private authStatus = new BehaviorSubject<boolean>(this.hasToken());
  authStatus$ = this.authStatus.asObservable();
  private role = new BehaviorSubject<boolean>(this.hasToken());
  role$ = this.role.asObservable();
  constructor(public router:Router,private httpClient:HttpClient,@Inject("url") private url: string,private jwtHelper: JwtHelperService) { }

  
  PostLogin(data:loginUser){
    return this.httpClient.post(this.url+"api/User/login",data);
  }

  PostRegister(data:registerUser){
    return this.httpClient.post(this.url+"api/User/register",data);
  }

  PutUpdateUser(data:registerUser,id:number){
    return this.httpClient.put(this.url+"api/User?id="+id,data)
  }

  getAllUsers(){
    return this.httpClient.get(this.url+"api/User");
  }

  getUsersByString(secenek:string,deger:string){
    return this.httpClient.get(this.url+"api/User/GetUserByString?secenek="+secenek+"&deger="+deger)
  }

  getUserIp(){
    return this.httpClient.get(this.url+"api/User/GetUserIp",{ responseType: 'text' });
  }

  checkRole(){
    var id  = this.getCurrentUser();
    this.getUserRole(id).subscribe((response: string)=>{
      if(response=="admin"){
        
        this.role.next(true);
      }
      else{
        this.role.next(false);
      }
    },e=>{console.log(e);});
    
  }

  getUserById(id: number): Observable<any>{
    return this.httpClient.get<any>(this.url+"api/User/GetUserById?id="+id);
  }

  getUserRole(id: number){
    return this.httpClient.get(this.url+"api/User/GetUserRole?id="+id,{ responseType: 'text' });
  }

  private hasToken(): boolean {
    return !!localStorage.getItem('token');
  }


  
  loggedIn(){
    const token = localStorage.getItem('token'); 
   return this.jwtHelper.isTokenExpired(token);
  }

  getCurrentUser(){
    return this.jwtHelper.decodeToken(localStorage.getItem(this.token_key)).nameid;
  }

  clearToken() {
    localStorage.removeItem('token');
    this.authStatus.next(false);
    this.role.next(false);
  }

  setToken(token: string) {
    localStorage.setItem('token', token);
    this.authStatus.next(true);
  }

  DeleteUSer(id:number){
    return this.httpClient.delete(this.url+"api/User?id="+id);
  }
}
