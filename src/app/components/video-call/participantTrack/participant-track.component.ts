// tslint:disable: no-any
import { Component, Input, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { Participant, TrackPublication } from 'twilio-video';

@Component({
    selector: 'app-participant-track',
    templateUrl: './participant-track.component.html',
    styleUrls: ['./participant-track.component.scss']
})
export class ParticipantTrackComponent implements AfterViewInit {
    @Input() public participant: Participant;
    @Input() public isLocal: boolean;
    @ViewChild('vid') public vid: ElementRef;

    public ngAfterViewInit(): void {
        const publications = Array.from(this.participant.tracks.values()) as TrackPublication[];
        // tslint:disable-next-line: no-any
        const videoPublication: any = publications.find((track: any) => track.kind === 'video' && track.trackName.includes('camera'));
        if (!videoPublication) { return; }
        videoPublication.on('subscribed', (track: any) => {
            const el = this.vid.nativeElement;
            el.muted = true;
            track.attach(el);
        });
        videoPublication.on('unsubscribed', () => { });

    }

}
