import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface InventoryItem {
    id: string;
    properties: { [key: string]: any };
    createdAt: string;
    updatedAt?: string;
    createdByUserId: string;
    createdByUserEmail: string;
    createdByUserFullName: string;
}

export interface PaginatedInventoryResponse {
    data: InventoryItem[];
    totalCount: number;
    page: number;
    pageSize: number;
    totalPages: number;
}

@Injectable({
    providedIn: 'root'
})
export class InventoryService {
    private readonly API_URL = `${environment.apiUrl}/Inventory`;

    constructor(private http: HttpClient) {}

    getInventoryItems(page: number = 1, pageSize: number = 20, search?: string): Observable<PaginatedInventoryResponse> {
        let params = new HttpParams()
            .set('page', page.toString())
            .set('pageSize', pageSize.toString());
        
        if (search) {
            params = params.set('search', search);
        }

        return this.http.get<PaginatedInventoryResponse>(this.API_URL, { params });
    }

    getInventoryItem(id: string): Observable<InventoryItem> {
        return this.http.get<InventoryItem>(`${this.API_URL}/${id}`);
    }

    createInventoryItem(item: { properties: { [key: string]: any } }): Observable<any> {
        return this.http.post(this.API_URL, item);
    }

    updateInventoryItem(id: string, properties: { [key: string]: any }): Observable<any> {
        return this.http.put(`${this.API_URL}/${id}`, { properties });
    }

    deleteInventoryItem(id: string): Observable<any> {
        return this.http.delete(`${this.API_URL}/${id}`);
    }

    importInventoryFile(file: File): Observable<any> {
        const formData = new FormData();
        formData.append('file', file);
        return this.http.post(`${this.API_URL}/import/parse`, formData);
    }
}
