import { HttpClient } from '@angular/common/http';
import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { lastValueFrom, Observable } from 'rxjs';
import { projectListUrl } from 'src/environments/environment';
import {
  RevoGrid,
  ColumnRegular,
  ColumnFilterConfig,
  HyperFunc,
  VNode,
  CellTemplateProp,
} from '@revolist/angular-datagrid';
import { AsyncPipe, NgIf } from '@angular/common';
import SelectTypePlugin from '@revolist/revogrid-column-select';
import { MatTabsModule } from '@angular/material/tabs';
import { TabulatorTableComponent } from '../../components/tabulator-table-component/tabulator-table-component.component';
import { JSpreadsheetTableComponent } from '../../components/jspreadsheet-table/jspreadsheet-table.component';
import NumberColumnType from '@revolist/revogrid-column-numeral';
import { AisTableLibComponent } from 'ais-table-lib';
import { ColumnDefinition } from 'tabulator-tables';
import { DateTime } from 'luxon';

export interface Project {
  uid: string;
  fullName: string;
  archived: boolean;
  manager: string;
  company: string;
  num: number;
  finmanager: string;
  __selected?: boolean;
}

@Component({
  selector: 'app-init',
  templateUrl: './init.component.html',
  styleUrls: ['./init.component.css'],
  standalone: true,
  encapsulation: ViewEncapsulation.None,
  imports: [
    RevoGrid,
    NgIf,
    AsyncPipe,
    MatTabsModule,
    TabulatorTableComponent,
    JSpreadsheetTableComponent,
    AisTableLibComponent,
  ],
})
export class InitComponent implements OnInit {
  projects$!: Observable<Project[]>;
  tasks$!: Observable<any[]>;
  statusList: any[] = [];
  statusOptions: any[] = [];
  kanban_table: ColumnDefinition[] = [];

  constructor(private readonly http: HttpClient) {}
  ngOnInit(): void {
    this.tasks$ = this.fetchUserKanbanTasks();

    this.tasks$.subscribe((data) => {
      this.tasks = data.map((t) => {
        let deadline = null;
        const sv = t.stickersValues.find(
          (sv: any) => sv.sticker.type === 'deadline'
        )?.value;

        if (sv) {
          deadline = Number(sv)
        }

        return {
          ...t,
          deadline,
        };
      });

      this.statusList = this.getUniqueColumns(this.tasks);

      this.statusOptions = this.statusList.map((col) => ({
        label: col.title,
        value: col,
      }));

      this.kanban_table = this.buildKanbanColumns();

      console.log('Statuses:', this.statusOptions);
    });

    this.projects$ = this.getProjects();
    this.projects$.subscribe((data) => {
      // store locally for checkbox logic
      this.projects = data.map((p) => ({ ...p, __selected: false }));
    });
  }
  tabIndex = 0;

  projects: Project[] = [];
  tasks: any[] = [];

  selectedIds = new Set<string>();

  // 0 = unchecked, 1 = indeterminate, 2 = checked
  allSelectedStatus = 0;

  isGroupingOn = false;

  revoGrouping = { props: ['company'] };

  managers = ['Воронов А.Н.', 'Андреев Ю.А.', 'Осипов А.В.', 'Рыскаль В.А.'];
  finManagers = ['Галиева К.В.', 'Шушаева М.М.', 'Файрушина О.А.'];

  managerChoices = {
    labelKey: 'label',
    valueKey: 'value',
    source: [
      { label: 'Воронов А.Н.', value: 'Воронов А.Н.' },
      { label: 'Андреев Ю.А.', value: 'Андреев Ю.А.' },
      { label: 'Осипов А.В.', value: 'Осипов А.В.' },
      { label: 'Рыскаль В.А.', value: 'Рыскаль В.А.' },
    ],
  };

  columnTypes = {
    select: new SelectTypePlugin(),
    numeric: new NumberColumnType('0,0'),
  };

