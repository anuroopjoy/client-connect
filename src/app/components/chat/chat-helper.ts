export const CONNECTION_STATUS = {
    initial: 'Chat with one of our tax professionals right now. Click the "CHAT" button.',
    connecting: 'Please wait. We are connecting you...',
    connected: '',
    error: 'We are unable to connect you due to some technical reasons. Please try later.'
};

export const API_URLS = {
    getToken: '/getToken'
};

export const DEFAULT_CHANNEL = {
    name: 'CLIENT-CONNECT-TEST-CHANNEL2',
    uniqueName: 'CCD-TEST-CHANNEL2',
    description: 'Client Connect Test Channel'
};

export interface IConnectionState {
    connected: boolean;
    disconnected: boolean;
    connecting: boolean;
    denied: boolean;
}

export const MSG_STYLE_COL_START = 5;
export const MAX_MSG_LINE_LENGTH = 20;
