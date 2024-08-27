import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
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
import { EventOperationsService } from '../services/event-operations.service';
import { format } from 'date-fns';



interface LocationNode {
  name: string;
  children?: LocationNode[];
}

// Example appointment structure expected by the calendar
export interface CalendarEvent {
  id: string | number,
  title: string,
  start: Date | string,
  end: Date | string,
  color?: string,
  textColor?: string
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
  selectedColor: string = '#2e78d6'; // Default color
  bookedAppointments: any[] = [];
  colorOptions: string[] = [
    'blue', // Blue
    'green', // Green
    'yellow', // Yellow
    'red', // Red
    'gray'  // Gray
  ];
  events: any = [];

  constructor(private locationService: LocationService,
    private cdr: ChangeDetectorRef,
    private toastr: ToastrService, private EventOps: EventOperationsService) { }

  config: DayPilot.CalendarConfig = {
    viewType: "Resources",
    cellHeight: 40,
    onBeforeCellRender: (args) => {
      this.customizeCell(args);
    },
    onTimeRangeSelected: async args => {
      // Find the provider associated with the selected cell
      const provider = this.Providers.find(p => p.id === args.resource);

      if (!provider) {
        this.toastr.error("No provider associated with this slot.");
        return;
      }

      // Convert cell start and end times to DayPilot.Date objects
      const cellStartTime = new DayPilot.Date(args.start);
      const cellEndTime = new DayPilot.Date(args.end);

      // Helper function to convert time string to minutes since midnight
      const timeToMinutes = (timeStr: string) => {
        const [hours, minutes] = timeStr.split(':').map(Number);
        return hours * 60 + minutes;
      };

      // Extract time components from provider's availability times
      const providerStartMinutes = timeToMinutes(provider.startTime);
      const providerEndMinutes = timeToMinutes(provider.endTime);

      // Extract time components from cell's start and end times
      const cellStartMinutes = timeToMinutes(cellStartTime.toString().substring(11, 16));
      const cellEndMinutes = timeToMinutes(cellEndTime.toString().substring(11, 16));

      // Check if the selected time range is within the provider's availability
      if (cellStartMinutes >= providerStartMinutes && cellEndMinutes <= providerEndMinutes) {
        // Prompt the user to enter event details
        const modal = await DayPilot.Modal.prompt("Create a new event:", "Event 1");

        if (modal.canceled) {
          return;
        }
        // Prepare the event data to be sent to the backend
        const eventData = {
          start: args.start.toString(),
          end: args.end.toString(),
          id: DayPilot.guid(),
          text: modal.result,
          resource: args.resource,
          barColor: this.selectedColor,
          EventDate: this.selectedDate
        };

        const FormatedEventData = {
          StartTime: eventData['start'],
          EndTime: eventData['end'],
          EventId: eventData.id,
          EventName: modal.result,
          ProviderId: args.resource,
          BarColor: this.selectedColor,
          EventDate: this.selectedDate
        };

        console.log(" created EventId", FormatedEventData);

        // Add the new event to the calendar
        this.calendar.control.events.add(eventData);

        // Send the new event to the backend
        this.EventOps.CreateEvent(FormatedEventData).subscribe({
          next: (res: any) => {
            this.toastr.success("Event created successfully.");
          },
          error: (err) => {
            console.error("Error:", err);
            this.toastr.error("Failed to create event.");
          }
        });
      } else {
        // Show an error message if the time range is outside of availability
        this.toastr.error("Selected time range is outside of provider's availability.");
      }
    },

    onEventClick: async args => {
      await this.onEventClick(args); // Call the  async function
    },
    eventMoveHandling: "Disabled",
    eventResizeHandling: "Disabled",
    contextMenu: new DayPilot.Menu({
      items: [
        // {
        //   text: "Edit...",
        //   onClick: async args => {
        //     // Retrieve the event data
        //     const data = args.source.data;

        //     // Open a modal to edit the event text
        //     const modal = await DayPilot.Modal.prompt("Edit event text:", data.text);

        //     // If the modal was canceled, exit the function
        //     if (modal.canceled) {
        //       return;
        //     }

        //     // Update the event's text with the new value from the modal
        //     data.text = modal.result;

        //     // Update the event in the calendar (this automatically reflects changes like text and color)
        //     this.calendar.control.events.update(data);
        //   }
        // },
        {
          text: "Delete",
          onClick: args => {
            // Confirm before deleting the event
            if (confirm("Are you sure you want to delete this event?")) {

              // Send delete request to the backend
              this.EventOps.DeleteEvent(args.source.data.id).subscribe({
                next: (res) => {
                  // Remove the event from the calendar
                  this.calendar.control.events.remove(args.source.data.id);
                  this.toastr.success("Event deleted successfully.");
                },
                error: (err) => {
                  this.toastr.error("Failed to delete event.");
                }
              })
            }
          }
        }
      ]
    }),

    columns: []
  };

