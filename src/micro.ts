import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { environment } from './environments/environment';
import { MicroClientConnectWrapperModule } from './app/micro/micro-client-connect-wrapper.module';

if (environment.production) {
    try {
        enableProdMode();
    } catch (err) {
        console.log('Production mode already enabled');
    }
}

platformBrowserDynamic().bootstrapModule(MicroClientConnectWrapperModule)
    .catch(err => console.error(err));
