import { Routes } from '@angular/router';

export const routes: Routes = [
    {path:'cldr', loadChildren: ()  => import ('./scheduler/scheduler.module').then(a => a.SchedulerModule)}];
