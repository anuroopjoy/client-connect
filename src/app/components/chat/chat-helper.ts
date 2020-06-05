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
    name: 'BWO-CHAT',
    uniqueName: 'BWO-CHAT',
    description: 'BWO Chat Application'
};

export interface IConnectionState {
    connected: boolean;
    disconnected: boolean;
    connecting: boolean;
    denied: boolean;
}
