import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { environment } from './environments/environment';
import { MicroClientConnectCustomerModule } from './app/micro-customer/micro-client-connect-customer-wrapper.module';

if (environment.production) {
    try {
        enableProdMode();
    } catch (err) {
        console.log('Production mode already enabled');
    }
}

platformBrowserDynamic().bootstrapModule(MicroClientConnectCustomerModule)
    .catch(err => console.error(err));
