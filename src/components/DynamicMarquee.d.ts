/// <reference types="resize-observer-browser" />
import Vue from 'vue';
interface ProgressElement {
    progress: number;
    id: number;
}
declare const _default: import("vue").VueConstructor<{
    wrapperDimension: number;
    marqueeDimension: number;
    wrapperDirection: string;
    repeatNum: number;
    lastId: number;
    marqueeElement: HTMLElement | null;
    animatedElements: ProgressElement[];
    unanimatedElements: ProgressElement[];
    pauseInner: boolean;
    lastTime: number;
    resizeElementId: number;
    resizeObserver: ResizeObserver | null;
    deletedElements: number[];
    marqueeNoDimension: boolean;
    testData: {
        inTest: boolean;
        wrapperDimension: number;
        marqueeDimension: number;
        wrapperDirection: string;
    };
} & {
    positivise(num: number): number;
    signNum(num: number): number;
    calcWrapperDimension(): void;
    calcMarqueeDimension(): void;
    calcDimensions(): void;
    calcRepeatNum(): number;
    initialAnimationData(): Promise<void>;
    translateMarquee(index: number, currentTime: number): void;
    ppsProgressFromElapsed(elapsed: number): number;
    durationProgressFromElapsed(elapsed: number): number;
    getCurrentProgress(elapsed: number): number;
    revealNextElement(index: number, currentTime: number): void;
    elementFinishedTranslate(index: number): void;
    updateLastTime(currentTime: number): void;
    calcTranslation(currentTime: number): void;
    togglePause(event: Event): void;
    setWrapperDirection(): void;
    setResizeObserver(): Promise<void>;
    onResize(entries: readonly ResizeObserverEntry[]): void;
    onWrapperResize(newDimension: number): void;
    onMarqueeElementResize(newDimension: number): void;
    moveMinusToUnanimated(index: number): void;
    addOrRemoveElements(): Promise<void>;
    updateObservedElement(index: number): void;
    updateResizeId(): void;
    observeNewElement(): void;
    resetAnimation(): void;
    initialSetup(): void;
    fireAnimation(currentTime: number): void;
} & {
    allElements: ProgressElement[];
    dimension: "height" | "width";
    sign: "-" | "+";
} & {
    speed: any;
    repeat: boolean;
    repeatMargin: number;
    hoverPause: boolean;
    pause: boolean;
    direction: string;
    reverse: boolean;
} & Vue>;
export default _default;
