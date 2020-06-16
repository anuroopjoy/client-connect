// tslint:disable: no-any
/** Environment variables for prod mode */
export const environment: { production: boolean; apiConstants: IUrlConstants } = {
    production: true,
    apiConstants: {
        features: {
            chat: {
                getToken: {
                    method: 'GET',
                    url: 'ChatToken',
                    responseType: undefined
                }
            },
            email: {
                sendMail: {
                    method: 'GET',
                    url: 'Email',
                    responseType: undefined
                }
            },
            sms: {},
            video: {
                getToken: {
                    method: 'GET',
                    url: 'VideoCallToken',
                    responseType: undefined
                }
            },
            voice: {
                getToken: {
                    method: 'GET',
                    url: 'VoiceCallToken',
                    responseType: undefined
                }
            }
        },
        server: 'https://clientconnect.azurewebsites.net/api/'
    }
};

export interface IUrlConstants {
    features: {
        [key: string]: {
            [key: string]: IApiDefinition
        }
    };
    server: string;
}

export interface IApiDefinition {
    method: string;
    url: string;
    responseType: 'text' | 'json' | undefined;
}
