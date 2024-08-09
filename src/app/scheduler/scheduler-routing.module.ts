import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DayCalendarComponent } from './day-calendar/day-calendar.component';

const routes: Routes = [
  {path:'', component:DayCalendarComponent}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SchedulerRoutingModule { }
