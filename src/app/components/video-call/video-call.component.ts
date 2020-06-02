import { Component, AfterViewInit } from '@angular/core';

@Component({
    selector: 'app-video-call',
    templateUrl: './video-call.component.html'
})
export class VideoCallComponent implements AfterViewInit {

    public innerHeight: number;

    public ngAfterViewInit(): void {
        setTimeout(() => {
            this.innerHeight = window.innerHeight;
            window.addEventListener('resize', () => { this.innerHeight = window.innerHeight; });
        });
    }
}
