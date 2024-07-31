import { Component, OnInit} from '@angular/core';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import XYZ from 'ol/source/XYZ';
import ScaleLine from 'ol/control/ScaleLine';
import { fromLonLat, toLonLat } from 'ol/proj';
import { UserService } from '../services/user.service';
import { DenemeService } from '../services/deneme.service';
@Component({
  selector: 'app-map-ekle',
  templateUrl: './map-ekle.component.html',
  styleUrls: ['./map-ekle.component.css']
})
export class MapEkleComponent implements OnInit {
  map: Map;
  osmLayer: TileLayer;
  googleLayer: TileLayer;
 
  constructor(private userService: UserService,private denemeService:DenemeService) { }

  ngOnInit(): void {
    if(this.userService.loggedIn()){
      this.userService.router.navigateByUrl('/giris');
    }
    this.userService.checkRole();
    
    this.osmLayer = new TileLayer({
      source: new OSM(),
      visible: true,
      opacity: 1
    });

 
    this.googleLayer = new TileLayer({
      source: new XYZ({
        url: 'https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', 
        maxZoom: 21
      }),
      visible: true,
      opacity: 1 
    });


  }

 

  ngAfterViewInit(): void {
    
   
    this.map = new Map({
      target: 'map',
      layers: [this.osmLayer, this.googleLayer],
      view: new View({
        center: fromLonLat([34.97645837438064, 38.09153950738204]),
        zoom: 6.5
      }),
      controls: [
        new ScaleLine()
      ]
    });

    this.map.on('click', (event) => {
      const coordinates = toLonLat(event.coordinate);
      const coordinatesString = coordinates.join(', ');
      localStorage.setItem('selectedCoordinates', coordinatesString);
      window.location.href = '/ekle';
    });
  

  


  
    const osmOpacityInput = document.getElementById('osm-opacity') as HTMLInputElement;
    osmOpacityInput.addEventListener('input', (event: any) => {
      this.setOsmOpacity(parseFloat(event.target.value));
    });

   
    const googleOpacityInput = document.getElementById('google-opacity') as HTMLInputElement;
    googleOpacityInput.addEventListener('input', (event: any) => {
      this.setGoogleOpacity(parseFloat(event.target.value));
    });
  }

  setOsmOpacity(opacity: number): void {
    this.osmLayer.setOpacity(opacity);
  }

  setGoogleOpacity(opacity: number): void {
    this.googleLayer.setOpacity(opacity);
  }
}