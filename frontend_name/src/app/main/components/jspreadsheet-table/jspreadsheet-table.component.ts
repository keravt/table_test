import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  OnDestroy,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';

import jspreadsheet, { JSpreadsheet } from 'jspreadsheet-ce';

@Component({
  selector: 'app-jspreadsheet-table',
  standalone: true,
  templateUrl: `./jspreadsheet-table.component.html`,
  styleUrl: "./jspreadsheet-table.component.css",
  encapsulation: ViewEncapsulation.None,
})
export class JSpreadsheetTableComponent implements AfterViewInit, OnDestroy {
  @Input() data: any[] = [];

  @ViewChild('host', { static: true })
  host!: ElementRef<HTMLDivElement>;

  private table?: JSpreadsheet;

  ngAfterViewInit(): void {
    jspreadsheet(this.host.nativeElement, {
      worksheets: [
        {
          data: this.data,
          minDimensions: [6, 10],

          columns: [
            {
              type: 'checkbox',
              title: '',
              width: 40,
            },
            {
              type: 'text',
              title: 'Название',
              width: 200,
            },
            {
              type: 'dropdown',
              title: 'Руководитель',
              width: 180,
              source: [
                'Ivan Petrov',
                'Anna Smirnova',
                'John Smith',
                'Maria Ivanova',
              ],
            },
            {
              type: 'text',
              title: 'Компания',
              width: 180,
            },
            {
              type: 'text',
              title: 'Финансовый менеджер',
              width: 200,
            },
          ],
        },
      ],
    });
  }

  ngOnDestroy(): void {}
}
