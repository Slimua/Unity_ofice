/**
 * Copyright 2023-present DreamNum Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { Disposable } from '@univerjs/core';
import type { Nullable } from '@univerjs/core';
import { BehaviorSubject } from 'rxjs';

export const DEFAULT_FRAME_SAMPLE_SIZE = 60;

export const DEFAULT_FRAME_LIST_SIZE = 60 * 60; // 1min

const DEFAULT_ONE_SEC_MS = 1000;

const DEFAULT_FRAME_TIME = 16.67; // 60FPS
export interface ISampleFrameInfo {
    FPS: number;
    frameTime: number; // frame time in milliseconds
}

export interface ISummaryFrameData {
    avgFrameTime: number;
    minFrameTime: number;
    maxFrameTime: number;
}
/**
 * Performance monitor tracks rolling average frame-time and frame-time variance over a user defined sliding-window
 */
export class PerformanceMonitor extends Disposable {
    private _enabled: boolean = true;

    private _rollingFrameTime!: RollingAverage;

    private _lastFrameTimeMs: Nullable<number>;

    private _lastSecondTime: Nullable<number>;

    private _frameCountInLastSecond: number = 0;

    private _recFPSValueLastSecond: number = 60;

    protected _frameCount: number = 0; // number of all frames in whole life time.

    protected _frameSampleSize: number = 0;

    /**
     * frameTime list in past second
     */
    protected _frameTimeListPassedSec: Partial<ISampleFrameInfo>[] = [];
    sampleFrameList$ = new BehaviorSubject<Partial<ISampleFrameInfo>[]>([]);

    /**
     * constructor
     * @param frameSampleSize The number of samples required to saturate the sliding window
     */
    constructor(frameSampleSize: number = DEFAULT_FRAME_SAMPLE_SIZE) {
        super();
        this._frameSampleSize = frameSampleSize;
        this._rollingFrameTime = new RollingAverage(frameSampleSize);
    }

    override dispose(): void {
        super.dispose();
        this.sampleFrameList$.complete();
        this._frameTimeListPassedSec = [];
    }

    /**
     * Returns the average frame time in milliseconds of the sliding window (or the subset of frames sampled so far)
     */
    get averageFrameTime(): number {
        return this._rollingFrameTime.averageFrameTime;
    }

    /**
     * Returns the variance frame time in milliseconds over the sliding window (or the subset of frames sampled so far)
     */
    get averageFrameTimeVariance(): number {
        return this._rollingFrameTime.variance;
    }

    /**
     * Returns the frame time of the last recent frame
     */
    get instantaneousFrameTime(): number {
        return this._rollingFrameTime.history(0);
    }

    /**
     * Returns the average framerate in frames per second over the sliding window (or the subset of frames sampled so far)
     */
    get averageFPS(): number {
        return this._recFPSValueLastSecond;
    }

    /**
     * Returns the average framerate in frames per second using the most recent frame time
     */
    get instantaneousFPS(): number {
        const history = this._rollingFrameTime.history(0);

        if (history === 0) {
            return 0;
        }

        return DEFAULT_ONE_SEC_MS / history;
    }

    /**
     * Returns true if enough samples have been taken to completely fill the sliding window
     */
    get isSaturated(): boolean {
        return this._rollingFrameTime.isSaturated();
    }

    /**
     * Returns true if sampling is enabled
     */
    get isEnabled(): boolean {
        return this._enabled;
    }

    /**
     * Samples current frame, set averageFPS instantaneousFrameTime
     * this method is called each frame by engine renderLoop  --> endFrame.
     * @param timestamp A timestamp in milliseconds of the current frame to compare with other frames
     */
    sampleFrame(timestamp: number = this.Now()) {
        if (!this._enabled) {
            return;
        }
        this._frameCount++;
        this._frameCountInLastSecond++;
        if (this._lastSecondTime != null) {
            const oneSecPassed = this._lastSecondTime <= timestamp - DEFAULT_ONE_SEC_MS;
            if (oneSecPassed) {
                const passedTime = timestamp - this._lastSecondTime;
                this._recFPSValueLastSecond = Math.round(this._frameCountInLastSecond / passedTime * DEFAULT_ONE_SEC_MS);
                this._lastSecondTime = timestamp;
                this._frameCountInLastSecond = 0;
            }
        } else {
            this._lastSecondTime = timestamp;
        }

        if (this._lastFrameTimeMs != null) {
            const dt = timestamp - this._lastFrameTimeMs;
            //  set averageFPS instantaneousFrameTime
            this._rollingFrameTime.add(dt);
            this._rollingFrameTime.calcAverageFrameTime();

            this._frameTimeListPassedSec.push({
                frameTime: dt,
            });
            this.sampleFrameList$.next([...this._frameTimeListPassedSec]);
        }

        if (this._frameTimeListPassedSec.length > DEFAULT_FRAME_LIST_SIZE) {
            this._frameTimeListPassedSec = [];
        }

        this._lastFrameTimeMs = timestamp;
    }

