import { describe, it, expect, beforeEach } from "bun:test";
import BlinkDiff from '../index.js';
import PNGImage from '../lib/png-image.js';
import fs from 'fs';

function generateImage(type) {
	var image;

	switch (type) {
		case "small-1":
			image = PNGImage.createImage(2, 2);
			image.setAt(0, 0, {red: 10, green: 20, blue: 30, alpha: 40});
			image.setAt(0, 1, {red: 50, green: 60, blue: 70, alpha: 80});
			image.setAt(1, 0, {red: 90, green: 100, blue: 110, alpha: 120});
			image.setAt(1, 1, {red: 130, green: 140, blue: 150, alpha: 160});
			break;

		case "small-2":
			image = PNGImage.createImage(2, 2);
			image.setAt(0, 0, {red: 210, green: 220, blue: 230, alpha: 240});
			image.setAt(0, 1, {red: 10, green: 20, blue: 30, alpha: 40});
			image.setAt(1, 0, {red: 50, green: 60, blue: 70, alpha: 80});
			image.setAt(1, 1, {red: 15, green: 25, blue: 35, alpha: 45});
			break;

		case "small-3":
			image = PNGImage.createImage(2, 2);
			break;

		case "medium-1":
			image = PNGImage.createImage(3, 3);
			image.setAt(0, 0, {red: 130, green: 140, blue: 150, alpha: 160});
			image.setAt(0, 1, {red: 170, green: 180, blue: 190, alpha: 200});
			image.setAt(0, 2, {red: 210, green: 220, blue: 230, alpha: 240});
			image.setAt(1, 0, {red: 15, green: 25, blue: 35, alpha: 45});
			image.setAt(1, 1, {red: 55, green: 65, blue: 75, alpha: 85});
			image.setAt(1, 2, {red: 95, green: 105, blue: 115, alpha: 125});
			image.setAt(2, 0, {red: 10, green: 20, blue: 30, alpha: 40});
			image.setAt(2, 1, {red: 50, green: 60, blue: 70, alpha: 80});
			image.setAt(2, 2, {red: 90, green: 100, blue: 110, alpha: 120});
			break;

		case "medium-2":
			image = PNGImage.createImage(3, 3);
			image.setAt(0, 0, {red: 95, green: 15, blue: 165, alpha: 26});
			image.setAt(0, 1, {red: 15, green: 225, blue: 135, alpha: 144});
			image.setAt(0, 2, {red: 170, green: 80, blue: 210, alpha: 2});
			image.setAt(1, 0, {red: 50, green: 66, blue: 23, alpha: 188});
			image.setAt(1, 1, {red: 110, green: 120, blue: 63, alpha: 147});
			image.setAt(1, 2, {red: 30, green: 110, blue: 10, alpha: 61});
			image.setAt(2, 0, {red: 190, green: 130, blue: 180, alpha: 29});
			image.setAt(2, 1, {red: 10, green: 120, blue: 31, alpha: 143});
			image.setAt(2, 2, {red: 155, green: 165, blue: 15, alpha: 185});
			break;
	}

	return image;
}

