import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UserDuzenleComponent } from './user-duzenle.component';

describe('UserDuzenleComponent', () => {
  let component: UserDuzenleComponent;
  let fixture: ComponentFixture<UserDuzenleComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UserDuzenleComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UserDuzenleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
