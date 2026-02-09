import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TabulatorTableComponentComponent } from './tabulator-table-component.component';

describe('TabulatorTableComponentComponent', () => {
  let component: TabulatorTableComponentComponent;
  let fixture: ComponentFixture<TabulatorTableComponentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TabulatorTableComponentComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TabulatorTableComponentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
