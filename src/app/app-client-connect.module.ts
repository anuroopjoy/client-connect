import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppClientConnectWrapperComponent } from './stand-alone/app-client-connect-wrapper.component';
import { HostEntryComponent } from './stand-alone/host-entry/host-entry.component';

@NgModule({
    declarations: [
        HostEntryComponent,
        AppClientConnectWrapperComponent
    ],
    imports: [
        BrowserModule,
        HttpClientModule,
        AppRoutingModule
    ],
    providers: [],
    bootstrap: [HostEntryComponent]
})
export class AppClientConnectModule { }
