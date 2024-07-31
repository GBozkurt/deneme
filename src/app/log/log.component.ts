import { Component, OnInit } from '@angular/core';
import { LogService } from '../services/log.service';
import { UserService } from '../services/user.service';

@Component({
  selector: 'app-log',
  templateUrl: './log.component.html',
  styleUrls: ['./log.component.css']
})
export class LogComponent implements OnInit {
  logs: any = [];
  page: number = 1; 
  pageSize: number = 5; 
  bos: number = 0;
  list:number[] = []; 
  selectedIds: number[] = [];
  data: any[];
  filtreleSecili:string = "filtrele";
  filtreleDeger:string;
  constructor(private logService:LogService,private userService:UserService) { }

  ngOnInit() {
    if((this.userService.loggedIn())){
     
      this.userService.router.navigateByUrl('/giris');
    }
    this.checkRole();
    this.getLogs();
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

  getLogs(){
    this.logService.GetLog().subscribe(s=>{
      this.logs = s;
      this.control();
      this.filtreleDeger=null;
      this.filtreleSecili="filtrele";
    },e=>{console.log("Hata!");});
    
  }

  get paginatedKullanicilar() {
    const start = (this.page - 1) * this.pageSize;
    return this.logs.slice(start, start + this.pageSize);
  }

  control(){
    const totalPages = Math.ceil(this.logs.length / this.pageSize);
    if(this.page==totalPages || totalPages== 0){
      this.bos = this.pageSize-this.logs.length;
    } 
  }

  previousPage() {
    if (this.page > 1) {
      this.page--;
      this.bos = 0;
      
    }
  }
  deleteSelected(){
    const secim = window.confirm('Seçili logları silmek istediğinize emin misiniz?');
    if (secim){
      this.selectedIds.forEach(element => {
        this.delete(element);
        
      });
      location.reload();
      this.selectedIds = [];
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
    const totalPages = Math.ceil(this.logs.length / this.pageSize);
    if (this.page < totalPages) {
      this.page++;
      this.bos = 0;
      if(this.page==totalPages){
        const kalan = this.logs.length % this.pageSize;
        if(kalan!=0){
          this.bos = this.pageSize - kalan;
        }
        
      }
    }
    
  }
  delete(id:number){
    this.logService.DeleteLog(id).subscribe(s=>{location.reload();});
    
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

  filtrele(){
    
    
    if(this.filtreleSecili == "id"){
      this.logService.GetLogById(Number(this.filtreleDeger)).subscribe(s=>{
        this.logs= [s];        
        this.control();
      });
    }
    else if(this.filtreleSecili == "filtrele"){
    }
    else{
      this.logService.GetLogByString(this.filtreleSecili,this.filtreleDeger).subscribe(s=>{
        this.logs=s;this.control();
      })
    }
    
  }

  exportToCSV(): void {
    if(this.selectedIds.length ==1){
      this.logService.GetLogById(this.selectedIds[0]).subscribe(s=>
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
}