  customizeCell(args: any) {
    const provider = this.Providers.find(p => p.id === args.cell.resource);

    // Convert cell start date to JavaScript Date object
    const cellDate = new Date(args.cell.start);

    // Get current date
    const currentDate = new Date();

    // Set the time to the start of the day for comparison
    currentDate.setHours(0, 0, 0, 0);

    if (cellDate < currentDate) {
      // Disable cell if it's a past date
      args.cell.properties.backColor = "#E8E8E8"; // Light grey for past dates
      args.cell.properties.disabled = true; // Optionally disable the cell
    } else {
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
  }

  // Update Event 
  async onEventClick(args: any) {
    // Convert color options to ModalFormOption[] with 'id', 'value', and 'text'
    const colorOptions: { id: string; value: string; text: string }[] = this.colorOptions.map(color => ({
      id: color, // id can be the same as value in this case
      value: color,
      text: color
    }));
    // Find the provider associated with the event's resource
    const provider = this.Providers.find(p => p.id === args.e.data.resource);

    if (!provider) {
      this.toastr.error("No provider associated with this slot.");
      return;
    }

    const form: DayPilot.ModalFormItem[] = [
      { name: "Text", id: "text", type: "text" }, // Event name
      { name: "Date", id: "date", type: "date" }, // Date for the event
      { name: "Start Time", id: "start", type: "datetime", dateFormat: "HH:mm:ss" }, // Start time
      { name: "End Time", id: "end", type: "datetime", dateFormat: "HH:mm:ss" }, // End time
      { name: "Color", id: "backColor", type: "select", options: colorOptions } // Color
    ];

    const data = args.e.data;

    const modal = await DayPilot.Modal.form(form, data);

    if (modal.canceled) {
      return;
    }

    // Parse selected times
    const selectedStartTime = new DayPilot.Date(modal.result.start);
    const selectedEndTime = new DayPilot.Date(modal.result.end);

    // Helper function to convert time string to minutes since midnight
    const timeToMinutes = (timeStr: string) => {
      const [hours, minutes] = timeStr.split(':').map(Number);
      return hours * 60 + minutes;
    };

    // Extract time components from provider's availability times
    const providerStartMinutes = timeToMinutes(provider.startTime);
    const providerEndMinutes = timeToMinutes(provider.endTime);

    // Extract time components from selected event times
    const selectedStartMinutes = timeToMinutes(selectedStartTime.toString().substring(11, 16));
    const selectedEndMinutes = timeToMinutes(selectedEndTime.toString().substring(11, 16));

    // Check if the selected time range is within the provider's availability
    if (selectedStartMinutes < providerStartMinutes || selectedEndMinutes > providerEndMinutes) {
      this.toastr.error("Selected time is outside of provider's availability.");
      return;
    }

    const selectedColor = modal.result.backColor || 'defaultColor';
    // Prepare the updated event data
    const updatedEventData = {
      id: args.e.data.id,
      start: selectedStartTime,
      end: selectedEndTime,
      text: modal.result.text,
      resource: args.e.data.resource,
      barColor: selectedColor
    };
    console.log(" updated EventId", updatedEventData.id);
    const SelectedDatestr = modal.result.date; // Selected date from Model
    const SelectedDate = new Date(SelectedDatestr);

    const FormatedUpdatedEventData = {
      StartTime: updatedEventData['start'].toString(),
      EndTime: updatedEventData['end'].toString(),
      EventId: updatedEventData.id,
      EventName: updatedEventData.text,
      ProviderId: updatedEventData.resource,
      BarColor: updatedEventData.barColor,
      EventDate: SelectedDate
    };

    // Send the updated event to the backend
    this.EventOps.UpdatEvent(FormatedUpdatedEventData).subscribe({
      next: (res) => {
        this.toastr.success("Event updated successfully.");
        // Update the event in the calendar
        this.calendar.control.events.update(updatedEventData);

      },
      error: (err) => {
        console.log("err", err);
        this.toastr.error("Failed to update event.");
      }
    });
  }

  ngOnInit(): void {
    this.selectedDate = new Date(); // Set default date to today
    this.selectedDayOfWeek = this.getDayOfWeek(this.selectedDate); // Get day of week from the date
    this.GetLocations(); // Fetch locations and handle the first location being checked
    this.ProvidersInToggle();
  }

  getDayOfWeek(date: Date): string {
    const options: Intl.DateTimeFormatOptions = { weekday: 'long' };
    return new Intl.DateTimeFormat('en-US', options).format(date);
  }

  //Providers fetch on Date change 
  onDateChange(event: Date) {
    this.selectedDate = event;
    this.selectedDayOfWeek = this.getDayOfWeek(this.selectedDate);
    if (this.selectedDayOfWeek) {
      this.fetchProviders();
    }
    this.ProvidersInToggle();

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

          this.fetchedAppointmetns();

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

  // Providers in toggle
  ProvidersByLocationIntoggel: any[] = [];
  formatedProvidersInToggle: { [key: number]: any[] } = {};
  ProvidersInToggle() {
    this.locationService.providerLocationInToggle(this.selectedDayOfWeek).subscribe({
      next: (res) => {
        // Clear the previous data to avoid showing outdated providers
        this.formatedProvidersInToggle = {};
        this.ProvidersByLocationIntoggel = res;
        // Create a map where each key is a LocationId and the value is a list of providers
        this.ProvidersByLocationIntoggel.forEach(provider => {
          if (!this.formatedProvidersInToggle[provider.LocationId]) {
            this.formatedProvidersInToggle[provider.LocationId] = [];
          }
          this.formatedProvidersInToggle[provider.LocationId].push(provider);
        });

        console.log('Formatted Providers by Location:', this.formatedProvidersInToggle);
        this.toastr.success("Providers Fetched in toggle");
        this.UniqueProvidersToggel();
      },
      error: (err) => {
        this.toastr.error("Error in toggle");
      }
    });
  }


  uniqueProviders: any[] = [];
  LocationOfProvider: { [key: number]: any[] } = []
  UniqueProvidersToggel() {
    this.LocationOfProvider = {};
    const providerIds = new Set();
    this.uniqueProviders = this.ProvidersByLocationIntoggel.filter(provider => {
      if (!providerIds.has(provider.ProviderId)) {
        providerIds.add(provider.ProviderId);

        // Check if ProviderId exists in ProvidersWithLocation, if not, initialize it with an empty array
        if (!this.LocationOfProvider[provider.ProviderId]) {
          this.LocationOfProvider[provider.ProviderId] = [];
        }
        this.LocationOfProvider[provider.ProviderId].push(provider);

        return true;
      }
      return false;
    });
  }

  fetchedAppointmetns() {
    const selectedLocations = this.getCheckedLocationIds();
    if (this.selectedDate) {
      const selectedDate = this.selectedDate.toLocaleDateString('en-CA'); // 'en-CA' will give 'YYYY-MM-DD' format
      this.locationService.BookedAppointments(selectedDate, selectedLocations).subscribe({
        next: (res) => {
          this.bookedAppointments = res;
          console.log("bookedAppointments:", this.bookedAppointments);
          // Use map to create a new array of event objects
          const events = this.bookedAppointments.map(appointment => ({
            start: appointment.AppointmentStartTime,
            end: appointment.AppointmentEndTime,
            id: appointment.AppointmentId.toString(),
            resource:appointment.ProviderId,
            text: appointment.AppointmentName,
            barColor: '#ff0000',
            textColor: '#ffffff',
          }));
          this.events = events;
          this.calendar.control.events.update(this.events);
          // this.calendar.control.update({ events });
          this.cdr.detectChanges();
          console.log("this.events:", this.events);
          console.log("this.calendar:", this.calendar);
          this.toastr.success("Fetched appointments");
        },
        error: (err) => {
          this.toastr.error("Error fetching appointments");

        }
      });
    } else {
      this.toastr.error("Selected date is invalid.");
    }
  }
  configNavigator: DayPilot.NavigatorConfig = {
    showMonths: 3,
    cellWidth: 25,
    cellHeight: 25,
    onVisibleRangeChanged: args => {
      // this.loadEvents();
    }
  };


configWeek: DayPilot.CalendarConfig = {
  viewType: "Week",
  cellHeight: 40,
  onEventClick: async args => {
    await this.onEventClick(args); // Call the  async function
  },
  contextMenu: new DayPilot.Menu({
    items: [
      {
        text: "Edit...",
        onClick: async args => {
          // Retrieve the event data
          const data = args.source.data;
          const modal = await DayPilot.Modal.prompt("Edit event text:", data.text);
          if (modal.canceled) {
            return;
          }
          data.text = modal.result;

          // Update the event in the calendar (this automatically reflects changes like text and color)
          // this.calendar.control.events.update(data);
        }
      },
      {
        text: "Delete",
        onClick: args => {
          // Confirm before deleting the event
          if (confirm("Are you sure you want to delete this event?")) {

            // Send delete request to the backend
            this.EventOps.DeleteEvent(args.source.data.id).subscribe({
              next: (res) => {
                // Remove the event from the calendar
                this.calendar.control.events.remove(args.source.data.id);
                this.toastr.success("Event deleted successfully.");
              },
              error: (err) => {
                this.toastr.error("Failed to delete event.");
              }
            })
          }
        }
      }
    ]
  }),

  // columns: []
};

viewDay():void {
  this.configNavigator.selectMode = "Day";
  this.config.visible = true;
  this.configWeek.visible = false;

}

viewWeek():void {
  this.configNavigator.selectMode = "Week";
  this.config.visible = false;
  this.configWeek.visible = true;

}



changeDate(offset: number) {
  if (!this.selectedDate) {
    console.warn('Selected date is not defined.');
    return;
  }

  const newDate = new Date(this.selectedDate);
  newDate.setDate(newDate.getDate() + offset);
  this.selectedDate = newDate;
}




}
