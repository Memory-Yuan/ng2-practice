// A     B
//  ┌───┐
//  │ ♥ │
//  └───┘
// C     D


import { Component, OnInit, AfterViewInit, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';

enum Mode {
    TWOCARD, FLIP
}

enum Edge {
    AB, CD, AC, BD
}

enum Corner {
    A, B, C, D
}

enum TouchAreaType {
    EDGE, CORNER
}

const CornerAreaLength = 40;

// type Position = "TOP" | "BOTTOM" | "LEFT" | "RIGHT" | "CENTER";

// class PositionClass {
//     TOP: "TOP" = "TOP";
//     BOTTOM: "BOTTOM" = "BOTTOM";
//     LEFT: "LEFT" = "LEFT";
//     RIGHT: "RIGHT" = "RIGHT";
//     CENTER: "CENTER" = "CENTER";
// }

// const Position = new PositionClass();

@Component({
    moduleId: module.id,
    selector: 'my-app',
    templateUrl: 'app.component.html',
    styleUrls: ['app.component.css']
})
export class AppComponent implements OnInit, AfterViewInit {

    @ViewChild("cardRef") cardRef: ElementRef;
    @ViewChild("touchRef") touchRef: ElementRef;

    readonly InitStyle: any = {
        coverCard: {},
        turningCard: {},
        mask: {},
        shadow: {
            height: "200px"
        },
        cardBack: {}
    }

    coverCardStyle: any = Object.assign({}, this.InitStyle.coverCard);
    turningCardStyle: any = Object.assign({}, this.InitStyle.turningCard);
    maskStyle: any = Object.assign({}, this.InitStyle.mask);
    shadowStyle: any = Object.assign({}, this.InitStyle.shadow);
    cardBackStyle: any = Object.assign({}, this.InitStyle.cardBack);

    mode: Mode = Mode.FLIP;
    modeType = Mode;
    cardRect: ClientRect = <any>{};
    touchRect: ClientRect = <any>{};
    oriPoint: HammerPoint = { x: 0, y: 0 };
    touchPoint: HammerPoint = { x: 0, y: 0 };
    midPoint: HammerPoint = { x: 0, y: 0 };
    topPoint: HammerPoint = { x: 0, y: 0 };
    bottomPoint: HammerPoint = { x: 0, y: 0 };
    leftPoint: HammerPoint = { x: 0, y: 0 };
    rightPoint: HammerPoint = { x: 0, y: 0 };
    // horizon: Position;
    // vertical: Position;

    touchAreaType: TouchAreaType = null;
    touchEdge: Edge = null;
    touchCorner: Corner = null;

    isTurning: boolean = false;
    isTurnFin: boolean = false;

    PointA: HammerPoint = { x: 0, y: 0 };
    PointB: HammerPoint = { x: 0, y: 0 };
    PointC: HammerPoint = { x: 0, y: 0 };
    PointD: HammerPoint = { x: 0, y: 0 };
    funcLineAD: (x: number, y: number) => HammerPoint;
    funcLineBC: (x: number, y: number) => HammerPoint;

    animateTimeout: any;

    constructor(private cdRef: ChangeDetectorRef) { }

    ngOnInit() { }

    ngAfterViewInit() {
        if (this.cardRef && this.cardRef.nativeElement) {
            let element: HTMLDivElement = this.cardRef.nativeElement;
            this.cardRect = element.getBoundingClientRect();
            this.cdRef.detectChanges();

            this.PointA = { x: this.cardRect.left, y: this.cardRect.top };
            this.PointB = { x: this.cardRect.right, y: this.cardRect.top };
            this.PointC = { x: this.cardRect.left, y: this.cardRect.bottom };
            this.PointD = { x: this.cardRect.right, y: this.cardRect.bottom };

            let mAD = (this.PointD.y - this.PointA.y) / (this.PointD.x - this.PointA.x);
            let mBC = -mAD;

            this.funcLineAD = (x, y) => {
                let p: HammerPoint = { x: x, y: y };
                if (x === null) {
                    p.x = (p.y - this.PointA.y) / mAD + this.PointA.x;
                } else if (y === null) {
                    p.y = mAD * (p.x - this.PointA.x) + this.PointA.y;
                }
                return p;
            }

            this.funcLineBC = (x, y) => {
                let p: HammerPoint = { x: x, y: y };
                if (x === null) {
                    p.x = (p.y - this.PointB.y) / mBC + this.PointB.x;
                } else if (y === null) {
                    p.y = mBC * (p.x - this.PointB.x) + this.PointB.y;
                }
                return p;
            }
            console.log(this.cardRect);
        }

        if (this.touchRef && this.touchRef.nativeElement) {
            let element: HTMLDivElement = this.touchRef.nativeElement;
            this.touchRect = element.getBoundingClientRect();
            this.cdRef.detectChanges();
        }
    }

    handlePan(e: HammerInput) {
        // console.log("pan", e);
        if (e.type === "panstart") {
            this.coverCardStyle = Object.assign({}, this.InitStyle.coverCard);
        } else if (e.isFinal) {
            this.coverCardStyle.transition = "transform 100ms ease-out";
            this.coverCardStyle.transform = `translate(0, 0)`;
        } else {
            this.coverCardStyle.transform = `translate(${e.deltaX}px, ${e.deltaY}px)`;
        }
    }

    changeMode() {
        this.isTurnFin = true;
        // this.mode = this.mode === Mode.TWOCARD ? Mode.FLIP : Mode.TWOCARD;
    }

    handleTurn(e: HammerInput) {
        if (this.isTurnFin) { return; }

        this.touchPoint = e.center;

        if (e.type === "panstart") {
            // console.log(`touch: (${this.touchPoint.x}, ${this.touchPoint.y})`);
            this.turningCardStyle = Object.assign({}, this.InitStyle.turningCard);
            this.maskStyle = Object.assign({}, this.InitStyle.mask, { width: `${this.cardRect.height * 2}px`, height: `${this.cardRect.height * 2}px` });
            this.shadowStyle = Object.assign({}, this.InitStyle.shadow);
            this.cardBackStyle = Object.assign({}, this.InitStyle.cardBack);
            this.isTurning = true;

            let touchArea = this.getTouchArea(this.touchPoint);
            this.touchAreaType = touchArea.type;
            if (touchArea.type === TouchAreaType.CORNER) {
                this.touchCorner = <Corner>touchArea.value;

                let cornerObj = {
                    [Corner.A]: () => {
                        this.oriPoint = this.PointA;
                    },
                    [Corner.B]: () => {
                        this.oriPoint = this.PointB;
                    },
                    [Corner.C]: () => {
                        this.oriPoint = this.PointC;
                    },
                    [Corner.D]: () => {
                        this.oriPoint = this.PointD;
                    }
                };
                cornerObj[touchArea.value] && cornerObj[touchArea.value]();

            } else if (touchArea.type === TouchAreaType.EDGE) {
                this.touchEdge = <Edge>touchArea.value;

                let edgeObj = {
                    [Edge.AB]: () => {
                        this.turningCardStyle.top = "-100%";
                        this.turningCardStyle.left = 0;
                        // this.turningCardStyle.boxShadow = "rgba(0, 0, 0, 0.4) 0px -32px 40px 5px";
                        this.maskStyle.bottom = "100%";
                        this.maskStyle.left = `${-(this.cardRect.height * 2 - this.cardRect.width) / 2}px`;
                        this.shadowStyle.width = `${this.cardRect.width}px`;
                    },
                    [Edge.CD]: () => {
                        this.turningCardStyle.top = "100%";
                        this.turningCardStyle.left = 0;
                        // this.turningCardStyle.boxShadow = "rgba(0, 0, 0, 0.4) 0px -32px 40px 5px";
                        this.maskStyle.top = "100%";
                        this.maskStyle.left = `${-(this.cardRect.height * 2 - this.cardRect.width) / 2}px`;
                        this.shadowStyle.width = `${this.cardRect.width}px`;
                    },
                    [Edge.AC]: () => {
                        this.turningCardStyle.top = 0;
                        this.turningCardStyle.left = "-100%";
                        // this.turningCardStyle.boxShadow = "rgba(0, 0, 0, 0.4) 32px 0px 40px 5px";
                        this.maskStyle.top = "-50%";
                        this.maskStyle.right = "100%";
                        this.shadowStyle.width = `${this.cardRect.height}px`;
                    },
                    [Edge.BD]: () => {
                        this.turningCardStyle.top = 0;
                        this.turningCardStyle.left = "100%";
                        // this.turningCardStyle.boxShadow = "rgba(0, 0, 0, 0.4) -32px 0px 40px 5px";
                        this.maskStyle.top = "-50%";
                        this.maskStyle.left = "100%";
                        this.shadowStyle.width = `${this.cardRect.height}px`;
                    }
                };
                edgeObj[touchArea.value] && edgeObj[touchArea.value]();
            }
        }

        let turningCardRotate: number = 0,
            maskRotate: number = 0,
            translateX: number = 0,
            translateY: number = 0,
            maskX: number = 0,
            maskY: number = 0;

        if (this.touchAreaType === TouchAreaType.EDGE) {
            let obj = {
                [Edge.AB]: () => {
                    translateY = this.touchPoint.y - this.cardRect.top;
                    maskRotate = 180;
                    turningCardRotate = 180;
                },
                [Edge.CD]: () => {
                    translateY = -(this.cardRect.bottom - this.touchPoint.y);
                    // maskRotate = 0;
                    // turningCardRotate = 0;
                },
                [Edge.AC]: () => {
                    translateX = this.touchPoint.x - this.cardRect.left;
                    maskRotate = 90;
                    // turningCardRotate = 0;
                },
                [Edge.BD]: () => {
                    translateX = -(this.cardRect.right - this.touchPoint.x);
                    maskRotate = -90;
                    // turningCardRotate = 0;
                }
            };

            obj[this.touchEdge] && obj[this.touchEdge]();
        } else if (this.touchAreaType === TouchAreaType.CORNER) {

        }

        // console.log(`trx: ${translateX}, try: ${translateY}`);
        if (e.isFinal) {
            let transitionMS: number = 300;
            this.cardBackStyle.transition = `transform ${transitionMS}ms ease-out`;
            this.turningCardStyle.transition = `transform ${transitionMS}ms ease-out, box-shadow ${transitionMS}ms ease-out`;
            this.maskStyle.transition = `transform ${transitionMS}ms ease-out`;

            if (Math.abs(translateX) > this.cardRect.width * 0.6 || Math.abs(translateY) > this.cardRect.height * 0.6) {
                // console.log("fin");

                // this.cardBackStyle.transition = `transform ${transitionMS}ms ease-out`;
                // this.turningCardStyle.transition = `transform ${transitionMS}ms ease-out, box-shadow ${transitionMS}ms ease-out`;
                // this.maskStyle.transition = `transform ${transitionMS}ms ease-out`;

                if (translateX !== 0) {
                    translateX = translateX > 0 ? this.cardRect.width : -this.cardRect.width;
                }

                if (translateY !== 0) {
                    translateY = translateY > 0 ? this.cardRect.height : -this.cardRect.height;
                }

                this.isTurnFin = true;

                this.animateTimeout && clearTimeout(this.animateTimeout);
                this.animateTimeout = setTimeout(() => {
                    this.cardBackStyle = Object.assign({}, this.InitStyle.cardBack);
                    this.turningCardStyle.transform = `translate(${translateX}px, ${translateY}px) rotate(${turningCardRotate}deg) scale(1)`;
                    this.turningCardStyle.boxShadow = "rgba(0, 0, 0, 0.3) 1px 1px 6px";
                    this.maskStyle.opacity = 0;
                }, 250);
            } else {
                translateX = 0;
                translateY = 0;
                this.animateTimeout && clearTimeout(this.animateTimeout);
                this.animateTimeout = setTimeout(() => {
                    this.initial();    
                }, 250);
            }
            // this.isTurning = false;
            // this.cardBackStyle = Object.assign({}, this.InitStyle.cardBack);
            // this.turningCardStyle = Object.assign({}, this.InitTurningCardStyle);
            // this.maskStyle = Object.assign({}, this.InitMaskStyle);
            // return;
        }

        this.cardBackStyle.transform = `translate(${-translateX / 2}px, ${-translateY / 2}px)`;
        this.turningCardStyle.transform = `translate(${translateX}px, ${translateY}px) rotate(${turningCardRotate}deg) scale(1.05)`;
        if (this.isTurnFin) {
            this.maskStyle.transform = `translate(0, 0) rotate(${maskRotate}deg) scale(1.05)`;
        } else {
            this.maskStyle.transform = `translate(${translateX / 2}px, ${translateY / 2}px) rotate(${maskRotate}deg) scale(1.05)`;
        }


        // if (this.vertical === Position.TOP) {
        //     translateY = this.touchPoint.y - this.cardRect.top;
        //     rotate = 180;
        // } else if (this.vertical === Position.BOTTOM) {
        //     translateY = -(this.cardRect.bottom - this.touchPoint.y);
        //     rotate = 0;
        // }

        // console.log(translateY);


        // this.midPoint = {
        //     x: (this.oriPoint.x + this.touchPoint.x) / 2,
        //     y: (this.oriPoint.y + this.touchPoint.y) / 2
        // };

        // let mTO: number = (this.touchPoint.y - this.oriPoint.y) / (this.touchPoint.x - this.oriPoint.x);

        // let func = (x: number, y: number) => {
        //     // P = (x, y)
        //     // mTO * mMP = -1
        //     // mMP = (this.midPoint.y - P.y) / (this.midPoint.x - P.x);
        //     let p: HammerPoint;
        //     if (x === null) {
        //         p = {
        //             x: mTO * (this.midPoint.y - y) + this.midPoint.x,
        //             y: y
        //         }
        //     } else if (y === null) {
        //         p = {
        //             x: x,
        //             y: (this.midPoint.x - x) / mTO + this.midPoint.y
        //         }
        //     }
        //     return p;
        // };

        // this.topPoint = func(null, this.cardRect.top);
        // this.bottomPoint = func(null, this.cardRect.bottom);
        // this.leftPoint = func(this.cardRect.left, null);
        // this.rightPoint = func(this.cardRect.right, null);

        // if (this.vertical === Position.TOP) {
        //     angleDeg = Math.atan2(this.topPoint.y - this.touchPoint.y, this.topPoint.x - this.touchPoint.x) * 180 / Math.PI;
        //     this.horizon === Position.LEFT && (angleDeg += 180);
        //     translateY = -(this.touchPoint.y - this.cardRect.top);
        // } else if (this.vertical === Position.BOTTOM) {
        //     angleDeg = Math.atan2(this.bottomPoint.y - this.touchPoint.y, this.bottomPoint.x - this.touchPoint.x) * 180 / Math.PI;
        //     translateY = this.cardRect.bottom - this.touchPoint.y;
        // }

        // if (this.horizon === Position.LEFT) {
        //     translateX = this.touchPoint.x - this.cardRect.left;
        // } else if (this.horizon === Position.RIGHT) {
        //     translateX = -(this.cardRect.right - this.touchPoint.x);
        // }

        // console.log(`translate(${translateX}px, ${translateY}px) rotate(${angleDeg}deg)`);

        // // translateX = 0;
        // // translateY = 0;
        // this.turningCardStyle.transform = `translate(${translateX}px, ${translateY}px) rotate(${angleDeg}deg)`;
    }

    getTouchArea(point: HammerPoint): { type: TouchAreaType, value: Edge | Corner } {
        let result = { type: <any>null, value: <any>null };

        // distance between touch point and top/bottom/left/right edge of touch area;
        let dPointTop = point.y - this.touchRect.top,
            dPointBtm = this.touchRect.bottom - point.y,
            dPointLft = point.x - this.touchRect.left,
            dPointRit = this.touchRect.right - point.x;

        if (dPointTop < CornerAreaLength && dPointLft < CornerAreaLength) {
            result.value = Corner.A;
            result.type = TouchAreaType.CORNER;
        } else if (dPointTop < CornerAreaLength && dPointRit < CornerAreaLength) {
            result.value = Corner.B;
            result.type = TouchAreaType.CORNER;
        } else if (dPointBtm < CornerAreaLength && dPointLft < CornerAreaLength) {
            result.value = Corner.C;
            result.type = TouchAreaType.CORNER;
        } else if (dPointBtm < CornerAreaLength && dPointRit < CornerAreaLength) {
            result.value = Corner.D;
            result.type = TouchAreaType.CORNER;
        } else {

            // point at line AD/AC
            let pAD = this.funcLineAD(point.x, null),
                pBC = this.funcLineBC(point.x, null);

            result.type = TouchAreaType.EDGE;

            if (point.y <= pAD.y) {
                result.value = point.y <= pBC.y ? Edge.AB : Edge.BD;
            } else {
                result.value = point.y <= pBC.y ? Edge.AC : Edge.CD;
            }
        }
        return result;
    }

    initial() {
        this.turningCardStyle = Object.assign({}, this.InitStyle.turningCard);
        this.maskStyle = Object.assign({}, this.InitStyle.mask);
        this.shadowStyle = Object.assign({}, this.InitStyle.shadow);
        this.cardBackStyle = Object.assign({}, this.InitStyle.cardBack);
        this.isTurning = false;
        this.isTurnFin = false;
        this.animateTimeout && clearTimeout(this.animateTimeout);
    }
}
