import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { Subscription } from 'rxjs';

import { ClientService } from '../services/client-details.service';

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
                    const name = params.get('name');
                    const role = params.get('role');
                    if (name && role) {
                        this.userDetails.setUserDetails({ name, role });
                        this.selectedMode = 'Chat';
                    } else {
                        alert('User details not available (format - ?name=<name>&role=<role>)');
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
