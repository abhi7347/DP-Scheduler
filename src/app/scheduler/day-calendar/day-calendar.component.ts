import { Component, OnInit, ViewChild } from '@angular/core';
import { DayPilot, DayPilotCalendarComponent, DayPilotModule } from '@daypilot/daypilot-lite-angular';
import { MatCardModule } from '@angular/material/card';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { CommonModule } from '@angular/common';
import { MatNativeDateModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NestedTreeControl } from '@angular/cdk/tree';
import { MatTreeModule, MatTreeNestedDataSource } from '@angular/material/tree';
import { MatCheckboxChange, MatCheckboxModule } from '@angular/material/checkbox';

interface LocationNode {
  name: string;
  children?: LocationNode[];
}

@Component({
  selector: 'app-day-calendar',
  standalone: true,
  imports: [
    CommonModule, DayPilotModule, MatDatepickerModule, MatNativeDateModule,
    MatFormFieldModule, MatInputModule, FormsModule, ReactiveFormsModule,
    MatTreeModule, MatCheckboxModule
  ],
  templateUrl: './day-calendar.component.html',
  styleUrls: ['./day-calendar.component.css'] // Fixed styleUrl to styleUrls
})
export class DayCalendarComponent implements OnInit {
  @ViewChild("calendar") calendar!: DayPilotCalendarComponent;
  resources: any[] = [
    { id: '1', name: 'Dr. Smith' },
    { id: '2', name: 'Dr. Jones' },
    { id: '3', name: 'Dr. Abhishek' },
    { id: '4', name: 'Dr. Gitesh' },
    { id: '5', name: 'Dr. Pandit' },
    // Add more doctors here or fetch from a service
  ];

  events: any[] = [
    { id: '1', text: 'Event 1', start: '2024-08-08T10:00:00', end: '2024-08-08T12:00:00' },
    { id: '2', text: 'Event 2', start: '2024-08-08T12:00:00', end: '2024-08-08T14:00:00' }
  ];

  config: DayPilot.CalendarConfig = {
    viewType: "Resources",
    cellHeight: 40,
  };

  selectedDate: Date | null = null;

  ngOnInit(): void {
    this.config.events = this.events; 
    this.config.columns=this.resources;
  }

  // Method to handle checkbox change
  onParentCheckboxChange(event: Event) {
    const target = event.target as HTMLInputElement;
    const isChecked = target.checked;

    // Get the parent <li> element
    const parentLi = target.closest('li');
    if (parentLi) {
      const childCheckboxes = Array.from(parentLi.querySelectorAll('ul > li > input[type="checkbox"]')) as HTMLInputElement[];
      childCheckboxes.forEach((checkbox: HTMLInputElement) => {
        checkbox.checked = isChecked;
      });
    }
  }

   // Method to toggle children visibility
   toggleChildren(event: Event) {
    const button = event.target as HTMLButtonElement;
    const parentLi = button.closest('li');
    if (parentLi) {
      const childrenUl = parentLi.querySelector('ul');
      if (childrenUl) {
        childrenUl.classList.toggle('hidden');
        button.textContent = childrenUl.classList.contains('hidden') ? '>' : 'v';
      }
    }
  }

  providers: string[] = ['Provider 1', 'Provider 2', 'Provider 3','Provider 4', 'Provider 5', 'Provider 6']; 

}