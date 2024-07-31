import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MapEkleComponent } from './map-ekle.component';

describe('MapEkleComponent', () => {
  let component: MapEkleComponent;
  let fixture: ComponentFixture<MapEkleComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MapEkleComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MapEkleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