describe('Blink-Diff', function () {

	describe('hasPassed', function () {
		let instance;

		beforeEach(function () {
			instance = new BlinkDiff({
				imageA: generateImage('small-1'),
				imageB: generateImage('small-1'),
				composition: false
			});
		});

			it('should pass when identical', function () {
				expect(instance.hasPassed(BlinkDiff.RESULT_IDENTICAL)).toBe(true);
			});

			it('should pass when similar', function () {
				expect(instance.hasPassed(BlinkDiff.RESULT_SIMILAR)).toBe(true);
			});

			it('should not pass when unknown', function () {
				expect(instance.hasPassed(BlinkDiff.RESULT_UNKNOWN)).toBe(false);
			});

			it('should not pass when different', function () {
				expect(instance.hasPassed(BlinkDiff.RESULT_DIFFERENT)).toBe(false);
			});
		});

	describe('isAboveThreshold', function () {
		let instance;

			beforeEach(function () {
			instance = new BlinkDiff({
				imageA: generateImage('small-1'),
				imageB: generateImage('small-1'),
				composition: false
			});
		});

		describe('Pixel threshold', function () {
				beforeEach(function () {
					instance._thresholdType = BlinkDiff.THRESHOLD_PIXEL;
					instance._threshold = 50;
				});

				it('should be below threshold', function () {
					expect(instance.isAboveThreshold(49)).toBe(false);
				});

				it('should be above threshold on border', function () {
					expect(instance.isAboveThreshold(50)).toBe(true);
				});

				it('should be above threshold', function () {
					expect(instance.isAboveThreshold(51)).toBe(true);
				});
			});

			describe('Percent threshold', function () {
				beforeEach(function () {
					instance._thresholdType = BlinkDiff.THRESHOLD_PERCENT;
					instance._threshold = 0.1;
				});

				it('should be below threshold', function () {
					expect(instance.isAboveThreshold(9, 100)).toBe(false);
				});

				it('should be above threshold on border', function () {
					expect(instance.isAboveThreshold(10, 100)).toBe(true);
				});

				it('should be above threshold', function () {
					expect(instance.isAboveThreshold(11, 100)).toBe(true);
				});
			});
		});

	describe('Image comparison', function () {
		let instance;

			beforeEach(function () {
			instance = new BlinkDiff({
				imageA: generateImage('small-1'),
				imageB: generateImage('small-1'),
				thresholdType: BlinkDiff.THRESHOLD_PIXEL,
				threshold: 3,
				composition: false
			});
		});

		it('should identify identical images', async function () {
			const result = await new Promise((resolve, reject) => {
				instance.run(function (err, result) {
					if (err) reject(err);
					else resolve(result);
				});
			});
			expect(result.code).toBe(BlinkDiff.RESULT_IDENTICAL);
			expect(result.differences).toBe(0);
		});

		it('should identify different images', async function () {
			instance._imageB = generateImage('small-2');
			const result = await new Promise((resolve, reject) => {
				instance.run(function (err, result) {
					if (err) reject(err);
					else resolve(result);
				});
			});
			expect(result.code).toBe(BlinkDiff.RESULT_DIFFERENT);
			expect(result.differences).toBeGreaterThan(0);
		});

		it('should write output file when specified', async function () {
			instance._imageOutputPath = import.meta.dir + '/tmp.png';
			await new Promise((resolve, reject) => {
				instance.run(function (err) {
					if (err) reject(err);
					else resolve();
				});
			});
			expect(fs.existsSync(import.meta.dir + '/tmp.png')).toBe(true);
			fs.unlinkSync(import.meta.dir + '/tmp.png');
		});

		it('should work with runWithPromise', async function () {
			var promise = instance.runWithPromise();
			expect(promise).toBeInstanceOf(Promise);
			const result = await promise;
			expect(result.code).toBe(BlinkDiff.RESULT_IDENTICAL);
		});
	});

	describe('Image loading', function () {
		let instance;

			beforeEach(function () {
			instance = new BlinkDiff({
				imageAPath: import.meta.dir + '/test2.png',
				imageBPath: import.meta.dir + '/test2.png',
				composition: false
			});
		});

		it('should load images from file paths', async function () {
				const result = await new Promise((resolve, reject) => {
					instance.run(function (err, result) {
						if (err) reject(err);
						else resolve(result);
					});
				});
			expect(result.code).toBe(BlinkDiff.RESULT_IDENTICAL);
		});

		it('should load images from Buffer', async function () {
			const buffer = fs.readFileSync(import.meta.dir + '/test2.png');
			instance._imageA = buffer;
			instance._imageB = buffer;
			instance._imageAPath = undefined;
			instance._imageBPath = undefined;

				const result = await new Promise((resolve, reject) => {
					instance.run(function (err, result) {
						if (err) reject(err);
						else resolve(result);
					});
				});
			expect(result.code).toBe(BlinkDiff.RESULT_IDENTICAL);
		});
	});

	describe('Cropping', function () {
		let instance;

		beforeEach(function () {
			instance = new BlinkDiff({
				imageA: generateImage('medium-1'),
				imageB: generateImage('medium-1'),
				thresholdType: BlinkDiff.THRESHOLD_PIXEL,
				threshold: 3,
				composition: false
			});
		});

		it('should crop image A', async function () {
			instance._cropImageA = {width: 1, height: 2};
				const result = await new Promise((resolve, reject) => {
					instance.run(function (err, result) {
						if (err) reject(err);
						else resolve(result);
					});
				});
			expect(result.dimension).toBe(2);
			});

		it('should crop image B', async function () {
				instance._cropImageB = {width: 1, height: 1};
				const result = await new Promise((resolve, reject) => {
					instance.run(function (err, result) {
						if (err) reject(err);
						else resolve(result);
					});
				});
				expect(result.dimension).toBe(1);
			});
	});

	describe('Image clipping', function () {
		let instance;

		beforeEach(function () {
			instance = new BlinkDiff({
				imageA: generateImage('small-1'),
				imageB: generateImage('medium-1'),
				thresholdType: BlinkDiff.THRESHOLD_PIXEL,
				threshold: 3,
				composition: false
			});
		});

		it('should clip images to smaller dimensions', async function () {
				const result = await new Promise((resolve, reject) => {
					instance.run(function (err, result) {
						if (err) reject(err);
						else resolve(result);
					});
				});
			expect(result.dimension).toBe(4); // Should clip to 2x2
		});
	});
});
