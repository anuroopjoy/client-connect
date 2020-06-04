import Video, { VideoTrack, Track, LogLevels } from 'twilio-video';

export type RenderDimensionValue =
    | 'low'
    | 'cif'
    | 'vga'
    | 'wvga'
    | '540p'
    | '720p'
    | '960p'
    | 'standard1080p'
    | 'wide1080p'
    | 'default';

export interface ISettings {
    trackSwitchOffMode: Video.VideoBandwidthProfileOptions['trackSwitchOffMode'];
    dominantSpeakerPriority?: Video.Track.Priority;
    bandwidthProfileMode: Video.VideoBandwidthProfileOptions['mode'];
    maxTracks: string;
    maxAudioBitrate: string;
    renderDimensionLow?: RenderDimensionValue;
    renderDimensionStandard?: RenderDimensionValue;
    renderDimensionHigh?: RenderDimensionValue;
}

export interface IRenderDimension {
    label: string;
    value: RenderDimensionValue;
    resolution?: VideoTrack.Dimensions;
}

export interface IMediaStreamTrackPublishOptions {
    name?: string;
    priority: Track.Priority;
    logLevel: LogLevels;
}
