import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { SharedModule } from './components/shared.module';
import {
    AppClientConnectWrapperComponent
} from './stand-alone/app-client-connect-wrapper.component';
import { HostEntryComponent } from './stand-alone/host-entry/host-entry.component';
import { FormsModule } from '@angular/forms';

@NgModule({
    declarations: [
        HostEntryComponent,
        AppClientConnectWrapperComponent
    ],
    imports: [
        BrowserModule,
        HttpClientModule,
        SharedModule,
        FormsModule,
        AppRoutingModule
    ],
    providers: [],
    bootstrap: [HostEntryComponent]
})
export class AppClientConnectModule { }
