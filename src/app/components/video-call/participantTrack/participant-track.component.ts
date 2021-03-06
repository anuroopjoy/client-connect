// tslint:disable: no-any
import { Component, Input, ElementRef, ViewChild, AfterViewInit, Output, EventEmitter } from '@angular/core';
import { Participant, TrackPublication, VideoTrackPublication, AudioTrackPublication } from 'twilio-video';

@Component({
    selector: 'app-participant-track',
    templateUrl: './participant-track.component.html',
    styleUrls: ['./participant-track.component.scss']
})
export class ParticipantTrackComponent implements AfterViewInit {
    @Input() public participant: Participant;
    @Input() public isLocal: boolean;
    @Output() public selected = new EventEmitter<Participant>();
    @ViewChild('vid') public vid: ElementRef;

    public style: any;

    public ngAfterViewInit(): void {
        let publications = Array.from(this.participant.tracks.values()) as TrackPublication[];
        const publicationAdded = (publication: TrackPublication) => {
            publications = [...publications, publication];
            this.getTracks(publications);
            this.createAudio(publications);
        };
        const publicationRemoved = (publication: TrackPublication) => {
            publications = publications.filter(p => p !== publication);
            this.getTracks(publications);
            this.createAudio(publications);
        };
        this.participant.on('trackPublished', publicationAdded);
        this.participant.on('trackUnpublished', publicationRemoved);
        this.getTracks(publications);
        this.createAudio(publications);
        if (this.isLocal) {
            this.selected.emit(this.participant);
        }
    }

    public select() {
        this.selected.emit(this.participant);
    }

    private getTracks(publications: TrackPublication[]) {
        const videoPublication =
            publications.find((track: any) => track.kind === 'video' && track.trackName.includes('camera')) as VideoTrackPublication;
        if (!videoPublication) { return; }
        const callback = (track: any) => {
            if (!track) { return; }
            const isFrontFacing = track.mediaStreamTrack.getSettings().facingMode !== 'environment';
            this.isLocal = this.isLocal && track.name.includes('camera');
            this.style = this.isLocal && isFrontFacing ? { transform: 'rotateY(180deg)' } : {};
            const el = this.vid.nativeElement;
            el.muted = true;
            track.attach(el);
        };
        videoPublication.on('subscribed', callback);
        videoPublication.on('unsubscribed', () => { });
        callback(videoPublication.track);
    }

    private createAudio(publications: TrackPublication[]) {
        const audioPublication =
            publications.find((track: any) => track.kind === 'audio') as AudioTrackPublication;
        if (!audioPublication) { return; }
        const callback = (track: any) => {
            if (!track) { return; }
            const audioEl = track.attach();
            audioEl.setAttribute('data-cy-audio-track-name', track.name);
            document.body.appendChild(audioEl);
        };
        audioPublication.on('subscribed', callback);
        audioPublication.on('unsubscribed', () => { });
        callback(audioPublication.track);
    }
}
