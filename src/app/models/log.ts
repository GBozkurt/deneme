export class Log {
    Id: number;
    userId: number;
    durum: string;
    islemTip: string;
    aciklama: string;
    kullaniciIp: string;
    
    
   

  
    constructor(userId:number , durum:string,islem:string,aciklama:string,kullaniciIp:string) {
        this.userId = userId;
        this.durum = durum;
        this.islemTip = islem;
        this.aciklama = aciklama;
        this.kullaniciIp = kullaniciIp;
    }
}