  buildKanbanColumns(): ColumnDefinition[] {
    return [
      {
        title: 'Название',
        field: 'title',
        sorter: 'string',
      },
      {
        title: 'Дедлайн',
        field: 'deadline',
        hozAlign: 'center',
        width: 140,
        editor: dateEditor,
        formatter: function (cell) {
          const value = cell.getValue();
          if (!value) return '';
          return DateTime.fromMillis(value).toFormat('dd/MM/yyyy');
        },
      },
      {
        title: 'Готово',
        field: 'isDone',
        width: 90,
        hozAlign: 'center',

        formatter: 'tickCross',
        formatterParams: {
          allowEmpty: false,
          tickElement: '✔',
          crossElement: '',
        },

        editor: true, // checkbox editor
        headerSort: true,
      },
      {
        title: 'Статус',
        field: 'column', // 👈 full object
        editor: 'list',
        editorParams: {
          values: this.statusOptions,
          itemFormatter: (label: string, value: any) => {
            console.log(label, value);
            return `<span style="
        background:${value.color};
        color:white;
        padding:2px 6px;
        border-radius:6px;
      ">${label}</span>`;
          },
        },

        accessor: (value) => value?.title || '',
        sorter: (a, b) => {
          const aVal = a?.title || '';
          const bVal = b?.title || '';
          return aVal.localeCompare(bVal);
        },
        formatter: (cell) => {
          const column = cell.getValue();

          if (!column) return '';

          const el = document.createElement('div');

          el.innerText = column.title;
          el.style.background = column.color;
          el.style.color = '#fff';
          el.style.padding = '2px 6px';
          el.style.borderRadius = '6px';
          el.style.fontSize = '12px';
          el.style.display = 'inline-block';

          return el;
        },
      },
    ];
  }

  // kanban_table: ColumnDefinition[] = [
  //   {
  //     title: 'Название',
  //     field: 'title',
  //     sorter: 'string',
  //   },
  //   {
  //     title: 'Дедлайн',
  //     field: 'deadline',
  //     hozAlign: 'center',
  //     width: 140,
  //     editor: dateEditor,
  //   },
  //   {
  //     title: 'Готово',
  //     field: 'isDone',
  //     width: 90,
  //     hozAlign: 'center',

  //     formatter: 'tickCross',
  //     formatterParams: {
  //       allowEmpty: false,
  //       tickElement: '✔',
  //       crossElement: '',
  //     },

  //     editor: true, // checkbox editor
  //     headerSort: true,
  //   },
  //   {
  //     title: 'Статус',
  //     field: 'column', // 👈 full object
  //     editor: 'list',
  //     editorParams: {
  //       values: (() => this.statusOptions) as any,
  //       itemFormatter: (label: string, value: any) => {
  //         console.log(label, value);
  //         return `<span style="
  //       background:${value.color};
  //       color:white;
  //       padding:2px 6px;
  //       border-radius:6px;
  //     ">${label}</span>`;
  //       },
  //     },

  //     accessor: (value) => value?.title || '',
  //     sorter: (a, b) => {
  //       const aVal = a?.title || '';
  //       const bVal = b?.title || '';
  //       return aVal.localeCompare(bVal);
  //     },
  //     formatter: (cell) => {
  //       const column = cell.getValue();

  //       if (!column) return '';

  //       const el = document.createElement('div');

  //       el.innerText = column.title;
  //       el.style.background = column.color;
  //       el.style.color = '#fff';
  //       el.style.padding = '2px 6px';
  //       el.style.borderRadius = '6px';
  //       el.style.fontSize = '12px';
  //       el.style.display = 'inline-block';

  //       return el;
  //     },
  //   },
  // ];

