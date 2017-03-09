// A     B
//  ┌───┐
//  │ ♥ │
//  └───┘
// C     D

import { Component, OnInit, AfterViewInit, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';

import {
    Mode,
    Edge, Corner, TouchAreaType, CornerAreaLength, Position,
    AnimationType, AnimationDuration, EasingFunctions
} from './const';

// (function () {
//     let requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame ||
//         window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;
//     window.requestAnimationFrame = requestAnimationFrame;
// })();

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
        shadow: {},
        cardBack: {}
    };

    coverCardStyle: any = Object.assign({}, this.InitStyle.coverCard);
    turningCardStyle: any = Object.assign({}, this.InitStyle.turningCard);
    maskStyle: any = Object.assign({}, this.InitStyle.mask);
    shadowStyle: any = Object.assign({}, this.InitStyle.shadow);
    cardBackStyle: any = Object.assign({}, this.InitStyle.cardBack);
    styleValForAnimation: {
        turningCardRotate: number,
        maskRotate: number,
        translateX: number,
        translateY: number,
        cardScale: number,
        shadowScale: number
    };

    mode: Mode = Mode.TWOCARD;
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
    isOnAnimate: boolean = false;

    PointA: HammerPoint = { x: 0, y: 0 };
    PointB: HammerPoint = { x: 0, y: 0 };
    PointC: HammerPoint = { x: 0, y: 0 };
    PointD: HammerPoint = { x: 0, y: 0 };
    funcLineAD: (x: number, y: number) => HammerPoint;
    funcLineBC: (x: number, y: number) => HammerPoint;

    // animateTimeout: any;

    animationID: number;
    animationStartTime: number = 0;
    animationDuration: number = AnimationDuration;

    constructor(private cdRef: ChangeDetectorRef) { }

    ngOnInit() { }

    ngAfterViewInit() {
        this.__initRef();
    }

    private __initRef() {
        if (this.cardRef && this.cardRef.nativeElement) {
            let element: HTMLDivElement = this.cardRef.nativeElement;
            this.cardRect = element.getBoundingClientRect();

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
            // console.log(this.cardRect);
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
        this.initial();
        this.mode = this.mode === Mode.TWOCARD ? Mode.FLIP : Mode.TWOCARD;
        this.cdRef.detectChanges();
        this.mode === Mode.FLIP && this.__initRef();
    }

    handleTurn(e: HammerInput) {
        if (this.isTurnFin || this.isOnAnimate) { return; }

        this.touchPoint = e.center;

        if (e.type === "panstart") {
            // console.log(`touch: (${this.touchPoint.x}, ${this.touchPoint.y})`);
            this.turningCardStyle = Object.assign({}, this.InitStyle.turningCard);
            this.maskStyle = Object.assign({}, this.InitStyle.mask, { width: `${this.cardRect.height * 2}px`, height: `${this.cardRect.height * 2}px` });
            this.shadowStyle = Object.assign({}, this.InitStyle.shadow);
            this.cardBackStyle = Object.assign({}, this.InitStyle.cardBack);
            // this.isTurning = true;

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
                        this.turningCardStyle.top = 0;
                        this.turningCardStyle.left = 0;
                        this.turningCardStyle.transformOrigin = Position.TOP;
                        // this.turningCardStyle.boxShadow = "rgba(0, 0, 0, 0.4) 0px -32px 40px 5px";
                        this.maskStyle.bottom = "100%";
                        this.maskStyle.left = `${-(this.cardRect.height * 2 - this.cardRect.width) / 2}px`;
                        this.shadowStyle.width = `${this.cardRect.width}px`;
                    },
                    [Edge.CD]: () => {
                        this.turningCardStyle.top = "100%";
                        this.turningCardStyle.left = 0;
                        this.turningCardStyle.transformOrigin = Position.TOP;
                        // this.turningCardStyle.boxShadow = "rgba(0, 0, 0, 0.4) 0px -32px 40px 5px";
                        this.maskStyle.top = "100%";
                        this.maskStyle.left = `${-(this.cardRect.height * 2 - this.cardRect.width) / 2}px`;
                        this.shadowStyle.width = `${this.cardRect.width}px`;
                    },
                    [Edge.AC]: () => {
                        this.turningCardStyle.top = 0;
                        this.turningCardStyle.left = "-100%";
                        this.turningCardStyle.transformOrigin = Position.RIGHT;
                        // this.turningCardStyle.boxShadow = "rgba(0, 0, 0, 0.4) 32px 0px 40px 5px";
                        this.maskStyle.top = "-50%";
                        this.maskStyle.right = "100%";
                        this.shadowStyle.width = `${this.cardRect.height}px`;
                    },
                    [Edge.BD]: () => {
                        this.turningCardStyle.top = 0;
                        this.turningCardStyle.left = "100%";
                        this.turningCardStyle.transformOrigin = Position.LEFT;
                        // this.turningCardStyle.boxShadow = "rgba(0, 0, 0, 0.4) -32px 0px 40px 5px";
                        this.maskStyle.top = "-50%";
                        this.maskStyle.left = "100%";
                        this.shadowStyle.width = `${this.cardRect.height}px`;
                    }
                };
                edgeObj[touchArea.value] && edgeObj[touchArea.value]();
            }
        }

        this.styleValForAnimation = {
            turningCardRotate: 0,
            maskRotate: 0,
            translateX: 0,
            translateY: 0,
            cardScale: 0,
            shadowScale: 0
        };

        if (this.touchAreaType === TouchAreaType.EDGE) {
            let tr: number;
            let obj = {
                [Edge.AB]: () => {
                    tr = this.touchPoint.y - this.cardRect.top;
                    tr > 0 && (this.styleValForAnimation.translateY = tr);
                    this.styleValForAnimation.maskRotate = 180;
                    this.styleValForAnimation.turningCardRotate = 180;
                },
                [Edge.CD]: () => {
                    tr = -(this.cardRect.bottom - this.touchPoint.y);
                    tr < 0 && (this.styleValForAnimation.translateY = tr);
                    // this.styleValForAnimation.maskRotate = 0;
                    // this.styleValForAnimation.turningCardRotate = 0;
                },
                [Edge.AC]: () => {
                    tr = this.touchPoint.x - this.cardRect.left;
                    tr > 0 && (this.styleValForAnimation.translateX = tr);
                    this.styleValForAnimation.maskRotate = 90;
                    // turningCardRotate = 0;
                },
                [Edge.BD]: () => {
                    tr = -(this.cardRect.right - this.touchPoint.x);
                    tr < 0 && (this.styleValForAnimation.translateX = tr);
                    this.styleValForAnimation.maskRotate = -90;
                    // turningCardRotate = 0;
                }
            };

            obj[this.touchEdge] && obj[this.touchEdge]();

            let trXY = Math.abs(this.styleValForAnimation.translateX) + Math.abs(this.styleValForAnimation.translateY);
            let v = trXY > 100 ? 100 : trXY;
            this.styleValForAnimation.cardScale = 1 + v * 0.05 / 100;
            this.styleValForAnimation.shadowScale = v / 100;

            this.isTurning = trXY > 0;

        } else if (this.touchAreaType === TouchAreaType.CORNER) {
            // this.isTurning = ?;
        }

        this.cardBackStyle.transform = `translate(${-this.styleValForAnimation.translateX / 2}px, ${-this.styleValForAnimation.translateY / 2}px)`;
        this.turningCardStyle.transform = `translate(${this.styleValForAnimation.translateX}px, ${this.styleValForAnimation.translateY}px) rotate(${this.styleValForAnimation.turningCardRotate}deg) scale(${this.styleValForAnimation.cardScale})`;
        this.shadowStyle.transform = `translate(-50%) scaleY(${this.styleValForAnimation.shadowScale})`;
        this.maskStyle.transform = `translate(${this.styleValForAnimation.translateX / 2}px, ${this.styleValForAnimation.translateY / 2}px) rotate(${this.styleValForAnimation.maskRotate}deg) scaleX(${this.styleValForAnimation.cardScale})`;

        if (e.isFinal) {
            if (Math.abs(this.styleValForAnimation.translateX) > this.cardRect.width * 0.6 || Math.abs(this.styleValForAnimation.translateY) > this.cardRect.height * 0.6) {
                this.isTurnFin = true;
                this.startAnimation(AnimationType.FINISH, 300);
            } else {
                this.startAnimation(AnimationType.BACK, 300);
            }
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
        this.isOnAnimate = false;
        // this.animateTimeout && clearTimeout(this.animateTimeout);
        this.animationID && cancelAnimationFrame(this.animationID);
    }

    startAnimation(animation: AnimationType, duration?: number) {
        this.animationStartTime = Date.now();
        this.animationID && cancelAnimationFrame(this.animationID);
        this.animationDuration = !!duration ? duration : AnimationDuration;
        this.isOnAnimate = true;
        if (animation === AnimationType.FINISH) {
            this.animationID = requestAnimationFrame(() => this.__updateFinish());
        } else if (animation === AnimationType.BACK) {
            this.animationID = requestAnimationFrame(() => this.__updateBack());
        }
    }

    private __updateFinish() {
        let currentTime = Date.now(),
            progress = (currentTime - this.animationStartTime) / this.animationDuration;
        progress > 1 && (progress = 1);

        let progressEase = EasingFunctions.easeInCubic(progress);

        let finTurnTrX = 0,
            finTurnTrY = 0,
            turnTrX = this.styleValForAnimation.translateX,
            turnTrY = this.styleValForAnimation.translateY,
            finMaskTrX = 0,
            finMaskTrY = 0,
            maskTrX = this.styleValForAnimation.translateX / 2,
            maskTrY = this.styleValForAnimation.translateY / 2,
            shadowScale = 0;

        if (turnTrX !== 0) {
            finTurnTrX = turnTrX > 0 ? this.cardRect.width : -this.cardRect.width;
            finMaskTrX = finTurnTrX - finTurnTrX * this.styleValForAnimation.cardScale;
        }
        if (turnTrY !== 0) {
            finTurnTrY = turnTrY > 0 ? this.cardRect.height : -this.cardRect.height;
            finMaskTrY = finTurnTrY - finTurnTrY * this.styleValForAnimation.cardScale;
        }
        turnTrX += (finTurnTrX - turnTrX) * progressEase;
        turnTrY += (finTurnTrY - turnTrY) * progressEase;
        maskTrX += (finMaskTrX - maskTrX) * progressEase;
        maskTrY += (finMaskTrY - maskTrY) * progressEase;

        let v = Math.abs(maskTrX - finMaskTrX) + Math.abs(maskTrY - finMaskTrY);
        v = v > 100 ? 100 : v;
        shadowScale = v / 100;

        this.cardBackStyle.opacity = 0;
        this.turningCardStyle.transform = `translate(${turnTrX}px, ${turnTrY}px) rotate(${this.styleValForAnimation.turningCardRotate}deg) scale(${this.styleValForAnimation.cardScale})`;
        this.shadowStyle.transform = `translate(-50%) scaleY(${shadowScale})`;
        this.maskStyle.transform = `translate(${maskTrX}px, ${maskTrY}px) rotate(${this.styleValForAnimation.maskRotate}deg) scaleX(${this.styleValForAnimation.cardScale})`;

        if (progress < 1) {
            this.animationID = requestAnimationFrame(() => this.__updateFinish());
        } else {
            this.maskStyle.opacity = 0;
            this.isOnAnimate = false;
        }
    }

    private __updateBack() {
        let currentTime = Date.now(),
            progress = (currentTime - this.animationStartTime) / this.animationDuration;
        progress > 1 && (progress = 1);
        let progressEase = EasingFunctions.easeInCubic(progress);

        let turnTrX = this.styleValForAnimation.translateX,
            turnTrY = this.styleValForAnimation.translateY,
            maskTrX = this.styleValForAnimation.translateX / 2,
            maskTrY = this.styleValForAnimation.translateY / 2,
            cardScale = 0,
            shadowScale = 0;

        turnTrX += (0 - turnTrX) * progressEase;
        turnTrY += (0 - turnTrY) * progressEase;
        maskTrX += (0 - maskTrX) * progressEase;
        maskTrY += (0 - maskTrY) * progressEase;

        let trXY = Math.abs(turnTrX) + Math.abs(turnTrY);
        let v = trXY > 100 ? 100 : trXY;
        cardScale = 1 + 0.05 * v / 100;
        shadowScale = v / 100;

        this.cardBackStyle.transform = `translate(${-maskTrX}px, ${-maskTrY}px)`;
        this.turningCardStyle.transform = `translate(${turnTrX}px, ${turnTrY}px) rotate(${this.styleValForAnimation.turningCardRotate}deg) scale(${cardScale})`;
        this.shadowStyle.transform = `translate(-50%) scaleY(${shadowScale})`;
        this.maskStyle.transform = `translate(${maskTrX}px, ${maskTrY}px) rotate(${this.styleValForAnimation.maskRotate}deg) scaleX(${cardScale})`;

        if (progress < 1) {
            this.animationID = requestAnimationFrame(() => this.__updateBack());
        } else {
            this.initial();
        }
    }
}
