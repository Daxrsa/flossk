import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '@environments/environment.prod';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class ProjectsService {
    private readonly API_URL = `${environment.apiUrl}/Projects`;

    constructor(private http: HttpClient) {}

    getProjects(status?: 'Upcoming' | 'InProgress' | 'Completed'): Observable<any[]> {
        if (status) {
            return this.http.get<any[]>(`${this.API_URL}?status=${status}`);
        }
        return this.http.get<any[]>(this.API_URL);
    }

    getProjectById(id: number): Observable<any> {
        return this.http.get<any>(`${this.API_URL}/${id}`);
    }

    updateProjectStatus(id: number, status: string): Observable<any> {
        return this.http.patch<any>(`${this.API_URL}/${id}/status?status=${status}`, {});
    }
}