  table_def = [
    {
      title: 'Название',
      field: 'fullName',
      sorter: 'string',
      editor: 'input',
      validator: 'required',
    },
    {
      title: 'Номер',
      field: 'num',
      sorter: 'number',
      editor: 'number',
      validator: 'required',
    },
    {
      title: 'Руководитель',
      field: 'manager',
      sorter: 'string',
      editor: 'list',
      editorParams: {
        values: this.managers,
        autocomplete: true,
        listOnEmpty: true,
        clearable: true,
      },
    },
    {
      title: 'Компания',
      field: 'company',
      editor: 'input',
      validator: 'required',
    },
    {
      title: 'Финансовый менеджер',
      field: 'finmanager',
      sorter: 'string',
      editor: 'list',
      editorParams: {
        values: this.finManagers,
        autocomplete: true,
        listOnEmpty: true,
        clearable: true,
      },
    },
    {
      title: 'Архив',
      field: 'archived',
      width: 90,
      hozAlign: 'center',

      formatter: 'tickCross',
      formatterParams: {
        allowEmpty: false,
        tickElement: '✔',
        crossElement: '',
      },

      editor: true, // checkbox editor
      headerSort: true,
    },
  ];

  selectedRows: Project[] = [];

  async updateSelection() {
    const projects = await lastValueFrom(this.projects$);
    this.selectedRows = projects.filter((p) => p['__selected']);
  }

  columns: ColumnRegular[] = [
    {
      prop: '__checkbox__',
      name: '',
      size: 50,
      pin: 'colPinStart',
      sortable: false,

      columnTemplate: (h) => {
        return h('input', {
          type: 'checkbox',
          indeterminate: this.allSelectedStatus === 1,
          checked: this.allSelectedStatus === 2 || undefined,
          onChange: (e: any) => {
            const checked = e.target.checked;
            this.selectAllRows(this.projects, checked);
            // trigger re-render by creating new array reference
            this.projects = [...this.projects];
          },
        });
      },

      // CELL checkbox
      cellTemplate: (h: HyperFunc<VNode>, { model }: CellTemplateProp) => {
        const row = model as Project;

        return h('input', {
          type: 'checkbox',
          checked: row.__selected || undefined,
          onChange: (e: any) => {
            const checked = e.target.checked;
            this.updateSelectedRow(row, checked);
            this.updateSelectAllCheckbox(this.projects);
            this.projects = [...this.projects]; // trigger re-render
          },
        });
      },
    },
    {
      prop: 'fullName',
      name: 'Название',
      sortable: true,
      autoSize: true,
      cellTemplate: (
        createElement: HyperFunc<VNode>,
        props: CellTemplateProp,
        additionalData?: any
      ) => {
        return createElement(
          'span',
          {
            style: {
              color: 'red',
              fontWeight: 700,
            },
          },
          props.model[props.prop]
        );
      },
    },
    {
      prop: 'num',
      name: 'Номер',
      sortable: true,
      autoSize: true,
      columnType: 'numeric',
    },
    {
      ...this.managerChoices,
      prop: 'manager',
      name: 'Руководитель',
      autoSize: true,
      sortable: true,
      editable: true,
      filter: true,
      columnType: 'select',
    },
    { prop: 'company', name: 'Компания', sortable: true, autoSize: true },
    { prop: 'num', name: 'Номер', sortable: true, autoSize: true },
    {
      prop: 'finmanager',
      name: 'Финансовый менеджер',
      sortable: true,
      autoSize: true,
    },
  ];

  getProjects(): Observable<Project[]> {
    return this.http.get<Project[]>(
      `${projectListUrl}/api/project-list/project/all`
    );
  }

  fetchUserKanbanTasks() {
    return this.http.get<any[]>(
      `https://test-kanban-api.k-portal.ru/task/users-tasks`
    );
  }

  onAfterEdit(e: any) {
    console.log('Edited cell:', e);
  }

  validateCell(prop: string, value: any): string | null {
    if (value === null || value === undefined || value === '') {
      return 'Поле обязательно';
    }

    if (prop === 'num' && isNaN(Number(value))) {
      return 'Должно быть числом';
    }

    return null; // valid
  }

  updateSelectedRow(row: Project, checked: boolean) {
    this.projects = this.projects.map((r) =>
      r.uid === row.uid ? { ...r, __selected: checked } : r
    );

    if (checked) {
      this.selectedIds.add(row.uid);
    } else {
      this.selectedIds.delete(row.uid);
    }
  }

