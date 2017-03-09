export enum Mode {
    TWOCARD, FLIP
}

export enum Edge {
    AB, CD, AC, BD
}

export enum Corner {
    A, B, C, D
}

export enum TouchAreaType {
    EDGE, CORNER
}

export const CornerAreaLength = 40;

export type Position = "TOP" | "BOTTOM" | "LEFT" | "RIGHT" | "CENTER";

class PositionClass {
    TOP: "TOP" = "TOP";
    BOTTOM: "BOTTOM" = "BOTTOM";
    LEFT: "LEFT" = "LEFT";
    RIGHT: "RIGHT" = "RIGHT";
    CENTER: "CENTER" = "CENTER";
}

export const Position = new PositionClass();

export enum AnimationType {
    FINISH, BACK
}

export const AnimationDuration = 300;


/**
 * only considering the t value for the range [0, 1] => [0, 1]
 * use example: EasingFunctions.liner(t)
 */
const EaseIn = (power: number) => (t: number) => Math.pow(t, power);
const EaseOut = (power: number) => (t: number) => 1 - Math.abs(Math.pow(t - 1, power));
const EaseInOut = (power: number) => (t: number) => t < 0.5 ? EaseIn(power)(t * 2) / 2 : EaseOut(power)(t * 2 - 1) / 2 + 0.5;
export const EasingFunctions = {
    linear: EaseInOut(1),

    easeInQuad: EaseIn(2),
    easeOutQuad: EaseOut(2),
    easeInOutQuad: EaseInOut(2),

    easeInCubic: EaseIn(3),
    easeOutCubic: EaseOut(3),
    easeInOutCubic: EaseInOut(3),

    easeInQuart: EaseIn(4),
    easeOutQuart: EaseOut(4),
    easeInOutQuart: EaseInOut(4),

    easeInQuint: EaseIn(5),
    easeOutQuint: EaseOut(5),
    easeInOutQuint: EaseInOut(5),

    easeInElastic: (t: number) => (0.04 - 0.04 / t) * Math.sin(25 * t) + 1,
    easeOutElastic: (t: number) => 0.04 * t / (--t) * Math.sin(25 * t),
    easeInOutElastic: (t: number) => (t -= 0.5) < 0 ? (0.01 + 0.01 / t) * Math.sin(50 * t) : (0.02 - 0.01 / t) * Math.sin(50 * t) + 1,

    easeInSin: (t: number) => 1 + Math.sin(Math.PI / 2 * t - Math.PI / 2),
    easeOutSin: (t: number) => Math.sin(Math.PI / 2 * t),
    easeInOutSin: (t: number) => (1 + Math.sin(Math.PI * t - Math.PI / 2)) / 2
};

export type CardType = "club" | "diamond" | "heart" | "spade";

class CardTypeClass {
    CLUB: "club" = "club";
    DIAMOND: "diamond" = "diamond";
    HEART: "heart" = "heart";
    SPADE: "spade" = "spade";
}

export const CardType = new CardTypeClass();