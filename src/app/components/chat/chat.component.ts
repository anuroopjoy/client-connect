// tslint:disable: no-any
import { isEmpty, each } from 'lodash-es';

import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';

const twilioClient = require('twilio-chat');

@Component({
    selector: 'app-chat',
    templateUrl: './chat.component.html',
    styleUrls: ['./chat.component.scss']
})
export class ChatComponent {

    public channels: { [key: string]: any } = {
        joined: [], invited: [], unknown: []
    };
    public userName: string;

    private apiUrls = {
        getToken: '/Token/Index'
    };
    private client: any;

    constructor(private http: HttpClient) { }

    public onConnect() {
        if (!isEmpty(this.userName)) {
            this.initializeChat();
        }
    }

    private async getChannelDetails() {
        const updateChannels = (page: any) => {
            const subscribedChannels = page.items
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
        try {
            const page = await this.client.getSubscribedChannels();
            updateChannels(page);
        } catch (error) {
            console.log('Error occurred | Unable to get channel details', { error });
        }
    }

    private getConnectionState() {
        const onConnectionChange = () => {
            const state = this.client.connectionState;
            console.log(state);
        };
        this.client.on('connectionStateChanged', onConnectionChange);
    }

    private async initializeChat() {
        try {
            const response: any = await this.http.get(
                this.apiUrls.getToken, {
                params: { identity: this.userName, device: 'browser' }
            }).toPromise();
            const token = response.text;
            this.client = await (twilioClient.Chat.Client.create(token, { logLevel: 'info' }) as Promise<any>);
            this.subscribeToClientEvents();
        } catch (error) {
            console.log('Error occurred | Unable to fetch the chat service token', { error });
        }
    }

    private async subscribeToClientEvents() {
        this.tokenRefresh();
        this.getChannelDetails();
        this.getConnectionState();
    }

    private tokenRefresh() {
        const refreshToken = () => {
            try {
                const response: any = this.http.get(
                    this.apiUrls.getToken, {
                    params: { identity: this.userName, device: 'browser' }
                }).toPromise();
                this.client.updateToken(response.text);
            } catch (error) {
                console.log('Error occurred | Unable to refresh the chat service token', { error });
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
