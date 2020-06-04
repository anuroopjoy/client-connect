import Video, { LocalAudioTrack, CreateLocalTrackOptions, LocalVideoTrack } from 'twilio-video';

export async function useLocalAudioTrack() {
    const getLocalAudioTrack = (deviceId?: string) => {
        const options: CreateLocalTrackOptions = {};

        if (deviceId) {
            options.deviceId = { exact: deviceId };
        }

        return ensureMediaPermissions().then(() =>
            Video.createLocalAudioTrack(options).then(newTrack => {
                return newTrack;
            })
        );
    };
    let track = await getLocalAudioTrack();

    const handleStopped = () => { track = undefined; };
    if (track) {
        track.on('stopped', handleStopped);
    }

    return [track, getLocalAudioTrack];
}

export async function useLocalVideoTrack() {
    const getLocalVideoTrack = (newOptions?: CreateLocalTrackOptions) => {
        // In the DeviceSelector and FlipCameraButton components, a new video track is created,
        // then the old track is unpublished and the new track is published. Unpublishing the old
        // track and publishing the new track at the same time sometimes causes a conflict when the
        // track name is 'camera', so here we append a timestamp to the track name to avoid the
        // conflict.
        const options: CreateLocalTrackOptions = {
            frameRate: 24,
            height: 720,
            width: 1280,
            name: `camera-${Date.now()}`,
            ...newOptions,
        };

        return ensureMediaPermissions().then(() =>
            Video.createLocalVideoTrack(options).then(newTrack => {
                return newTrack;
            })
        );
    };

    // We get a new local video track when the app loads.
    let track = await getLocalVideoTrack();

    const handleStopped = () => { track = undefined; };
    if (track) {
        track.on('stopped', handleStopped);
    }

    return [track, getLocalVideoTrack];
}

export default async function useLocalTracks() {
    const [audioTrack, getLocalAudioTrack] = await useLocalAudioTrack();
    const [videoTrack, getLocalVideoTrack] = await useLocalVideoTrack();

    const localTracks = [audioTrack, videoTrack].filter(track => track !== undefined) as (
        | LocalAudioTrack
        | LocalVideoTrack
    )[];

    return { localTracks, getLocalVideoTrack, getLocalAudioTrack };
}

// This function ensures that the user has granted the browser permission to use audio and video
// devices. If permission has not been granted, it will cause the browser to ask for permission
// for audio and video at the same time (as opposed to separate requests).
export function ensureMediaPermissions() {
    return navigator.mediaDevices
        .enumerateDevices()
        .then(devices => devices.every(device => !(device.deviceId && device.label)))
        .then(shouldAskForMediaPermissions => {
            if (shouldAskForMediaPermissions) {
                return navigator.mediaDevices
                    .getUserMedia({ audio: true, video: true })
                    .then(mediaStream => mediaStream.getTracks().forEach(track => track.stop()));
            }
        });
}
