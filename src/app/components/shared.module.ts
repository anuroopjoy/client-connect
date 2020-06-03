import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { EmailComponent } from './email/email.component';
import { ChatComponent } from './chat/chat.component';
import { VideoCallComponent } from './video-call/video-call.component';
import { VoiceCallComponent } from './voice-call/voice-call.component';
import { CommonModule } from '@angular/common';

@NgModule({
    declarations: [
        EmailComponent,
        ChatComponent,
        VideoCallComponent,
        VoiceCallComponent
    ],
    imports: [
        FormsModule,
        HttpClientModule,
        CommonModule
    ],
    providers: [],
    exports: [
        EmailComponent,
        ChatComponent,
        VideoCallComponent,
        VoiceCallComponent
    ]
})
export class SharedModule { }
