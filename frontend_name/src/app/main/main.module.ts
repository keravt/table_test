import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InitComponent } from './pages/init/init.component';
import { MainRoutingModule } from './main-routing.module';
import { MaterialImportsModule } from '../material-imports/material-imports.module';

import * as XLSX from 'xlsx';
(window as any).XLSX = XLSX;

@NgModule({
  declarations: [],
  imports: [CommonModule, MainRoutingModule, MaterialImportsModule],
})
export class MainModule {}
