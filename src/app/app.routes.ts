import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { TableComponent } from './table/table.component';

export const routes: Routes = [

    { path: '', component: HomeComponent },
    { path: 'table', component: TableComponent }
];
