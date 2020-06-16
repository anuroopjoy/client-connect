// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.
/** Environment variables for dev mode */
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

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
