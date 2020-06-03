import { Component } from '@angular/core';

/**
 * Micro TaxFlow Wrapper Component
 */
@Component({
    selector: 'app-micro-client-connect-wrapper',
    styles:[
        `
        .button__wrapper{
            position: fixed;
            bottom: 10px;
            right: 10px;
            z-index: 11111
        }
        `
    ],
    templateUrl: './micro-client-connect-wrapper.component.html'
})
export class MicroClientConnectWrapperComponent {

}
