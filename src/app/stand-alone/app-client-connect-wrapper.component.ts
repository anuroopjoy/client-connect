import { Component } from '@angular/core';

/**
 * StandAlone TaxFlow WrapperComponent
 * @export
 */
@Component({
    selector: 'app-host-client-connect',
    templateUrl: './app-client-connect-wrapper.component.html'
})
export class AppClientConnectWrapperComponent {

    public selectedMode = 'Video';

    public setSelectedMode(mode: string) {
        this.selectedMode = mode;
    }
}
