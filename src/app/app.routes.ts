import { Routes } from '@angular/router';

export const routes: Routes = [
    {path:'', redirectTo:'cldr/day',  pathMatch:'full'},
    {path:'cldr', loadChildren: ()  => import ('./scheduler/scheduler.module').then(a => a.SchedulerModule)}];
