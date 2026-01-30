import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@environments/environment.prod';

export interface Announcement {
    id?: string;
    title: string;
    content: string;
    category: string;
    priority: string;
    createdAt?: string;
    createdByUserId?: string;
    createdByFirstName?: string;
    createdByLastName?: string;
    views?: number;
}

@Injectable({
    providedIn: 'root'
})
export class AnnouncementsService {
    private readonly API_URL = `${environment.apiUrl}/Announcements`;

    constructor(private http: HttpClient) {}

    getAll(page: number = 1, pageSize: number = 10): Observable<any> {
        return this.http.get(`${this.API_URL}?page=${page}&pageSize=${pageSize}`);
    }

    getById(id: string): Observable<Announcement> {
        return this.http.get<Announcement>(`${this.API_URL}/${id}`);
    }

    create(announcement: Partial<Announcement>): Observable<Announcement> {
        return this.http.post<Announcement>(this.API_URL, announcement);
    }

    update(id: string, announcement: Partial<Announcement>): Observable<Announcement> {
        return this.http.put<Announcement>(`${this.API_URL}/${id}`, announcement);
    }

    delete(id: string): Observable<any> {
        return this.http.delete(`${this.API_URL}/${id}`);
    }
}
