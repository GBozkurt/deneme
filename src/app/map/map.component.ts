import { Component, OnInit, AfterViewInit } from '@angular/core';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import XYZ from 'ol/source/XYZ';
import ScaleLine from 'ol/control/ScaleLine';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';
import Style from 'ol/style/Style';
import Stroke from 'ol/style/Stroke';
import Fill from 'ol/style/Fill';
import CircleStyle from 'ol/style/Circle';
import { fromLonLat } from 'ol/proj';
import { UserService } from '../services/user.service';
import { DenemeService } from '../services/deneme.service';
@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css']
})
export class MapComponent implements OnInit, AfterViewInit {
  map: Map;
  osmLayer: TileLayer;
  googleLayer: TileLayer;
  vectorSource = new VectorSource();

  constructor(private userService: UserService, private denemeService: DenemeService) { }

  ngOnInit(): void {
    if (this.userService.loggedIn()) {
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

    const vectorLayer = new VectorLayer({
      source: this.vectorSource,
      style: new Style({
        image: new CircleStyle({
          radius: 7,
          fill: new Fill({ color: 'red' }),
          stroke: new Stroke({
            color: 'black', width: 2
          })
        })
      })
    });
    this.map = new Map({
      target: 'map',
      layers: [this.osmLayer, this.googleLayer, vectorLayer],
      view: new View({
        center: fromLonLat([34.97645837438064, 38.09153950738204]),
        zoom: 6.5
      }),
      controls: [
        new ScaleLine()
      ]
    });

    const id = this.userService.getCurrentUser();
    this.denemeService.GetTasinmazByUserId(id).subscribe(properties => {
      properties.forEach(property => {
        const [longitude, latitude] = property.koordinatBilgileri.split(',').map(coord => parseFloat(coord.trim()));

        const feature = new Feature({
          geometry: new Point(fromLonLat([longitude, latitude])),
          name: property.name
        });

        this.vectorSource.addFeature(feature);
      });
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