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
  ProvidersGroupedByLocation:   any[]  = [];
  selectedColor: string = '#2e78d6'; // Default color

  colorOptions: string[] = [
    '#2e78d6', // Blue
    '#6aa84f', // Green
    '#f1c232', // Yellow
    '#cc4125', // Red
    '#808080'  // Gray
  ];

  constructor(private locationService: LocationService, private toastr: ToastrService) { }

  events: any[] = [
    { id: '1', text: 'Event 1', start: '2024-08-08T10:00:00', end: '2024-08-08T12:00:00' },
    { id: '2', text: 'Event 2', start: '2024-08-08T12:00:00', end: '2024-08-08T14:00:00' }
  ];

  config: DayPilot.CalendarConfig = {
    viewType: "Resources",
    cellHeight: 40,
    // columns: this.Providers,
    onBeforeCellRender: (args) => {
      this.customizeCell(args);
        
    },
    contextMenu: new DayPilot.Menu({
      items: [
        {
          text: "Edit...",
          onClick: async args => {
            const data = args.source.data;
            const modal = await DayPilot.Modal.prompt("Edit event text:", data.text);

            if (modal.canceled) {
              return;
            }

            data.text = modal.result;
            this.updateEventColor(data);
            this.calendar.control.events.update(data);
          }
        },
        {
          text: "Delete",
          onClick: args => {
            this.calendar.control.events.remove(args.source);
          }
        }
      ]
    }),
    onTimeRangeSelected: async args => {
      // Find the provider associated with the selected cell
      const provider = this.Providers.find(p => p.id === args.resource);
    
      if (!provider) {
        this.toastr.error("No provider associated with this slot.");
        return;
      }
    
      const cellStartTime = new Date(`1970-01-01T${args.start.toString().substring(11, 19)}`);
      const cellEndTime = new Date(`1970-01-01T${args.end.toString().substring(11, 19)}`);
      const providerStartTime = new Date(`1970-01-01T${provider.startTime}`);
      const providerEndTime = new Date(`1970-01-01T${provider.endTime}`);
    
      // Check if the selected time range is within the provider's availability
      if (cellStartTime >= providerStartTime && cellEndTime <= providerEndTime) {
        // Prompt the user to enter event details
        const modal = await DayPilot.Modal.prompt("Create a new event:", "Event 1");
    
        if (modal.canceled) {
          return;
        }
    
        // Add the new event to the calendar
        this.calendar.control.events.add({
          start: args.start,
          end: args.end,
          id: DayPilot.guid(),
          text: modal.result,
          resource: args.resource,
          barColor: this.selectedColor
        });
      } else {
        // Show an error message if the time range is outside of availability
        this.toastr.error("Selected time range is outside of provider's availability.");
      }
    }
    ,
    onEventClick: async args => {
      await this.onEventClick(args); // Call the async function
    },
    columns: []
  };

  customizeCell(args:any){
    const provider = this.Providers.find(p => p.id === args.cell.resource);
        if (provider) {
          const cellStartTime = new Date(`1970-01-01T${args.cell.start.toString().substring(11, 19)}`);
          const providerStartTime = new Date(`1970-01-01T${provider.startTime}`);
          const providerEndTime = new Date(`1970-01-01T${provider.endTime}`);
  
          // Check if the cell's start time is within the provider's availability range
          if (cellStartTime >= providerStartTime && cellStartTime < providerEndTime) {
              args.cell.properties.backColor = "#ffffff"; // Light green for available time slots
          } else {
              args.cell.properties.backColor = "#E8E8E8"; // Light grey for unavailable time slots
              args.cell.properties.disabled = true; // Optionally disable the cell
          }
      } else {
          args.cell.properties.backColor = "#E8E8E8"; // Default white background for cells without a provider
          args.cell.properties.disabled = true; // Optionally disable the cell
      }
  }


  

  ngOnInit(): void {
    this.selectedDate = new Date(); // Set default date to today
    this.selectedDayOfWeek = this.getDayOfWeek(this.selectedDate); // Get day of week from the date
    this.GetLocations(); // Fetch locations and handle the first location being checked
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

    this.fetchProviders(); // Fetch providers whenever a parent checkbox is changed
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
      next: (res) => {
        this.Locations = res;

        // Automatically check the first location
        if (this.Locations.length > 0) {
          this.Locations[0].checked = true;
          this.fetchProviders(); // Fetch providers for the default selected day and location
        }

        console.log(this.Locations);
        this.toastr.success("Locations fetched Successfully!");
      },
      error: (err) => {
        this.toastr.error("Error fetching locations!");
      }
    });
  }

  fetchProviders(): void {
    const selectedLocations = this.getCheckedLocationIds();

    // Fetch providers only for checked locations
    if (selectedLocations.length > 0 && this.selectedDayOfWeek) {
      this.locationService.ProvidersByLocations(this.selectedDayOfWeek, selectedLocations).subscribe({
        next: (data: any[]) => {
          console.log('Providers for checked locations:', data);
          this.Providers = data.map(provider => ({
            id: provider.ProviderId,
            name: `${provider.FirstName} ${provider.LastName}`, // Display name as 'First Last'
            startTime: provider.StartTime,
            endTime: provider.EndTime

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
    } else {
      // Optionally clear the resources or handle the case of no locations selected
      this.Providers = [];
      this.config.columns = this.Providers;
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

// ///////////////////////////////////////////////

async onEventClick(args: any) {
  // Convert color options to ModalFormOption[] with 'id', 'value', and 'text'
  const colorOptions: { id: string; value: string; text: string }[] = this.colorOptions.map(color => ({
    id: color, // id can be the same as value in this case
    value: color,
    text: color
  }));

  const form: DayPilot.ModalFormItem[] = [
    { name: "Text", id: "text" },
    { name: "Start", id: "start", dateFormat: "MM/dd/yyyy", type: "datetime" },
    { name: "End", id: "end", dateFormat: "MM/dd/yyyy", type: "datetime" },
    { name: "Color", id: "backColor", type: "select", options: colorOptions }
  ];

  const data = args.e.data;

  const modal = await DayPilot.Modal.form(form, data);

  if (modal.canceled) {
    return;
  }

  const dp = args.control;

  dp.events.update(modal.result);
}

updateEventColor(event: any) {
  event.barColor = this.selectedColor;
}

}