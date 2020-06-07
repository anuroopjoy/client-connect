import { Component } from '@angular/core';
import { HttpService } from 'src/app/services/http.service';
import { ClientService } from 'src/app/services/client-details.service';
import { IApiDefinition, environment } from 'src/environments/environment';

@Component({
    selector: 'app-email',
    templateUrl: './email.component.html'
})
export class EmailComponent {

    public name: string;

    public status = '';

    public mail = {
        from: '',
        to: 'ajith.ionic@gmail.com',
        subject: '',
        body: ''
    };

    private today = new Date().toDateString();

    private apiConstants: { sendMail?: IApiDefinition };

    constructor(private clientService: ClientService, private http: HttpService) {
        this.apiConstants = environment.apiConstants.features.email;
        this.name = this.clientService.getUserDetails().name;
        this.mail = {
            ...this.mail,
            from: this.name,
            subject: `ClientConnect App - Mail sent By ${this.name}`,
            body: `
Hi,

    < Email Content Here >

Thank you,
${this.name}

Sent on: ${this.today}
`
        };

    }

    public sendMail() {
        this.status = 'Sending your e-mail...';
        const { method, url } = this.apiConstants.sendMail;
        this.http.request(method, url, {
            mailSubject: this.mail.subject,
            content: this.mail.body
        });
        setTimeout(() => {
            this.status = 'Your mail was sent successfully';
            this.mail.body = '';
        }, 1200);

        setTimeout(() => this.status = '', 3000);

    }

}
