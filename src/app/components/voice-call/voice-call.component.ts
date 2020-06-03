// tslint:disable: no-any
import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

const Device = require('twilio-client').Device;

@Component({
    selector: 'app-voice-call',
    templateUrl: './voice-call.component.html',
    styleUrls: ['./voice-call.component.scss']
})
export class VoiceCallComponent implements OnInit {
    public mode = 'Customer'; // TO DO need to set this value from User profile
    // public mode = 'TaxPro';
    public status = 'Connecting to Twilio...';
    public noCallInProgress = true;
    public incomingCall = false;
    public answerCallback: () => void;

    constructor(private http: HttpClient) { }

    public async ngOnInit() {
        const param = this.mode === 'TaxPro' ? '/dashboard' : window.location.pathname;
        const data: any = await this.http.post('/token/generate', { page: param }).toPromise();
        // Set up the Twilio Client Device with the token
        Device.setup(data.token);
        this.handleCallbacks();
    }

    public callSupport() {
        this.status = 'Calling support...';
        Device.connect();
    }
    public hangUp() {
        Device.disconnectAll();
    }

    public callCustomer(phoneNumber: string) {
        this.status = `Calling ${phoneNumber}...`;
        const params = { phoneNumber };
        Device.connect(params);

    }
    private handleCallbacks() {
        Device.ready(() => {
            this.status = 'Ready';
        });
        Device.error((error: any) => {
            this.status = `ERROR: ${error.message}`;
        });

        /* Callback for when Twilio Client initiates a new connection */
        Device.connect((connection: any) => {
            // Enable the hang up button and disable the call buttons
            this.noCallInProgress = false;
            this.incomingCall = false;
            // If phoneNumber is part of the connection, this is a call from a
            // support agent to a customer's phone
            if ('phoneNumber' in connection.message) {
                this.status = 'In call with ' + connection.message.phoneNumber;
            } else {
                // This is a call from a website user to a support agent
                this.status = 'In call with support';
            }
        });

        /* Callback for when a call ends */
        Device.disconnect(() => {
            // Disable the hangup button and enable the call buttons
            this.noCallInProgress = true;
            this.status = 'Ready';
        });

        /* Callback for when Twilio Client receives a new incoming call */
        Device.incoming((connection: any) => {
            this.status = 'Incoming support call';

            // Set a callback to be executed when the connection is accepted
            connection.accept(() => {
                this.status = 'In call with customer';
            });
            // // Set a callback on the answer button and enable it
            this.incomingCall = true;
            this.answerCallback = () => {
                connection.accept();
            };
        });

    }
}
