// tslint:disable: no-any
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root'
})
export class HttpService {

    private server = '';

    constructor(private http: HttpClient) {
        this.server = environment.apiConstants.server;
    }

    public request(method: string, url: string, data: any, responseType?: 'text' | 'json') {
        // Handle Http 'GET' requests
        if (method === 'GET') {
            return this.getRequest(url, data, responseType);
        }
        // Handle Http 'POST' requests
        if (method === 'POST') {
            return this.postRequest(url, data);
        }
    }

    private getRequest(url: string, params: any, responseType?: 'text' | 'json') {
        let options: any;
        options = responseType ? { params, responseType } : { params };
        return this.http.get(this.server + url, options)
            .toPromise();
    }

    private postRequest(url: string, body: any = null) {
        return this.http.post(this.server + url, body)
            .toPromise();
    }

}
