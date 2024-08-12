import { Component, OnInit, ViewChild } from '@angular/core';
import { DayPilot, DayPilotCalendarComponent, DayPilotModule } from '@daypilot/daypilot-lite-angular';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { CommonModule } from '@angular/common';
import { MatNativeDateModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatTreeModule } from '@angular/material/tree';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { LocationService } from '../services/location.service';
import { ToastrService } from 'ngx-toastr';


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
  Locations: any[] = []
  Providers: any[] = []
  selectedDate: Date | null = null;
  selectedDayOfWeek: string = '';



  constructor(private locationService: LocationService, private toastr:ToastrService) { }

  events: any[] = [
    { id: '1', text: 'Event 1', start: '2024-08-08T10:00:00', end: '2024-08-08T12:00:00' },
    { id: '2', text: 'Event 2', start: '2024-08-08T12:00:00', end: '2024-08-08T14:00:00' }
  ];

  config: DayPilot.CalendarConfig = {
    viewType: "Resources",
    cellHeight: 40,
    columns: this.Providers
  };


  ngOnInit(): void {
    this.config.events = this.events; 
    this.selectedDate = new Date(); // Set default date to today
    this.selectedDayOfWeek = this.getDayOfWeek(this.selectedDate); // Get day of week from the date
    this.GetLocations();
    alert(this.selectedDayOfWeek);
  }

  getDayOfWeek(date: Date): string {
    const options: Intl.DateTimeFormatOptions = { weekday: 'long' };
    return new Intl.DateTimeFormat('en-US', options).format(date);
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
    this.fetchProviders();
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

  GetLocations(): void {
    this.locationService.GetLocations().subscribe({
      next:(res)=>{
        this.Locations = res
        // Automatically check the first location
        if (this.Locations.length > 0) {
          this.Locations[0].checked = true;
          this.fetchProviders(); // Fetch providers with default settings
        }
        console.log(this.Locations);
        this.toastr.success("Locations fetched Successfully!");
      },
      error:(err) =>{
        this.toastr.error("locations error!");
      }
    })
  }


  fetchProviders(): void {
    if (this.selectedDayOfWeek) {
      const selectedLocations = this.getCheckedLocationIds();
      this.locationService.ProvidersByLocations(this.selectedDayOfWeek, selectedLocations).subscribe({
        next: (data: any[]) => {
          console.log('Providers:', data);
          this.Providers = data;
          this.Providers = data.map(provider => ({
            id: provider.ProviderId.toString(), // Ensure ID is a string
            name: `${provider.FirstName} ${provider.LastName}` // Display name as 'First Last'
          }));
          // Update DayPilot calendar configuration
          this.config.columns = this.Providers;
          // Optionally refresh the calendar view
          if (this.calendar) {
            this.calendar.control.update();          
          }
        },
        error: (error) => {
          console.error('Error fetching providers:', error);
        }
      });
    }
    else {
      // Optionally clear the resources or handle the case of no locations selected
      this.Providers = [];
      if (this.calendar) {
        this.calendar.control.update(); // Refresh the calendar to reflect changes
      }
    }
  }

   getCheckedLocationIds(): number[] {
    const checkedLocationIds: number[] = [];
    this.Locations.forEach(location => {
      if (location.checked) {
        checkedLocationIds.push(location.LocationId);
      }
    });
    return checkedLocationIds;
  }

}