import { Component, Input } from '@angular/core';

import { ClientService } from '../services/client-details.service';
import { getCustomerName } from '../constants/user-details.constants';

/**
 * Micro TaxFlow Wrapper Component
 */
@Component({
    selector: 'app-micro-client-connect-customer-wrapper',
    templateUrl: './micro-client-connect-customer-wrapper.component.html',
    styleUrls: ['./micro-client-connect-customer-wrapper.component.scss']
})
export class MicroClientConnectCustomerComponent {

    @Input() public set returnid(value: string) {
        if (value) {
            this.userDetails.returnId = value;
            this.userDetails.setUserDetails({
                role: 'Customer',
                name: getCustomerName()
            });
        }
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
        if (this.app !== 'Chat' && app === 'Chat') {
            this.liveChatIndicator = true;
        } else if (this.app !== 'Voice' && app === 'Voice') {
            this.liveVoiceIndicator = true;
        }
        if (!this.expandedView) {
            this.expandedView = (this.liveChatIndicator || this.liveVoiceIndicator)
                && !(['Chat', 'Voice'].includes(this.app));
        }
    }

}
