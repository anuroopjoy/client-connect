// tslint:disable: no-any
import { HttpClient } from '@angular/common/http';
import { Component, ElementRef, ViewChild, Output, EventEmitter } from '@angular/core';
import { each, find, isEmpty, size, first, last } from 'lodash-es';

import { CONNECTION_STATUS, API_URLS, DEFAULT_CHANNEL, IConnectionState, MAX_MSG_LINE_LENGTH, MSG_STYLE_COL_START } from './chat-helper';

const Client = require('twilio-chat').Client;

@Component({
    selector: 'app-chat',
    templateUrl: './chat.component.html',
    styleUrls: ['./chat.component.scss']
})
export class ChatComponent {
    @Output() public chatReceived = new EventEmitter();
    public activeChannel: any;
    public activeChannelMessages: any[];
    public channels: { [key: string]: any } = {
        joined: [], invited: [], unknown: [], common: []
    };
    public connectionState: Partial<IConnectionState> = {
        connected: false,
        disconnected: true,
        connecting: false,
        denied: false
    };
    public messageToSend: string;
    public messages: string[];
    public status = CONNECTION_STATUS.initial;
    public typingMembers = new Set();
    public typingMsg: string;
    public userName = '';

    private client: any;
    @ViewChild('messagePanel') private messagePanel: ElementRef;

    constructor(private http: HttpClient) { }

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
            attributes: { description: DEFAULT_CHANNEL.description },
            friendlyName: DEFAULT_CHANNEL.name,
            isPrivate: true,
            uniqueName: DEFAULT_CHANNEL.uniqueName
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
            this.activeChannel = find(subscribedChannels, channel => channel.friendlyName === DEFAULT_CHANNEL.name);
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
        this.client.getSubscribedChannels()
            .then((page: any) => {
                updateChannels(page);
            })
            .catch((error: any) => {
                console.error('ERROR! : Unable to get channel details.', { error });
            });
    }

    private onConnectionStateEvents() {
        const onConnectionChange = () => {
            const currentState: keyof IConnectionState = this.client.connectionState;
            const { [currentState]: state, ...others } = this.connectionState;
            each(others, (val, key, act) => act[key] = false);
            this.connectionState = {
                [currentState]: true,
                ...others
            };
        };
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

        const getClassName = (len: number) => {
            return 'col-sm-' + (Math.round(len / MAX_MSG_LINE_LENGTH) + MSG_STYLE_COL_START);
        };

        this.activeChannel.getMessages(30)
            .then((page: any) => {
                this.activeChannelMessages = page.items
                    .map((item: { author: any; body: any; index: any; dateUpdated: any; }) => {
                        const { author, body, index, dateUpdated } = item;
                        return {
                            author, body, dateUpdated, index,
                            cssClass: getClassName(body.length)
                        };
                    });
                this.scrollToLastMessage();
            });
        this.activeChannel.on('messageAdded', (message: any) => {
            const { author, body, index, dateUpdated } = message;
            this.activeChannelMessages.push({
                author, body, dateUpdated, index,
                cssClass: getClassName(body.length)
            });
            this.chatReceived.emit();
            this.messageToSend = '';
            this.scrollToLastMessage();
        });
        this.activeChannel.on('messageUpdated', ({ message }: any) => {
            this.chatReceived.emit();
            let messageToUpdate = find(this.activeChannelMessages, { index: message.index });
            if (messageToUpdate) { messageToUpdate = { ...message }; }
        });
        this.activeChannel.on('typingStarted', (member: { getUser: () => Promise<any>; identity: any; }) => {
            member.getUser().then(user => {
                this.typingMembers.add(user.friendlyName || member.identity);
                this.updateTypingIndicator();
            });
        });
        this.activeChannel.on('typingEnded', (member: { getUser: () => Promise<{ friendlyName: any; }>; identity: any; }) => {
            member.getUser().then((user: { friendlyName: any; }) => {
                this.typingMembers.delete(user.friendlyName || member.identity);
                this.updateTypingIndicator();
            });
        });
    }

    private subscribeToClientEvents() {
        this.onTokenRefreshEvent();
        this.onChannelEvents();
        this.onConnectionStateEvents();
    }

    private updateTypingIndicator() {
        const members = Array.from(this.typingMembers).slice(0, 3);
        const typingCount = size(this.typingMembers);
        if (typingCount > 0) {
            switch (typingCount) {
                case 1:
                    this.typingMsg = first(members) + ' is typing...';
                    break;
                case 2:
                case 3:
                    this.typingMsg = members.slice(0, typingCount - 1).join(', ')
                        + ' and ' + last(members) + ' are typing...';
                    break;
                default:
                    this.typingMsg = first(members) + ', and ' + (typingCount - 1) + 'more are typing';
            }
        } else {
            this.typingMsg = '';
        }
    }

}
