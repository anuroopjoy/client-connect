// tslint:disable: no-any
import { isEmpty, each, find, isUndefined } from 'lodash-es';

import { HttpClient } from '@angular/common/http';
import { Component, Input } from '@angular/core';
import { addMessage, removeMessage, updateMessage, updateMember, updateActiveChannel } from './chat-helper';

const TwilioChat = require('twilio-chat');

@Component({
    selector: 'app-chat',
    templateUrl: './chat.component.html',
    styleUrls: ['./chat.component.scss']
})
export class ChatComponent {

    public userName = '';

    public channels: { [key: string]: any } = {
        joined: [], invited: [], unknown: [], common: []
    };

    public messages: string[];
    public connectionState: string;

    private apiUrls = {
        getToken: '/getToken'
    };
    private client: any;

    private activeChannel: any;

    constructor(private http: HttpClient) {
    }

    public connect() {
        if (!isEmpty(this.userName)) {
            this.initializeChat();
        } else {
            console.error('ERROR! : Unable to connect. User name is empty.');
        }
    }

    private onChannelEvents() {

        let subscribedChannels: any[] = [];

        const setActiveChannel = (channel: any) => {
            if (this.activeChannel) {
                this.activeChannel.removeListener('messageAdded', addMessage);
                this.activeChannel.removeListener('messageRemoved', removeMessage);
                this.activeChannel.removeListener('messageUpdated', updateMessage);
                this.activeChannel.removeListener('updated', updateActiveChannel);
                this.activeChannel.removeListener('memberUpdated', updateMember);
            }
        };

        const updateChannels = (page: any) => {
            subscribedChannels = page.items
                .sort((a: { friendlyName: number; }, b: { friendlyName: number; }) => a.friendlyName > b.friendlyName);
            each(subscribedChannels, (channel) => {
                switch (channel.status) {
                    case 'joined':
                        this.channels.joined.push(channel);
                        break;
                    case 'invited':
                        this.channels.invited.push(channel);
                        break;
                    default:
                        this.channels.unknown.push(channel);
                        break;
                }
            });
        };

        const updatePublicChannels = (page: any) => {
            const publicChannels = page.items
                .sort((a: { friendlyName: number; }, b: { friendlyName: number; }) => a.friendlyName > b.friendlyName);
            each(publicChannels, (channel) => {
                const result = find(subscribedChannels, item => item.sid === channel.sid);
                console.log('Adding public channel ' + channel.sid + ' ' + channel.status + ', result=' + result);
                if (isUndefined(result)) {
                    channel.getChannel()
                        .then((pChannel: { join: () => Promise<any>; }) => {
                            pChannel.join()
                                .then(qChannel => {
                                    setActiveChannel(qChannel);
                                    // removePublicChannel(qChannel);
                                })
                                .catch((error: any) => {
                                    console.error('ERROR! : Unable to join public channel.', { error });
                                }).catch((error) => {
                                    console.error('ERROR! : Unable to get public channel details.', { error });
                                });
                        });
                }
            });
        };

        this.client.getSubscribedChannels()
            .then((page: any) => {
                updateChannels(page);
            })
            .catch((error: any) => {
                console.error('ERROR! : Unable to get channel details.', { error });
            });
        this.client.getPublicChannelDescriptors()
            .then((page: any) => {
                updatePublicChannels(page);
            })
            .catch((error: any) => {
                console.error('ERROR! : Unable to get public channel details.', { error });
            });
    }

    private onConnectionStateEvents() {
        const onConnectionChange = () => {
            this.connectionState = this.client.connectionState;
        };
        this.client.on('connectionStateChanged', onConnectionChange);
    }

    private async initializeChat() {
        try {
            this.http.get(
                this.apiUrls.getToken, {
                params: { identity: this.userName, device: 'browser' },
                responseType: 'text'
            }).toPromise().then((token: any) => {
                (TwilioChat.Client.create(token, { logLevel: 'info' }) as Promise<any>)
                    .then((client) => {
                        this.client = client;
                        this.subscribeToClientEvents();
                    })
                    .catch((error) => {
                        console.error('ERROR! : Unable to create Twilio client.', { error });
                    });
            });
        } catch (error) {
            console.error('ERROR! : Unable to fetch the chat service token.', { error });
        }
    }

    private async subscribeToClientEvents() {
        this.onTokenRefreshEvent();
        this.onChannelEvents();
        this.onConnectionStateEvents();
    }

    private onTokenRefreshEvent() {
        const refreshToken = () => {
            try {
                const token: any = this.http.get(
                    this.apiUrls.getToken, {
                    params: { identity: this.userName, device: 'browser' },
                    responseType: 'text'
                }).toPromise();
                this.client.updateToken(token);
            } catch (error) {
                console.error('ERROR! : Unable to refresh the chat service token.', { error });
            }
        };
        this.client.on('tokenAboutToExpire', refreshToken);
    }

    private createChannel() {
        this.client.createChannel({
            attributes: { description: 'Chat with tax professionals' },
            friendlyName: 'BWO-CHAT',
            isPrivate: true,
            uniqueName: 'BWO-CHAT'
        });
    }

}
