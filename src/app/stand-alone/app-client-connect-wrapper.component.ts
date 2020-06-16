import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { Subscription } from 'rxjs';

import { ClientService } from '../services/client-details.service';
import { getCustomerName } from '../constants/user-details.constants';

/**
 * StandAlone TaxFlow WrapperComponent
 * @export
 */
@Component({
    selector: 'app-host-client-connect',
    templateUrl: './app-client-connect-wrapper.component.html'
})
export class AppClientConnectWrapperComponent implements OnInit, OnDestroy {

    public selectedMode: string;

    private unsubscribe: Subscription;

    constructor(
        private route: ActivatedRoute,
        private userDetails: ClientService
    ) { }

    public ngOnInit(): void {
        this.unsubscribe = this.route.queryParamMap
            .subscribe((params: ParamMap) => {
                if (params) {
                    const name = getCustomerName();
                    const role = 'Customer';
                    const returnId = params.get('returnId');
                    if (returnId) {
                        this.userDetails.setUserDetails({ name, role });
                        this.userDetails.returnId = returnId;
                        this.selectedMode = 'Chat';
                    } else {
                        alert('Please provide details (format - ?returnId=<returnId>)');
                    }
                }
            });
    }

    public setSelectedMode(mode: string) {
        this.selectedMode = mode;
    }

    public ngOnDestroy(): void {
        this.unsubscribe.unsubscribe();
    }

}
