import { Component, Input } from '@angular/core';

import { ClientService } from '../services/client-details.service';
import { getTaxproName } from '../constants/user-details.constants';

/**
 * Micro TaxFlow Wrapper Component
 */
@Component({
    selector: 'app-micro-client-connect-wrapper',
    templateUrl: './micro-client-connect-wrapper.component.html',
    styleUrls: ['./micro-client-connect-wrapper.component.scss']
})
export class MicroClientConnectWrapperComponent {

    @Input() public set returnid(value: string) {
        if (value) {
            this.userDetails.returnId = value;
            this.userDetails.setUserDetails({
                role: 'TaxPro',
                name: getTaxproName()
            });
        }
    }

    public app = '';
    public liveChatIndicator = false;
    public liveVoiceIndicator = false;

    private pUser: string;

    constructor(private userDetails: ClientService) {
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
    }

}
