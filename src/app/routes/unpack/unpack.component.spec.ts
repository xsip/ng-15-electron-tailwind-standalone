import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UnpackComponent } from './unpack.component';

describe('UnpackComponent', () => {
  let component: UnpackComponent;
  let fixture: ComponentFixture<UnpackComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ UnpackComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UnpackComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
