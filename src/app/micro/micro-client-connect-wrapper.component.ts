import { Component } from '@angular/core';

/**
 * Micro TaxFlow Wrapper Component
 */
@Component({
    selector: 'app-micro-client-connect-wrapper',
    templateUrl: './micro-client-connect-wrapper.component.html',
    styleUrls: ['./micro-client-connect-wrapper.component.scss']
})
export class MicroClientConnectWrapperComponent {

    public expandedView = false;

    public toggleWidget() {
        this.expandedView = !this.expandedView;
    }

}
