import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CreateEvent, DeleteEvent, UpdateEvent } from '../../../Environvent/ApiURL';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EventOperationsService {
  private createEvent = CreateEvent.apiUrl; 
  private UpdateEvent = UpdateEvent.apiUrl;
  private DelelteEvent = DeleteEvent.apiUrl;

  constructor(private http: HttpClient) { }

  CreateEvent(eventData: any):Observable<any>{
    return this.http.post<any>(this.createEvent, eventData);
  }

  UpdatEvent(eventData: any):Observable<any>{
    return this.http.put<any>(this.UpdateEvent, eventData);
  }

  DeleteEvent(eventId: string):Observable<any>{
    return this.http.delete<any>(`${this.DelelteEvent}/${eventId}`);
  }
}
