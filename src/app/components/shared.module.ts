import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { ChatComponent } from './chat/chat.component';
import { EmailComponent } from './email/email.component';
import { VideoCallComponent } from './video-call/video-call.component';
import { VoiceCallComponent } from './voice-call/voice-call.component';

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
        FormsModule,
        CommonModule,
        EmailComponent,
        ChatComponent,
        VideoCallComponent,
        VoiceCallComponent
    ]
})
export class SharedModule { }
