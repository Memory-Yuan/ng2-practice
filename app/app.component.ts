import { Component, OnInit, AfterViewInit, ViewChild, ElementRef } from '@angular/core';

export enum Mode {
    TWOCARD, FLIP
}

@Component({
    moduleId: module.id,
    selector: 'my-app',
    templateUrl: 'app.component.html',
    styleUrls: ['app.component.css']
})
export class AppComponent implements OnInit, AfterViewInit {

    readonly InitCardStyle: any = {
        transform: `translate(0, 0)`
    };
    cardStyle: any = Object.assign({}, this.InitCardStyle);

    mode: Mode = Mode.TWOCARD;

    modeType = Mode;

    ngOnInit() { }

    ngAfterViewInit() { }

    handlePan(e: HammerInput) {
        console.log("pan", e);
        if (e.type === "panstart") {
            this.cardStyle = Object.assign({}, this.InitCardStyle);
        } else if (e.isFinal) {
            this.cardStyle.transition = "transform 100ms ease-out";
            this.cardStyle.transform = `translate(0, 0)`;
        } else {
            this.cardStyle.transform = `translate(${e.deltaX}px, ${e.deltaY}px)`;
        }
    }

    changeMode() {
        this.mode = this.mode === Mode.TWOCARD ? Mode.FLIP : Mode.TWOCARD;
    }
}
