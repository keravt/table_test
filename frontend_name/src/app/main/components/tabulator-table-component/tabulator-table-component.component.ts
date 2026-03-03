import { NgFor, NgIf } from '@angular/common';
import {
  AfterViewInit,
  Component,
  ElementRef,
  HostListener,
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
  imports: [FormsModule, NgIf, NgFor],
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

  activeField = '';
  activeFilters = new Set<string>();

  private columnFilters = new Map<
  string,
  {
    conditions: {
      operator: string;
      value: any;
      logicWithNext?: 'AND' | 'OR';
    }[];
  }
>();

  operators = ['=', '!=', '>', '>=', '<', '<=', 'Содержит'];

  @HostListener('document:click', ['$event'])
  handleClickOutside(event: MouseEvent) {
    if (!this.showFilterPopup) return;

    const popup = document.querySelector('.filter-popup');
    if (popup && !popup.contains(event.target as Node)) {
      this.showFilterPopup = false;
    }
  }

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

  // clearFilter() {
  //   if (!this.tabulator) return;

  //   this.filterField = '';
  //   this.filterType = '=';
  //   this.filterValue = '';

  //   this.tabulator.clearFilter(false);
  // }

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

    const enhancedColumns = this.columnNames.map((col) => ({
      ...col,

      titleFormatter: (cell: any, formatterParams: any, onRendered: any) => {
        const container = document.createElement('div');
        container.style.display = 'flex';
        container.style.alignItems = 'center';
        container.style.justifyContent = 'space-between';

        const titleSpan = document.createElement('span');
        titleSpan.innerText = col.title;

        const filterBtn = document.createElement('span');
        console.log('TE ', this.activeFilters.has(col.field));
        if (this.activeFilters.has(col.field)) {
          filterBtn.classList.add('active-filter');
        }
        filterBtn.classList.add('header-filter-btn');
        filterBtn.innerHTML = `
  <i class="material-icons header-filter-icon">filter_list</i>
`;
        filterBtn.style.cursor = 'pointer';
        filterBtn.style.marginLeft = '6px';

        filterBtn.onclick = (event: MouseEvent) => {
          event.stopPropagation();
          const rect = (event.target as HTMLElement).getBoundingClientRect();
          this.openAdvancedFilter(col.field, rect);
        };

        container.appendChild(titleSpan);
        container.appendChild(filterBtn);

        return container;
      },
    }));

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
      columns: enhancedColumns,
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

  filterState: {
    field: string;
    conditions: {
      operator: string;
      value: any;
      logicWithNext?: 'AND' | 'OR';
    }[];
  } | null = null;

  showFilterPopup = false;

  popupPosition = { top: 0, left: 0 };

  openAdvancedFilter(field: string, rect: DOMRect) {
    const saved = this.columnFilters.get(field);

    this.filterState = {
      field,
      conditions: saved ? JSON.parse(JSON.stringify(saved.conditions)) : [], // 👈 теперь пусто
    };

    this.activeField = field;

    this.popupPosition = {
      top: rect.bottom + window.scrollY,
      left: rect.left + window.scrollX,
    };

    this.showFilterPopup = true;
  }

  ngOnDestroy(): void {
    this.tabulator?.destroy();
  }

  doSelected() {
    console.log(this.tabulator?.getSelectedRows());
  }

  addCondition() {
    if (!this.filterState) return;
    console.log(this.filterState)

    this.filterState.conditions.push({
      operator: '=',
      value: '',
      logicWithNext: 'AND',
    });
  }

  removeCondition(index: number) {
    this.filterState?.conditions.splice(index, 1);
  }


  applyFilter() {
  if (!this.tabulator || !this.filterState) return;

  const { field, conditions } = this.filterState;

  const valid = conditions.filter(
    c => c.value !== '' && c.value !== null
  );

  if (!valid.length) {
    this.tabulator.clearFilter(true);
    this.columnFilters.delete(field);
    this.activeFilters.delete(field);
    this.showFilterPopup = false;
    return;
  }

  this.tabulator.setFilter((data: any) => {

    let result = true;

    for (let i = 0; i < valid.length; i++) {
      const c = valid[i];

      const fieldValue = data[field];
      const compareValue = c.value;

      let conditionResult = false;

      switch (c.operator) {
        case '=':
          conditionResult = fieldValue == compareValue;
          break;
        case '!=':
          conditionResult = fieldValue != compareValue;
          break;
        case '>':
          conditionResult = fieldValue > compareValue;
          break;
        case '>=':
          conditionResult = fieldValue >= compareValue;
          break;
        case '<':
          conditionResult = fieldValue < compareValue;
          break;
        case '<=':
          conditionResult = fieldValue <= compareValue;
          break;
        case 'like':
          conditionResult = String(fieldValue)
            .toLowerCase()
            .includes(String(compareValue).toLowerCase());
          break;
      }

      if (i === 0) {
        result = conditionResult;
      } else {
        const prev = valid[i - 1];

        if (prev.logicWithNext === 'AND') {
          result = result && conditionResult;
        } else {
          result = result || conditionResult;
        }
      }
    }

    return result;
  });

  this.columnFilters.set(field, {
    conditions: structuredClone(conditions)
  });

  this.activeFilters.add(field);
  this.showFilterPopup = false;
}

  clearFilter() {
    if (!this.tabulator) return;

    this.tabulator.clearFilter(true);
    this.columnFilters.clear();
    this.activeFilters.clear();
    this.showFilterPopup = false;
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
