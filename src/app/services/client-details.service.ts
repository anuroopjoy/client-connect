import { Injectable } from '@angular/core';

interface IUserDetails {
    name: string;
    role: string;
}

@Injectable({
    providedIn: 'root'
})
export class ClientService {

    private pReturnId: string;

    public get returnId(): string {
        return this.pReturnId;
    }

    public set returnId(v: string) {
        this.pReturnId = v;
    }

    private name: string;
    private role: string;

    public setUserDetails(details: Partial<IUserDetails>) {
        const { name, role } = details;
        this.name = name;
        this.role = role;
    }

    public getUserDetails(): IUserDetails {
        return { name: this.name, role: this.role };
    }
}
