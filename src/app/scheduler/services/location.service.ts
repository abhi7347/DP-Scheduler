import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {ProvidersByLocation, locationAPIURL} from '../../../Environvent/ApiURL' 
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LocationService {
  private apiUrl = locationAPIURL.apiUrl;
  private ProvidersURL = ProvidersByLocation.apiUrl

  constructor(private http: HttpClient ) { }

  // Get Locations 
  GetLocations():Observable<any>{
    return this.http.get<any>(this.apiUrl);
  }

  // Providers By Locations
  ProvidersByLocations(dayOfWeek: any, locationIds: number[]):Observable<any>{
    let params = new HttpParams().set('dayOfWeek', dayOfWeek);
    // Append each locationId to the params
    locationIds.forEach(id => {
      params = params.append('locationIds', id.toString());
    });    
    return this.http.get<any>(this.ProvidersURL, { params });
  }
}
