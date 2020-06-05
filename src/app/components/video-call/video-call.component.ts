// tslint:disable: no-any
import { Component, AfterViewInit, OnInit, ElementRef, ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import Video, { Room, TwilioError, LocalVideoTrack, LocalAudioTrack, Participant, RemoteParticipant, TrackPublication } from 'twilio-video';
import EventEmitter from 'events';

import { initialSettings } from './constants/settings.constants';
import generateConnectionOptions from './helpers/video-settings.helper';
import useLocalTracks from './helpers/tracks.helper';
import { IMediaStreamTrackPublishOptions } from './interfaces/settings.interface';
import { ClientService } from 'src/app/stand-alone/client-details.service';

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
    public isVideoEnabled: boolean;
    public isScreenShared = false;
    @ViewChild('vid') public vid: ElementRef;
    public toggleAudio: () => void;
    public toggleVideo: () => void;
    public stopScreenShareRef: () => void;
    public participants: Participant[];
    public twilioRoom: Video.Room;
    public style: any;
    public selectedParticipant: Participant;
    public sharingInProgress: boolean;
    public initialLoad = false;

    private name: string;
    private room = 'bwo';
    private passCode = '6497297644';
    private token: string;
    private localTracks: (Video.LocalAudioTrack | Video.LocalVideoTrack)[];
    private getLocalVideoTrack: ((newOptions?: Video.CreateLocalTrackOptions) => Promise<Video.LocalVideoTrack>);

    constructor(private http: HttpClient, private userDetails: ClientService) { }
    public async ngOnInit() {
        this.name = this.userDetails.getUserDetails().name;
        const { token, localTracks } = await this.initializeDevices();
        this.token = token;
        this.localTracks = localTracks;
        this.connectToRoom(token, localTracks);
    }

    public ngAfterViewInit(): void {
        setTimeout(() => {
            this.innerHeight = window.innerHeight;
            window.addEventListener('resize', () => { this.innerHeight = window.innerHeight; });
        });
    }

    public toggleSharing() {
        !this.isScreenShared ? this.getScreenShare(this.twilioRoom) : this.stopScreenShareRef();
    }

    public endCall() {
        this.twilioRoom.disconnect();
    }

    public setMainView(participant: Participant) {
        this.selectedParticipant = participant;
        this.twilioRoom.on('disconnected', async () => {
            this.selectedParticipant = null;
            this.twilioRoom = null;
            this.toggleVideo();
            const { token, localTracks } = await this.initializeDevices();
            this.token = token;
            this.localTracks = localTracks;
        });
        this.getPublications(participant);
    }

    public joinRoom() {
        this.connectToRoom(this.token, this.localTracks);
    }
    private async initializeDevices(): Promise<any> {
        return new Promise(async (resolve) => {
            const result = await useLocalTracks();
            let { localTracks } = result;
            const { getLocalVideoTrack } = result;
            const handleStopped = () => {
                localTracks = localTracks.filter(track => !track.isStopped);
                this.getAudioTrack(localTracks);
                this.getVideoTrack(localTracks);
            };
            for (const track of localTracks) {
                track.on('stopped', handleStopped);
            }
            // tslint:disable-next-line: max-line-length
            this.getLocalVideoTrack = getLocalVideoTrack as ((newOptions?: Video.CreateLocalTrackOptions) => Promise<Video.LocalVideoTrack>);
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
            this.getVideoTrack(localTracks);
            resolve({ token, localTracks });
        });

    }

    private async connectToRoom(token: string, localTracks: (Video.LocalAudioTrack | Video.LocalVideoTrack)[]) {
        const options = generateConnectionOptions(initialSettings);
        let newRoom = await Video.connect(token, { ...options, tracks: [] });
        this.roomState = newRoom.state;
        this.twilioRoom = newRoom;
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
        this.setParticipants();
        if (!this.initialLoad) {
            this.initialLoad = true;
        }
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
    private getVideoTrack(localTracks: (Video.LocalAudioTrack | Video.LocalVideoTrack)[]) {
        const videoTrack = localTracks.find(track => track.name.includes('camera')) as LocalVideoTrack;
        this.isVideoEnabled = !!videoTrack;
        this.toggleVideo = async () => {
            if (videoTrack) {
                if (this.twilioRoom && this.twilioRoom.localParticipant) {
                    const localTrackPublication = this.twilioRoom.localParticipant.unpublishTrack(videoTrack);
                    // TODO: remove when SDK implements this event. See: https://issues.corp.twilio.com/browse/JSDK-2592
                    this.twilioRoom.localParticipant.emit('trackUnpublished', localTrackPublication);
                }
                videoTrack.stop();
            } else {
                this.getLocalVideoTrack().then((track: LocalVideoTrack) => {
                    const handleStopped = () => {
                        // tslint:disable-next-line: no-shadowed-variable
                        localTracks = localTracks.filter(track => !track.isStopped);
                        this.getVideoTrack(localTracks);
                    };
                    track.on('stopped', handleStopped);
                    const el = this.vid.nativeElement;
                    el.muted = true;
                    track.attach(el);
                    if (this.twilioRoom && this.twilioRoom.localParticipant) {
                        this.twilioRoom.localParticipant.publishTrack(track, { priority: 'low' });
                    }
                    localTracks.push(track);
                    this.getVideoTrack(localTracks);
                });
            }
        };
    }
    private getScreenShare(room: Video.Room) {
        navigator.mediaDevices.getDisplayMedia({
            audio: false,
            video: {
                frameRate: 10,
                height: 1080,
                width: 1920,
            },
        }).then(stream => {
            const track = stream.getTracks()[0];
            room.localParticipant
                .publishTrack(track, {
                    name: 'screen', // Tracks can be named to easily find them later
                    priority: 'low', // Priority is set to high by the subscriber when the video track is rendered
                } as IMediaStreamTrackPublishOptions).then(trackPublication => {
                    this.stopScreenShareRef = () => {
                        room.localParticipant.unpublishTrack(track);
                        // TODO: remove this if the SDK is updated to emit this event
                        room.localParticipant.emit('trackUnpublished', trackPublication);
                        track.stop();
                        this.isScreenShared = false;
                    };
                    track.onended = this.stopScreenShareRef;
                    this.isScreenShared = true;
                });
        });
    }

    private setParticipants() {
        this.participants = [this.twilioRoom.localParticipant, ...Array.from(this.twilioRoom.participants.values())];
        const participantConnected = (participant: RemoteParticipant) => {
            this.participants = [...this.participants, participant];
        };
        const participantDisconnected = (participant: RemoteParticipant) => {
            this.participants = this.participants.filter(p => p !== participant);
        };
        this.twilioRoom.on('participantConnected', participantConnected);
        this.twilioRoom.on('participantDisconnected', participantDisconnected);
    }

    private getPublications(participant: Participant) {
        let publications = Array.from(participant.tracks.values()) as TrackPublication[];
        const publicationAdded = (publication: TrackPublication) => {
            publications = [...publications, publication];
            this.getTracks(publications, participant);
        };
        const publicationRemoved = (publication: TrackPublication) => {
            publications = publications.filter(p => p !== publication);
            this.getTracks(publications, participant);
        };
        participant.on('trackPublished', publicationAdded);
        participant.on('trackUnpublished', publicationRemoved);
        this.getTracks(publications, participant);
    }
    private getTracks(publications: TrackPublication[], participant: Participant) {
        let filteredPublications: TrackPublication[];
        if (publications.some(p => p.trackName.includes('screen'))) {
            filteredPublications = publications.filter(p => !p.trackName.includes('camera'));
        } else {
            filteredPublications = publications.filter(p => !p.trackName.includes('screen'));
        }
        // tslint:disable-next-line: no-any
        const videoPublication: any = filteredPublications.find((track: any) => track.kind === 'video');
        if (!videoPublication) { return; }
        const callback = (track: any) => {
            if (!track) { return; }
            const sharingParticipant = Array.from<Participant>(this.twilioRoom.participants.values())
                // the screenshare participant could be the localParticipant
                .concat(this.twilioRoom.localParticipant)
                .find((parties: Participant): any =>
                    Array.from<TrackPublication>(parties.tracks.values()).find(trk =>
                        trk.trackName.includes('screen')
                    )
                );
            this.sharingInProgress = !!sharingParticipant && sharingParticipant !== this.twilioRoom.localParticipant;
            const isFrontFacing = track.mediaStreamTrack.getSettings().facingMode !== 'environment';
            const isLocal = participant === this.twilioRoom.localParticipant && track.name.includes('camera');
            this.style = isLocal && isFrontFacing ? { transform: 'rotateY(180deg)' } : {};
            const el = this.vid.nativeElement;
            el.muted = true;
            track.attach(el);
        };
        videoPublication.on('subscribed', callback);
        videoPublication.on('unsubscribed', () => { });
        callback(videoPublication.track);
    }

}
