import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '@environments/environment.prod';
import { Observable } from 'rxjs';

export interface UserDto {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    biography?: string;
    phoneNumber?: string;
    location?: string;
    rfid: boolean;
    websiteUrl?: string;
    socialLinks?: string[];
    skills?: string[];
    createdAt: string;
    roles: string[];
    profilePictureUrl?: string;
}

export interface UsersResponse {
    users: UserDto[];
    totalCount: number;
    page: number;
    pageSize: number;
    totalPages: number;
}

@Injectable({
    providedIn: 'root'
})
export class ProjectsService {
    private readonly API_URL = `${environment.apiUrl}/Projects`;
    private readonly AUTH_API_URL = `${environment.apiUrl}/Auth`;

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

    createProject(payload: { title: string; description: string; startDate: string; endDate: string; status: string }): Observable<any> {
        return this.http.post<any>(this.API_URL, payload);
    }

    updateProject(id: number | string, payload: { title: string; description: string; startDate: string; endDate: string; status: string }): Observable<any> {
        return this.http.put<any>(`${this.API_URL}/${id}`, payload);
    }

    updateProjectStatus(id: number, status: string): Observable<any> {
        return this.http.patch<any>(`${this.API_URL}/${id}/status?status=${status}`, {});
    }

    updateObjectiveStatus(id: number, status: string): Observable<any> {
        return this.http.patch<any>(`${this.API_URL}/objectives/${id}/status?status=${status}`, {});
    }

    deleteProject(id: string): Observable<any> {
        return this.http.delete<any>(`${this.API_URL}/${id}`);
    }

    joinProject(projectId: number | string): Observable<any> {
        return this.http.post<any>(`${this.API_URL}/${projectId}/join`, {});
    }

    leaveProject(projectId: number | string): Observable<any> {
        return this.http.post<any>(`${this.API_URL}/${projectId}/leave`, {});
    }

    removeTeamMember(projectId: number | string, userId: string): Observable<any> {
        return this.http.delete<any>(`${this.API_URL}/${projectId}/team-members/${userId}`);
    }

    createObjective(payload: { projectId: string; title: string; description: string; status: string }): Observable<any> {
        return this.http.post<any>(`${this.API_URL}/objectives`, payload);
    }

    deleteObjective(objectiveId: number | string): Observable<any> {
        return this.http.delete<any>(`${this.API_URL}/objectives/${objectiveId}`);
    }

    getAllUsers(page: number = 1, pageSize: number = 100): Observable<UsersResponse> {
        return this.http.get<UsersResponse>(`${this.AUTH_API_URL}/users?page=${page}&pageSize=${pageSize}`);
    }

    createResource(payload: { projectId: number; title: string; url: string; description: string; type: string }): Observable<any> {
        return this.http.post<any>(`${this.API_URL}/resources`, payload);
    }

    updateResource(id: number, payload: { projectId: number; title: string; url: string; description: string; type: string }): Observable<any> {
        return this.http.put<any>(`${this.API_URL}/resources/${id}`, payload);
    }

    deleteResource(id: number): Observable<any> {
        return this.http.delete<any>(`${this.API_URL}/resources/${id}`);
    }
}
