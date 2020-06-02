import { Component } from '@angular/core';

@Component({
    selector: 'app-sms',
    templateUrl: './sms.component.html',
    styleUrls: ['./sms.component.scss']
})
export class SmsComponent {

    public targetNumber: string;

    public message: string;

    public sendSms() {
    }

}
