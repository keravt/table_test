import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  OnChanges,
  OnDestroy,
  SimpleChanges,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TabulatorFull as Tabulator } from 'tabulator-tables';

@Component({
  selector: 'app-tabulator-table',
  templateUrl: './tabulator-table-component.component.html',
  styleUrls: ['./tabulator-table-component.component.scss'],
  standalone: true,
  imports: [FormsModule],
  encapsulation: ViewEncapsulation.None,
})
export class TabulatorTableComponent
  implements AfterViewInit, OnChanges, OnDestroy
{
  @Input() tableData: any[] = [];
  @Input() columnNames: any[] = [];
  @Input() height = '100%';
  isGrouped = false;

  @ViewChild('tabulatorHost', { static: false })
  tabulatorHost!: ElementRef<HTMLDivElement>;

  private tabulator?: Tabulator;
  private viewReady = false;
  groupBy = '';

  filterField = '';
  filterType = '=';
  filterValue = '';

  updateFilter() {
    if (!this.tabulator) return;

    if (!this.filterField) {
      this.tabulator.clearFilter(false);
      return;
    }

    this.tabulator.setFilter(
      this.filterField,
      this.filterType,
      this.filterValue
    );
  }

  clearFilter() {
    if (!this.tabulator) return;

    this.filterField = '';
    this.filterType = '=';
    this.filterValue = '';

    this.tabulator.clearFilter(false);
  }

  ngAfterViewInit(): void {
    this.viewReady = true;
    this.initTable();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!this.tabulator || !changes['tableData']) return;

    requestAnimationFrame(() => {
      if (!this.tabulator) return;
      this.tabulator.replaceData(this.tableData);
    });
  }

  private initTable(): void {
    if (!this.viewReady || this.tabulator) return;

    this.tabulator = new Tabulator(this.tabulatorHost.nativeElement, {
      data: this.tableData,
      groupBy: this.groupBy,
      movableRows: true,
      rowHeader: {
        headerSort: false,
        resizable: false,
        frozen: true,
        headerHozAlign: 'center',
        hozAlign: 'center',
        formatter: 'rowSelection',
        titleFormatter: 'rowSelection',
        cellClick: function (e, cell) {
          cell.getRow().toggleSelect();
        },
        width: 41,
      },
      // rowHeader:{headerSort:false, resizable: false, minWidth:30, width:30, rowHandle:true, formatter:"handle"},
      columns: this.columnNames,
      layout: 'fitColumns',
      height: this.height,
      pagination: true,
      paginationCounter: 'rows',
      paginationSize: 10,
      paginationSizeSelector: [10, 15, 20, 30],
      reactiveData: true,

      // === CORE FEATURES ===
      movableColumns: true,
      resizableRows: true,
      clipboard: true,
      clipboardCopyStyled: false,
      history: true, // undo / redo
      keybindings: {
        undo: 'ctrl+z',
        redo: 'ctrl+y',
      },

      // === SORT / FILTER ===
      headerSort: true,
    });
  }

  ngOnDestroy(): void {
    this.tabulator?.destroy();
  }

  doSelected() {
    console.log(this.tabulator?.getSelectedRows());
  }

  groupByManager() {
    if (!this.tabulator) return;
    if (this.isGrouped) {
      this.tabulator.setGroupBy('');
      this.isGrouped = false;
    } else {
      this.tabulator.setGroupBy('manager');
      this.isGrouped = true;
    }
  }

  downloadXL() {
    this.tabulator?.download('xlsx', 'data.xlsx', { sheetName: 'myData' });
  }
}
