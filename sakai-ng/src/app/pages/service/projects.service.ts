import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '@environments/environment.prod';

@Injectable({
    providedIn: 'root'
})
export class ProjectsService {
    private readonly API_URL = `${environment.apiUrl}/Projects`;

    constructor(private http: HttpClient) {}

    getProjects(): void {
        this.http.get(this.API_URL).subscribe({
            next: (projects) => {
                console.log('Projects:', projects);
            },
            error: (error) => {
                console.error('Error fetching projects:', error);
            }
        });
    }
}
