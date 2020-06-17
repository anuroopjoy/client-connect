// tslint:disable: no-any
import { Component, ElementRef, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { each, eq, find, first, isEmpty, isUndefined, last, size } from 'lodash-es';

import { getRoleByName } from 'src/app/constants/user-details.constants';
import { ClientService } from 'src/app/services/client-details.service';
import { HttpService } from 'src/app/services/http.service';
import { environment, IApiDefinition } from 'src/environments/environment';

import {
    CONNECTION_STATUS, DEFAULT_CHANNEL, getUserToDisplay, IConnectionState, MAX_MSG_LINE_LENGTH
} from './chat-helper';

const Client = require('twilio-chat').Client;

@Component({
    selector: 'app-chat',
    templateUrl: './chat.component.html',
    styleUrls: ['./chat.component.scss']
})
export class ChatComponent implements OnInit {
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
    public isReady = false;
    public userName = '';
    public otherUser = { name: '', role: '', imgAttr: '' };

    private client: any;
    private apiConstants: { getToken?: IApiDefinition };

    @ViewChild('messagePanel') private messagePanel: ElementRef;

    constructor(private http: HttpService, private clientService: ClientService) {
        this.apiConstants = environment.apiConstants.features.chat;
    }

    public ngOnInit() {
        const { name, role } = this.clientService.getUserDetails();
        this.otherUser = getUserToDisplay(role);
        this.connect(name);
    }

    public connect(name: string) {
        this.userName = name;
        this.initializeChat();
    }

    public sendMessage() {
        if (this.activeChannel && !isEmpty(this.messageToSend)) {
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
        const channelName = this.clientService.returnId || DEFAULT_CHANNEL.name;
        this.client.createChannel({
            attributes: { description: DEFAULT_CHANNEL.description },
            friendlyName: channelName,
            isPrivate: false,
            uniqueName: channelName
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
            const { method, url, responseType } = this.apiConstants.getToken;
            this.http.request(method, url, { identity: this.userName, device: 'browser' }, responseType)
                .then((data: any) => {
                    const token = data.token ? data.token : data;
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
            const channelName = this.clientService.returnId || DEFAULT_CHANNEL.name;
            subscribedChannels = page.items
                .sort((a: { friendlyName: number; }, b: { friendlyName: number; }) => a.friendlyName > b.friendlyName);
            this.activeChannel = find(subscribedChannels, channel => channel.friendlyName === channelName);
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
                                    const channelName = this.clientService.returnId || DEFAULT_CHANNEL.name;
                                    if (qChannel.friendlyName === channelName) {
                                        this.activeChannel = qChannel;
                                        this.setActiveChannel();
                                    }
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

        this.client.getPublicChannelDescriptors()
            .then((page: any) => {
                updatePublicChannels(page);
            })
            .catch((error: any) => {
                console.error('ERROR! : Unable to get public channel details.', { error });
            });

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
            const { method, url, responseType } = this.apiConstants.getToken;
            this.http.request(method, url, { identity: this.userName, device: 'browser' }, responseType)
                .then((data: any) => {
                    const token = data.token ? data.token : data;
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
        setTimeout(() => { element.scrollTop = element.scrollHeight; }, 10);
    }

    private setActiveChannel() {

        const getMsgWidth = (len: number, author: string) => {
            let width = eq(this.userName, author) ? 20 : 22;
            // If length of the message is less than the author's name, consider author's name for msg length.
            len = len <= author.length ? author.length + 1 : len;
            width = len >= MAX_MSG_LINE_LENGTH ? width + MAX_MSG_LINE_LENGTH : width + len;
            return width + '%';
        };

        this.activeChannel.getMessages(30)
            .then((page: any) => {
                this.activeChannelMessages = page.items
                    .map((item: { author: any; body: any; index: any; dateUpdated: any; }) => {
                        const { author, body, index, dateUpdated } = item;
                        return {
                            author, body, dateUpdated, index,
                            msgWidth: getMsgWidth(body.length, author),
                            role: getRoleByName(author)
                        };
                    });
                this.isReady = true;
                this.scrollToLastMessage();
            });
        this.activeChannel.getMembers()
            .then((members: any) => {
                // This will provide the list of users.
                console.log(members);
            })
            .catch((error: any) => {
                console.error('ERROR! : Unable to get the member details.', { error });
            });
        this.activeChannel.on('messageAdded', (message: any) => {
            const { author, body, index, dateUpdated } = message;
            this.activeChannelMessages.push({
                author, body, dateUpdated, index,
                msgWidth: getMsgWidth(body.length, author),
                role: getRoleByName(author)
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
