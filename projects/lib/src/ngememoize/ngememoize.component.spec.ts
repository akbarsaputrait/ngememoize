import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NgememoizeComponent } from './ngememoize.component';

describe('NgememoizeComponent', () => {
  let component: NgememoizeComponent;
  let fixture: ComponentFixture<NgememoizeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NgememoizeComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(NgememoizeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
