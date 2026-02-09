import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JSpreadsheetTableComponent } from './jspreadsheet-table.component';

describe('JSpreadsheetTableComponent', () => {
  let component: JSpreadsheetTableComponent;
  let fixture: ComponentFixture<JSpreadsheetTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [JSpreadsheetTableComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(JSpreadsheetTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
