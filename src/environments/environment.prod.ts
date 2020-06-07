// tslint:disable: no-any
/** Environment variables for prod mode */
export const environment: { production: boolean; apiConstants: IUrlConstants } = {
    production: true,
    apiConstants: {
        features: {
            chat: {
                getToken: {
                    method: 'GET',
                    url: 'ChatToken/Generate',
                    responseType: undefined
                }
            },
            email: {
                sendMail: {
                    method: 'GET',
                    url: 'Email/SendEmailAsync',
                    responseType: undefined
                }
            },
            sms: {},
            video: {
                getToken: {
                    method: 'GET',
                    url: 'VideoCallToken/Generate',
                    responseType: undefined
                }
            },
            voice: {
                getToken: {
                    method: 'GET',
                    url: 'Token/Generate',
                    responseType: undefined
                }
            }
        },
        server: 'http://localhost:4200/'
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
