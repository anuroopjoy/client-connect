import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { environment } from './environments/environment';
import { AppClientConnectModule } from './app/app-client-connect.module';

if (environment.production) {
    try {
        enableProdMode();
    } catch (err) {
        console.log('Production mode already enabled');
    }
}

platformBrowserDynamic().bootstrapModule(AppClientConnectModule)
    .catch(err => console.error(err));
