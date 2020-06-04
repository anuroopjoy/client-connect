// tslint:disable: no-any
import { Component, AfterViewInit, OnInit, ElementRef, ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import Video, { Room, TwilioError, LocalVideoTrack, LocalAudioTrack } from 'twilio-video';
import EventEmitter from 'events';

import { initialSettings } from './constants/settings.constants';
import generateConnectionOptions from './helpers/video-settings.helper';
import useLocalTracks from './helpers/tracks.helper';

@Component({
    selector: 'app-video-call',
    templateUrl: './video-call.component.html',
    styleUrls: ['./video-call.component.scss']
})
export class VideoCallComponent implements OnInit, AfterViewInit {
    public innerHeight: number;
    public roomState = 'disconnected';
    public videoStyle: any;
    public isAudioEnabled: boolean;
    @ViewChild('vid') public vid: ElementRef;
    public toggleAudio: () => void;

    private name = 'anuroop'; // TO DO take user name
    private room = 'bwo';
    private passCode = '6497297644';

    constructor(private http: HttpClient) { }
    public ngOnInit() {
        this.initializeDevices();
    }

    public ngAfterViewInit(): void {
        setTimeout(() => {
            this.innerHeight = window.innerHeight;
            window.addEventListener('resize', () => { this.innerHeight = window.innerHeight; });
        });
    }

    private async initializeDevices() {
        const { localTracks } = await useLocalTracks();
        const { token }: any = await this.http.post('/token',
            { user_identity: this.name, room_name: this.room, passcode: this.passCode }).toPromise();
        const videoTrack = localTracks.find(track => track.name.includes('camera')) as LocalVideoTrack;
        const el = this.vid.nativeElement;
        el.muted = true;
        videoTrack.attach(el);
        // The local video track is mirrored.
        const isFrontFacing = videoTrack.mediaStreamTrack.getSettings().facingMode !== 'environment';
        this.videoStyle = isFrontFacing ? { transform: 'rotateY(180deg)' } : {};
        this.getAudioTrack(localTracks);
        // this.connectToRoom(token, localTracks);
    }

    private async connectToRoom(token: string, localTracks: (Video.LocalAudioTrack | Video.LocalVideoTrack)[]) {
        const options = generateConnectionOptions(initialSettings);
        let newRoom = await Video.connect(token, { ...options, tracks: [] });
        this.roomState = newRoom.state;
        const disconnect = () => newRoom.disconnect();
        newRoom.once('disconnected', () => {
            // Reset the room only after all other `disconnected` listeners have been called.
            setTimeout(() => { newRoom = new EventEmitter() as Room; });
            window.removeEventListener('beforeunload', disconnect);
        });

        // @ts-ignore
        window.twilioRoom = newRoom;

        localTracks.forEach(track =>
            // Tracks can be supplied as arguments to the Video.connect() function and they will automatically be published.
            // However, tracks must be published manually in order to set the priority on them.
            // All video tracks are published with 'low' priority. This works because the video
            // track that is displayed in the 'MainParticipant' component will have it's priority
            // set to 'high' via track.setPriority()
            newRoom.localParticipant.publishTrack(track, { priority: track.kind === 'video' ? 'low' : 'standard' })
        );

        // Add a listener to disconnect from the room when a user closes their browser
        window.addEventListener('beforeunload', disconnect);
        const onErrorCallback = (error: TwilioError) => {
            this.roomState = newRoom.state;
            console.log(`ERROR: ${error.message}`, error);
        };
        const onStatusCallback = () => {
            this.roomState = newRoom.state;
        };
        newRoom.on('disconnected', onErrorCallback);
        newRoom.localParticipant.on('trackPublicationFailed', onErrorCallback);
        newRoom.on('reconnected', onStatusCallback);
        newRoom.on('reconnecting', onStatusCallback);
    }

    private getAudioTrack(localTracks: (Video.LocalAudioTrack | Video.LocalVideoTrack)[]) {
        const audioTrack = localTracks.find(track => track.kind === 'audio') as LocalAudioTrack;
        this.isAudioEnabled = audioTrack ? audioTrack.isEnabled : false;
        const setEnabled = () => { this.isAudioEnabled = true; };
        const setDisabled = () => { this.isAudioEnabled = false; };
        audioTrack.on('enabled', setEnabled);
        audioTrack.on('disabled', setDisabled);
        this.toggleAudio = () => {
            audioTrack.isEnabled ? audioTrack.disable() : audioTrack.enable();
        };
    }
}
