import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AppClientConnectWrapperComponent } from './stand-alone/app-client-connect-wrapper.component';

const routes: Routes = [
    {
        path: '**',
        component: AppClientConnectWrapperComponent
    }
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})
export class AppRoutingModule { }
