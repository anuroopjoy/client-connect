import { CUSTOM_ELEMENTS_SCHEMA, Injector, NgModule } from '@angular/core';
import { createCustomElement } from '@angular/elements';
import { BrowserModule } from '@angular/platform-browser';

import { SharedModule } from '../components/shared.module';
import { MicroClientConnectCustomerComponent } from './micro-client-connect-customer-wrapper.component';

/** Implementation of HRBMicroTaxFlowWrapperModule */
@NgModule({
    declarations: [MicroClientConnectCustomerComponent],
    imports: [BrowserModule, SharedModule],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
    entryComponents: [MicroClientConnectCustomerComponent]
})
export class MicroClientConnectCustomerModule {

    /** Creates an instance of HRBMicroFinishFlowWrapperModule
     * @param injector Angular Injector
     */
    constructor(private injector: Injector) { }

    /** Hook for manual bootstrapping of the application */
    public ngDoBootstrap() {

        /** Convert Angular component into a custom element */
        const appElement = createCustomElement(MicroClientConnectCustomerComponent, { injector: this.injector });

        /** Define custom element tag */
        const customElementTag = 'client-connect-customer-app';
        /** Verify if custom element is already present in the customElementRegistry */
        if (!customElements.get(customElementTag)) {
            /** Define a new custom element */
            customElements.define(customElementTag, appElement);
        }
    }

}
