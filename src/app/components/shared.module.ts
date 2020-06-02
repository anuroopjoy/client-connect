import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { EmailComponent } from './email/email.component';
import { SmsComponent } from './sms/sms.component';
import { VideoCallComponent } from './video-call/video-call.component';
import { VoiceCallComponent } from './voice-call/voice-call.component';

@NgModule({
    declarations: [
        EmailComponent,
        SmsComponent,
        VideoCallComponent,
        VoiceCallComponent
    ],
    imports: [
        FormsModule,
        HttpClientModule,
    ],
    providers: [],
    exports: [
        EmailComponent,
        SmsComponent,
        VideoCallComponent,
        VoiceCallComponent
    ]
})
export class SharedModule { }
