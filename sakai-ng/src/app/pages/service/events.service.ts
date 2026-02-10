import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@environments/environment.prod';

export interface CalendarEvent {
    id?: string;
    calendarUrl: string;
    title?: string;
    createdAt?: string;
    createdByUserId?: string;
    createdByFirstName?: string;
    createdByLastName?: string;
}

@Injectable({
    providedIn: 'root'
})
export class EventsService {
    private readonly API_URL = `${environment.apiUrl}/Events`;

    constructor(private http: HttpClient) {}

    get(): Observable<CalendarEvent | null> {
        return this.http.get<CalendarEvent | null>(this.API_URL);
    }

    create(calendarEvent: Partial<CalendarEvent>): Observable<CalendarEvent> {
        return this.http.post<CalendarEvent>(this.API_URL, calendarEvent);
    }

    update(id: string, calendarEvent: Partial<CalendarEvent>): Observable<CalendarEvent> {
        return this.http.put<CalendarEvent>(`${this.API_URL}/${id}`, calendarEvent);
    }

    delete(id: string): Observable<any> {
        return this.http.delete(`${this.API_URL}/${id}`);
    }
}
