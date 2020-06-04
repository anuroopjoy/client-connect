// tslint:disable: no-any
import { HttpClient } from '@angular/common/http';
import { Component, ElementRef, ViewChild } from '@angular/core';
import { each, find, isEmpty, isUndefined } from 'lodash-es';

import { BWO_CHANNEL_NAME, CONNECTION_STATUS, API_URLS } from './chat-helper';

const Client = require('twilio-chat').Client;

@Component({
    selector: 'app-chat',
    templateUrl: './chat.component.html',
    styleUrls: ['./chat.component.scss']
})
export class ChatComponent {

    public activeChannel: any;
    public activeChannelMessages: any[];
    public channels: { [key: string]: any } = {
        joined: [], invited: [], unknown: [], common: []
    };
    public isConnected = false;
    public status = CONNECTION_STATUS.initial;
    public messageToSend: string;
    public messages: string[];
    public userName = '';

    private client: any;
    @ViewChild('messagePanel') private messagePanel: ElementRef;

    constructor(private http: HttpClient) {
    }

    public connect() {
        if (!isEmpty(this.userName)) {
            this.initializeChat();
        } else {
            console.error('ERROR! : Unable to connect. User name is empty.');
        }
    }

    public sendMessage() {
        if (this.activeChannel) {
            this.activeChannel.sendMessage(this.messageToSend)
                .then(() => {
                    // Your message has been sent.
                })
                .catch((error: any) => {
                    console.error('ERROR! : Unable to send messages to ' + this.activeChannel.friendlyName, { error });
                });
        }
    }

    private createChannel() {
        this.client.createChannel({
            attributes: { description: 'BlockWorks Customer Support' },
            friendlyName: BWO_CHANNEL_NAME,
            isPrivate: true,
            uniqueName: BWO_CHANNEL_NAME
        })
            .then((channel: any) => {
                channel.join()
                    .then(() => {
                        this.activeChannel = channel;
                        this.setActiveChannel();
                    })
                    .catch((error: any) => { console.error('ERROR! : Unable to join channel.', { error }); });
            })
            .catch((error: any) => {
                console.error('ERROR! : Unable to create new channel.', { error });
            });
    }

    private initializeChat() {
        try {
            this.status = CONNECTION_STATUS.connecting;
            this.http.get(
                API_URLS.getToken, {
                params: { identity: this.userName, device: 'browser' },
                responseType: 'text'
            }).toPromise().then((token: any) => {
                (Client.create(token, { logLevel: 'info' }) as Promise<any>)
                    .then((client) => {
                        this.client = client;
                        this.status = CONNECTION_STATUS.connected;
                        this.subscribeToClientEvents();
                    })
                    .catch((error) => {
                        this.status = CONNECTION_STATUS.error;
                        console.error('ERROR! : Unable to create Twilio client.', { error });
                    });
            });
        } catch (error) {
            this.status = CONNECTION_STATUS.error;
            console.error('ERROR! : Unable to fetch the chat service token.', { error });
        }
    }

    private onChannelEvents() {
        let subscribedChannels: any[] = [];
        const updateChannels = (page: any) => {
            subscribedChannels = page.items
                .sort((a: { friendlyName: number; }, b: { friendlyName: number; }) => a.friendlyName > b.friendlyName);
            this.activeChannel = find(subscribedChannels, channel => channel.friendlyName === BWO_CHANNEL_NAME);
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
            if (this.activeChannel) {
                this.setActiveChannel();
            } else {
                this.createChannel();
            }
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
                                    this.activeChannel = qChannel;
                                    this.setActiveChannel();
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
        const onConnectionChange = () => { this.isConnected = this.client.connectionState === 'connected'; };
        this.client.on('connectionStateChanged', onConnectionChange);
    }

    private onTokenRefreshEvent() {
        const refreshToken = () => {
            this.http.get(
                API_URLS.getToken, {
                params: { identity: this.userName, device: 'browser' },
                responseType: 'text'
            }).toPromise()
                .then((token) => {
                    this.client.updateToken(token);
                })
                .catch((error) => {
                    console.error('ERROR! : Unable to refresh the chat service token.', { error });
                });
        };
        this.client.on('tokenAboutToExpire', refreshToken);
    }

    private scrollToLastMessage() {
        const element = this.messagePanel.nativeElement;
        setTimeout(() => { element.scrollTop = element.scrollHeight; }, 0);
    }

    private setActiveChannel() {
        this.activeChannel.getMessages(30)
            .then((page: any) => {
                this.activeChannelMessages = page.items;
                this.scrollToLastMessage();
            });
        this.activeChannel.on('messageAdded', (message: any) => {
            this.activeChannelMessages.push(message);
            this.messageToSend = '';
            this.scrollToLastMessage();
        });
        this.activeChannel.on('messageUpdated', ({ message }: any) => {
            let messageToUpdate = find(this.activeChannelMessages, { index: message.index });
            if (messageToUpdate) { messageToUpdate = { ...message }; }
        });
    }

    private subscribeToClientEvents() {
        this.onTokenRefreshEvent();
        this.onChannelEvents();
        this.onConnectionStateEvents();
    }

}
