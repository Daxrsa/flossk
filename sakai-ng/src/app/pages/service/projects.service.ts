import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '@environments/environment.prod';
import { Observable } from 'rxjs';
import { Project } from '../dashboard/components/projects';

@Injectable({
    providedIn: 'root'
})
export class ProjectsService {
    private readonly API_URL = `${environment.apiUrl}/Projects`;

    constructor(private http: HttpClient) {}

    getProjects(): Observable<Project[]> {
        return this.http.get<Project[]>(this.API_URL);
    }
}
