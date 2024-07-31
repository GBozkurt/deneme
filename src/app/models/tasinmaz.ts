import { Mahalle } from "./mahalle";

export class Tasinmaz {
    id: number;
    mahalleId: number;
    mahalle:Mahalle;
    ada: string;
    parsel: string;
    nitelik: string;
    koordinatBilgileri: string;
    userId:number;

  
    constructor(mahalleId:number , ada:string,parsel:string,nitelik:string,koordinatBilgisi:string,id:number) {
        this.mahalleId = mahalleId;
        this.ada = ada;
        this.parsel = parsel;
        this.nitelik = nitelik;
        this.koordinatBilgileri = koordinatBilgisi;
        this.userId=id;
    }
}