  updateSelectAllCheckbox(rows: Project[]) {
    if (!this.selectedIds.size) {
      this.allSelectedStatus = 0;
    } else if (this.selectedIds.size === rows.length) {
      this.allSelectedStatus = 2;
    } else {
      this.allSelectedStatus = 1;
    }
  }

  selectAllRows(rows: Project[], checked: boolean) {
    this.projects = rows.map((r) => {
      const updated = { ...r, __selected: checked };
      if (checked) {
        this.selectedIds.add(r.uid);
      } else {
        this.selectedIds.delete(r.uid);
      }
      return updated;
    });
    this.updateSelectAllCheckbox(this.projects);
  }

  jspreadsheetData(projects: Project[]) {
    return projects.map((p) => [
      false, // checkbox
      p.fullName,
      p.manager,
      p.company,
      p.finmanager,
    ]);
  }

  filterConfig: ColumnFilterConfig = {
    localization: {
      filterNames: {
        none: 'Нет',
        empty: 'Пусто',
        notEmpty: 'Не пусто',
        eq: 'Равно',
        notEq: 'Не равно',
        begins: 'Начинается',
        contains: 'Содержит',
        notContains: 'Не содержит',
        eqN: '=',
        neqN: '!=',
        gt: '>',
        gte: '>=',
        lt: '<',
        lte: '<=',
      },
      captions: {
        save: 'Применить',
        reset: 'Очистить',
        title: 'Фильтр',
        cancel: 'Отменить',
      },
    },
  };

  getUniqueColumns(tasks: any[]) {
    const map = new Map<string, any>();

    tasks.forEach((task) => {
      const col = task.column;

      if (col && !map.has(col.uid)) {
        map.set(col.uid, col);
      }
    });

    return Array.from(map.values());
  }
}

export const RU_MESSAGES = {
  filter: {
    contains: 'Содержит',
    notContains: 'Не содержит',
    equals: 'Равно',
    notEquals: 'Не равно',
    startsWith: 'Начинается с',
    endsWith: 'Заканчивается на',
    greaterThan: 'Больше',
    greaterThanOrEqual: 'Больше или равно',
    lessThan: 'Меньше',
    lessThanOrEqual: 'Меньше или равно',
    blank: 'Пусто',
    notBlank: 'Не пусто',
    selectAll: 'Выбрать всё',
    clear: 'Очистить',
    cancel: 'Отмена',
    apply: 'Применить',
  },
  common: {
    ok: 'ОК',
    cancel: 'Отмена',
    reset: 'Сбросить',
  },
};

var dateEditor = function (cell: any, onRendered: any, success: any, cancel: any) {
  let value = cell.getValue(); // can be null
  let cellValue: string;

  if (value) {
    // parse string date to Luxon or timestamp
    const dt = typeof value === 'number'
      ? DateTime.fromMillis(value)
      : DateTime.fromFormat(value, 'dd/MM/yyyy');

    cellValue = dt.isValid ? dt.toFormat('yyyy-MM-dd') : '';
  } else {
    cellValue = ''; // empty for null
  }

  const input = document.createElement('input');
  input.setAttribute('type', 'date');
  input.style.padding = '4px';
  input.style.width = '100%';
  input.style.boxSizing = 'border-box';
  input.value = cellValue;

  onRendered(() => {
    input.focus();
    input.style.height = '100%';
  });

  function onChange() {
    if (input.value) {
      // convert back to milliseconds or whatever format you store
      const newValue = DateTime.fromFormat(input.value, 'yyyy-MM-dd');
      if (newValue.isValid) {
        success(newValue.toMillis()); // store as timestamp
      } else {
        cancel();
      }
    } else {
      success(null); // allow clearing the date
    }
  }

  input.addEventListener('blur', onChange);

  input.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') onChange();
    if (e.key === 'Escape') cancel();
  });

  return input;
};
