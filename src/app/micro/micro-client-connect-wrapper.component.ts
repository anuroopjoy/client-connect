import { Component, Input } from '@angular/core';

import { ClientService } from '../services/client-details.service';

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
    public liveChatIndicator = false;
    public liveVoiceIndicator = false;

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
            if (this.app === 'Chat') {
                this.liveChatIndicator = false;
            } else if (this.app === 'Voice') {
                this.liveVoiceIndicator = false;
            }
        }
    }

    public showIndicator(app: string) {
        if (app === 'Chat') {
            this.liveChatIndicator = true;
        } else if (app === 'Voice') {
            this.liveVoiceIndicator = true;
        }
        if (!this.expandedView) {
            this.expandedView = (this.liveChatIndicator || this.liveVoiceIndicator)
                && !(['Chat', 'Voice'].includes(this.app));
        }
    }

}