    Now(): number {
        if (performance && performance.now) {
            return performance.now();
        }

        return Date.now();
    }

    /**
     * Enables contributions to the sliding window sample set
     */
    enable() {
        this._enabled = true;
    }

    /**
     * Disables contributions to the sliding window sample set
     * Samples will not be interpolated over the disabled period
     */
    disable() {
        this._enabled = false;
        // clear last sample to avoid interpolating over the disabled period when next enabled
        this._lastFrameTimeMs = null;
    }

    /**
     * Resets performance monitor
     */
    reset() {
        // clear last sample to avoid interpolating over the disabled period when next enabled
        this._lastFrameTimeMs = null;
        // wipe record
        this._rollingFrameTime.reset();
    }
}

/**
 * RollingAverage
 *
 * Utility to efficiently compute the rolling average and variance over a sliding window of samples
 */
export class RollingAverage {
    /**
     * Current average
     */
    averageFrameTime: number = DEFAULT_FRAME_TIME;

    /**
     * Current variance
     */
    variance: number = 0;

    protected _samples: number[] = [];

    /**
     * for isStaturated
     * max value of _sampleCount is length of _samples
     */
    protected _sampleCount: number = 0;

    protected _pos: number = 0;

    protected _m2: number = 0; // sum of squares of differences from the (current) mean

    /**
     * constructor
     * @param length The number of samples required to saturate the sliding window
     */
    constructor(length: number) {
        this._samples = new Array<number>(length);
        this.reset();
    }

    calcAverageFrameTime() {
        const frameDuration = this.history(0);
        let delta: number;

        // we need to check if we've already wrapped round
        if (this.isSaturated()) {
            // remove bottom of stack from mean
            const bottomValue = this._samples[this._pos];
            delta = bottomValue - this.averageFrameTime;
            // this.averageFrameTime -= delta / (this._sampleCount - 1);
            this._m2 -= delta * (bottomValue - this.averageFrameTime);
        } else {
            this._sampleCount++;
        }

        const min = Math.min(...this._samples);
        const max = Math.min(...this._samples);
        const filteredData = this._samples.filter((v) => v !== max && v !== min);
        this.averageFrameTime = filteredData.reduce((sum, value) => sum + value, 0) / filteredData.length;

        // add new value to mean
        delta = frameDuration - this.averageFrameTime;

        this._m2 += delta * (frameDuration - this.averageFrameTime);

        // set the new variance
        this.variance = this._m2 / (this._sampleCount - 1);
    }

    /**
     * Adds a sample to the sample set
     * @param frameDuration The sample value
     */
    add(frameDuration: number) {
        // http://en.wikipedia.org/wiki/Algorithms_for_calculating_variance
        this._samples[this._pos] = frameDuration;
        this._pos = ++this._pos % this._samples.length; // positive wrap around
    }

    /**
     * Returns previously added values or null if outside of history or outside the sliding window domain
     * @param i Index in history. For example, pass 0 for the most recent value and 1 for the value before that
     * @return Value previously recorded with add() or null if outside of range
     */
    history(i: number): number {
        if (i >= this._sampleCount || i >= this._samples.length) {
            return 0;
        }

        const i0 = this._wrapPosition(this._pos - 1.0);
        return this._samples[this._wrapPosition(i0 - i)];
    }

    /**
     * Returns true if enough samples have been taken to completely fill the sliding window
     * @return true if sample-set saturated
     */
    isSaturated(): boolean {
        return this._sampleCount >= this._samples.length;
    }

    /**
     * Resets the rolling average (equivalent to 0 samples taken so far)
     */
    reset() {
        this.averageFrameTime = DEFAULT_FRAME_TIME;
        this.variance = 0;
        this._sampleCount = 0;
        this._pos = 0;
        this._m2 = 0;
    }

    /**
     * Wraps a value around the sample range boundaries
     * @param i Position in sample range, for example if the sample length is 5, and i is -3, then 2 will be returned.
     * @return Wrapped position in sample range
     */
    protected _wrapPosition(i: number): number {
        const max = this._samples.length;
        return ((i % max) + max) % max;
    }
}
