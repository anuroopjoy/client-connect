import { Component, Input } from '@angular/core';

import { ClientService } from '../stand-alone/client-details.service';

/**
 * Micro TaxFlow Wrapper Component
 */
@Component({
    selector: 'app-micro-client-connect-wrapper',
    templateUrl: './micro-client-connect-wrapper.component.html',
    styleUrls: ['./micro-client-connect-wrapper.component.scss']
})
export class MicroClientConnectWrapperComponent {

    @Input() public set user(value: string) {
        if (value) {
            this.pUser = value;
            this.userDetails.setUserDetails({ role: 'TaxPro', name: this.pUser });
        }
    }
    public get user(): string {
        return this.pUser;
    }
    public expandedView = false;
    public app = '';
    public liveIndicator = false;

    private pUser: string;

    constructor(private userDetails: ClientService) {
    }

    public toggleWidget() {
        this.expandedView = !this.expandedView;
    }

    public selectApp(app: string) {
        if (this.app === app) {
            this.app = '';
        } else {
            this.app = app;
            this.liveIndicator = false;
        }
    }

    public showIndicator() {
        this.liveIndicator = true;
    }

}
