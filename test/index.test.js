
import { describe, it, expect, beforeEach } from "bun:test";
import BlinkDiff from '../index.js';
import PNGImage from 'pngjs-image';
import fs from 'fs';

function generateImage (type) {
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

		case "slim-1":
			image = PNGImage.createImage(1, 3);
			image.setAt(0, 0, {red: 15, green: 225, blue: 135, alpha: 144});
			image.setAt(0, 1, {red: 170, green: 80, blue: 210, alpha: 2});
			image.setAt(0, 2, {red: 50, green: 66, blue: 23, alpha: 188});
			break;

		case "slim-2":
			image = PNGImage.createImage(3, 1);
			image.setAt(0, 0, {red: 15, green: 225, blue: 135, alpha: 144});
			image.setAt(1, 0, {red: 170, green: 80, blue: 210, alpha: 2});
			image.setAt(2, 0, {red: 50, green: 66, blue: 23, alpha: 188});
			break;
	}

	return image;
}

function compareBuffer (buf1, buf2) {

	if (buf1.length !== buf2.length) {
		return false;
	}

	for (var i = 0, len = buf1.length; i < len; i++) {
		if (buf1[i] !== buf2[i]) {
			return false;
		}
	}

	return true;
}

describe('Blink-Diff', function () {

	describe('Default values', function () {

		let instance;

		beforeEach(function () {
			instance = new BlinkDiff({
				imageA: "image-a", imageAPath: "path to image-a", imageB: "image-b", imageBPath: "path to image-b",

				composition: false
			});
		});

		it('should have the right values for imageA', function () {
			expect(instance._imageA).toBe("image-a");
		});

		it('should have the right values for imageAPath', function () {
			expect(instance._imageAPath).toBe("path to image-a");
		});

		it('should have the right values for imageB', function () {
			expect(instance._imageB).toBe("image-b");
		});

		it('should have the right values for imageBPath', function () {
			expect(instance._imageBPath).toBe("path to image-b");
		});

		it('should not have a value for imageOutputPath', function () {
			expect(instance._imageOutputPath).toBeUndefined();
		});

		it('should not have a value for thresholdType', function () {
			expect(instance._thresholdType).toBe("pixel");
		});

		it('should not have a value for threshold', function () {
			expect(instance._threshold).toBe(500);
		});

		it('should not have a value for delta', function () {
			expect(instance._delta).toBe(20);
		});

		it('should not have a value for outputMaskRed', function () {
			expect(instance._outputMaskRed).toBe(255);
		});

		it('should not have a value for outputMaskGreen', function () {
			expect(instance._outputMaskGreen).toBe(0);
		});

		it('should not have a value for outputMaskBlue', function () {
			expect(instance._outputMaskBlue).toBe(0);
		});

		it('should not have a value for outputMaskAlpha', function () {
			expect(instance._outputMaskAlpha).toBe(255);
		});

		it('should not have a value for outputMaskOpacity', function () {
			expect(instance._outputMaskOpacity).toBe(0.7);
		});

		it('should not have a value for outputBackgroundRed', function () {
			expect(instance._outputBackgroundRed).toBe(0);
		});

		it('should not have a value for outputBackgroundGreen', function () {
			expect(instance._outputBackgroundGreen).toBe(0);
		});

		it('should not have a value for outputBackgroundBlue', function () {
			expect(instance._outputBackgroundBlue).toBe(0);
		});

		it('should not have a value for outputBackgroundAlpha', function () {
			expect(instance._outputBackgroundAlpha).toBeUndefined();
		});

		it('should not have a value for outputBackgroundOpacity', function () {
			expect(instance._outputBackgroundOpacity).toBe(0.6);
		});

		it('should not have a value for copyImageAToOutput', function () {
			expect(instance._copyImageAToOutput).toBe(true);
		});

		it('should not have a value for copyImageBToOutput', function () {
			expect(instance._copyImageBToOutput).toBe(false);
		});

		it('should not have a value for filter', function () {
			expect(instance._filter).toEqual([]);
		});

		it('should not have a value for debug', function () {
			expect(instance._debug).toBe(false);
		});

		describe('Special cases', function () {

			let specialInstance;

			beforeEach(function () {
				specialInstance = new BlinkDiff({
					imageA: "image-a", imageB: "image-b"
				});
			});

			it('should have the images', function () {
				expect(specialInstance._imageA).toBe("image-a");
				expect(specialInstance._imageB).toBe("image-b");
			});
		})
	});

	describe('Methods', function () {

		let instance;

		beforeEach(function () {
			instance = new BlinkDiff({
				imageA: "image-a", imageAPath: "path to image-a", imageB: "image-b", imageBPath: "path to image-b"
			});
		});

		describe('hasPassed', function () {

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

		describe('_colorDelta', function () {
			it('should calculate the delta', function () {
				var color1 = {
						c1: 23, c2: 87, c3: 89, c4: 234
					}, color2 = {
						c1: 84, c2: 92, c3: 50, c4: 21
					};

				const delta = instance._colorDelta(color1, color2);
				expect(delta).toBeGreaterThanOrEqual(225.02);
				expect(delta).toBeLessThanOrEqual(225.03);
			});
		});

		describe('_loadImage', function () {

			let image;

			beforeEach(function () {
				image = generateImage('medium-2');
			});

			describe('from Image', function () {

				it('should use already loaded image', function () {
					var result = instance._loadImage("pathToFile", image);

					expect(result).toBeInstanceOf(PNGImage);
					expect(result).toBe(image);
				});
			});

			describe('from Path', function () {

				it('should load image when only path given', async function () {
					var result = instance._loadImage(import.meta.dir + '/test2.png');

					expect(result).toBeInstanceOf(Promise);

					const loadedImage = await result;
					var compare = compareBuffer(loadedImage.getImage().data, image.getImage().data);
					expect(compare).toBe(true);
				});
			});

			describe('from Buffer', function () {

				let buffer;

				beforeEach(function () {
					buffer = fs.readFileSync(import.meta.dir + '/test2.png');
				});

				it('should load image from buffer if given', async function () {
					var result = instance._loadImage("pathToFile", buffer);

					expect(result).toBeInstanceOf(Promise);

					const loadedImage = await result;
					var compare = compareBuffer(loadedImage.getImage().data, image.getImage().data);
					expect(compare).toBe(true);
				});
			});
		});

		describe('_copyImage', function () {

			it('should copy the image', function () {
				var image1 = generateImage('small-1'), image2 = generateImage('small-2');

				instance._copyImage(image1, image2);

				expect(image1.getAt(0, 0)).toBe(image2.getAt(0, 0));
				expect(image1.getAt(0, 1)).toBe(image2.getAt(0, 1));
				expect(image1.getAt(1, 0)).toBe(image2.getAt(1, 0));
				expect(image1.getAt(1, 1)).toBe(image2.getAt(1, 1));
			});
		});

		describe('_correctDimensions', function () {

			describe('Missing Values', function () {

				it('should correct missing x values', function () {
					var rect = {y: 23, width: 42, height: 57};

					instance._correctDimensions(300, 200, rect);

					expect(rect.x).toBe(0);
					expect(rect.y).toBe(23);
					expect(rect.width).toBe(42);
					expect(rect.height).toBe(57);
				});

				it('should correct missing y values', function () {
					var rect = {x: 10, width: 42, height: 57};

					instance._correctDimensions(300, 200, rect);

					expect(rect.x).toBe(10);
					expect(rect.y).toBe(0);
					expect(rect.width).toBe(42);
					expect(rect.height).toBe(57);
				});

				it('should correct missing width values', function () {
					var rect = {x: 10, y: 23, height: 57};

					instance._correctDimensions(300, 200, rect);

					expect(rect.x).toBe(10);
					expect(rect.y).toBe(23);
					expect(rect.width).toBe(290);
					expect(rect.height).toBe(57);
				});

				it('should correct missing height values', function () {
					var rect = {x: 10, y: 23, width: 42};

					instance._correctDimensions(300, 200, rect);

					expect(rect.x).toBe(10);
					expect(rect.y).toBe(23);
					expect(rect.width).toBe(42);
					expect(rect.height).toBe(177);
				});

				it('should correct all missing values', function () {
					var rect = {};

					instance._correctDimensions(300, 200, rect);

					expect(rect.x).toBe(0);
					expect(rect.y).toBe(0);
					expect(rect.width).toBe(300);
					expect(rect.height).toBe(200);
				});
			});

			describe('Negative Values', function () {

				it('should correct negative x values', function () {
					var rect = {x: -10, y: 23, width: 42, height: 57};

					instance._correctDimensions(300, 200, rect);

					expect(rect.x).toBe(0);
					expect(rect.y).toBe(23);
					expect(rect.width).toBe(42);
					expect(rect.height).toBe(57);
				});

				it('should correct negative y values', function () {
					var rect = {x: 10, y: -23, width: 42, height: 57};

					instance._correctDimensions(300, 200, rect);

					expect(rect.x).toBe(10);
					expect(rect.y).toBe(0);
					expect(rect.width).toBe(42);
					expect(rect.height).toBe(57);
				});

				it('should correct negative width values', function () {
					var rect = {x: 10, y: 23, width: -42, height: 57};

					instance._correctDimensions(300, 200, rect);

					expect(rect.x).toBe(10);
					expect(rect.y).toBe(23);
					expect(rect.width).toBe(0);
					expect(rect.height).toBe(57);
				});

				it('should correct negative height values', function () {
					var rect = {x: 10, y: 23, width: 42, height: -57};

					instance._correctDimensions(300, 200, rect);

					expect(rect.x).toBe(10);
					expect(rect.y).toBe(23);
					expect(rect.width).toBe(42);
					expect(rect.height).toBe(0);
				});

				it('should correct all negative values', function () {
					var rect = {x: -10, y: -23, width: -42, height: -57};

					instance._correctDimensions(300, 200, rect);

					expect(rect.x).toBe(0);
					expect(rect.y).toBe(0);
					expect(rect.width).toBe(0);
					expect(rect.height).toBe(0);
				});
			});

			describe('Dimensions', function () {

				it('should correct too big x values', function () {
					var rect = {x: 1000, y: 23, width: 42, height: 57};

					instance._correctDimensions(300, 200, rect);

					expect(rect.x).toBe(299);
					expect(rect.y).toBe(23);
					expect(rect.width).toBe(1);
					expect(rect.height).toBe(57);
				});

				it('should correct too big y values', function () {
					var rect = {x: 10, y: 2300, width: 42, height: 57};

					instance._correctDimensions(300, 200, rect);

					expect(rect.x).toBe(10);
					expect(rect.y).toBe(199);
					expect(rect.width).toBe(42);
					expect(rect.height).toBe(1);
				});

				it('should correct too big width values', function () {
					var rect = {x: 11, y: 23, width: 4200, height: 57};

					instance._correctDimensions(300, 200, rect);

					expect(rect.x).toBe(11);
					expect(rect.y).toBe(23);
					expect(rect.width).toBe(289);
					expect(rect.height).toBe(57);
				});

				it('should correct too big height values', function () {
					var rect = {x: 11, y: 23, width: 42, height: 5700};

					instance._correctDimensions(300, 200, rect);

					expect(rect.x).toBe(11);
					expect(rect.y).toBe(23);
					expect(rect.width).toBe(42);
					expect(rect.height).toBe(177);
				});

				it('should correct too big width and height values', function () {
					var rect = {x: 11, y: 23, width: 420, height: 570};

					instance._correctDimensions(300, 200, rect);

					expect(rect.x).toBe(11);
					expect(rect.y).toBe(23);
					expect(rect.width).toBe(289);
					expect(rect.height).toBe(177);
				});
			});

			describe('Border Dimensions', function () {

				it('should correct too big x values', function () {
					var rect = {x: 300, y: 23, width: 42, height: 57};

					instance._correctDimensions(300, 200, rect);

					expect(rect.x).toBe(299);
					expect(rect.y).toBe(23);
					expect(rect.width).toBe(1);
					expect(rect.height).toBe(57);
				});

				it('should correct too big y values', function () {
					var rect = {x: 10, y: 200, width: 42, height: 57};

					instance._correctDimensions(300, 200, rect);

					expect(rect.x).toBe(10);
					expect(rect.y).toBe(199);
					expect(rect.width).toBe(42);
					expect(rect.height).toBe(1);
				});

				it('should correct too big width values', function () {
					var rect = {x: 11, y: 23, width: 289, height: 57};

					instance._correctDimensions(300, 200, rect);

					expect(rect.x).toBe(11);
					expect(rect.y).toBe(23);
					expect(rect.width).toBe(289);
					expect(rect.height).toBe(57);
				});

				it('should correct too big height values', function () {
					var rect = {x: 11, y: 23, width: 42, height: 177};

					instance._correctDimensions(300, 200, rect);

					expect(rect.x).toBe(11);
					expect(rect.y).toBe(23);
					expect(rect.width).toBe(42);
					expect(rect.height).toBe(177);
				});
			});
		});

		describe('_crop', function () {

			let croppedImage, expectedImage;

			beforeEach(function () {
				croppedImage = generateImage('medium-1');
				expectedImage = generateImage('medium-1');
			});

			it('should crop image', function () {
				instance._crop("Medium-1", croppedImage, {x: 1, y: 2, width: 2, height: 1});

				expect(croppedImage.getWidth()).toBe(2);
				expect(croppedImage.getHeight()).toBe(1);

				expect(croppedImage.getAt(0, 0)).toBe(expectedImage.getAt(1, 2));
				expect(croppedImage.getAt(1, 0)).toBe(expectedImage.getAt(2, 2));
			});
		});

		describe('_clip', function () {

			it('should clip the image small and medium', function () {
				var image1 = generateImage('small-1'), image2 = generateImage('medium-2');

				instance._clip(image1, image2);

				expect(image1.getWidth()).toBe(image2.getWidth());
				expect(image1.getHeight()).toBe(image2.getHeight());
			});

			it('should clip the image medium and small', function () {
				var image1 = generateImage('medium-1'), image2 = generateImage('small-2');

				instance._clip(image1, image2);

				expect(image1.getWidth()).toBe(image2.getWidth());
				expect(image1.getHeight()).toBe(image2.getHeight());
			});

			it('should clip the image slim-1 and medium', function () {
				var image1 = generateImage('slim-1'), image2 = generateImage('medium-1');

				instance._clip(image1, image2);

				expect(image1.getWidth()).toBe(image2.getWidth());
				expect(image1.getHeight()).toBe(image2.getHeight());
			});

			it('should clip the image slim-2 and medium', function () {
				var image1 = generateImage('slim-2'), image2 = generateImage('medium-1');

				instance._clip(image1, image2);

				expect(image1.getWidth()).toBe(image2.getWidth());
				expect(image1.getHeight()).toBe(image2.getHeight());
			});

			it('should clip the image small and small', function () {
				var image1 = generateImage('small-2'), image2 = generateImage('small-1');

				instance._clip(image1, image2);

				expect(image1.getWidth()).toBe(image2.getWidth());
				expect(image1.getHeight()).toBe(image2.getHeight());
			});
		});

		describe('isAboveThreshold', function () {

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

		describe('Comparison', function () {

			let image1, image2, image3, image4, maskColor, shiftColor, backgroundMaskColor;

			beforeEach(function () {
				image1 = generateImage('small-1');
				image2 = generateImage('small-2');
				image3 = generateImage('small-3');
				image4 = generateImage('small-1');

				maskColor = {
					red: 123, green: 124, blue: 125, alpha: 126
				};
				shiftColor = {
					red: 200, green: 100, blue: 0, alpha: 113
				};
				backgroundMaskColor = {
					red: 31, green: 33, blue: 35, alpha: 37
				};
			});

			describe('_pixelCompare', function () {

				it('should have no differences with a zero dimension', function () {
					var result, deltaThreshold = 10, width = 0, height = 0, hShift = 0, vShift = 0;

					result = instance._pixelCompare(image1, image2, image3, deltaThreshold, width, height, maskColor, shiftColor, backgroundMaskColor, hShift, vShift);

					expect(result).toBe(0);
				});

				it('should have all differences', function () {
					var result, deltaThreshold = 10, width = 2, height = 2, hShift = 0, vShift = 0;

					result = instance._pixelCompare(image1, image2, image3, deltaThreshold, width, height, maskColor, shiftColor, backgroundMaskColor, hShift, vShift);

					expect(result).toBe(4);
				});

				it('should have some differences', function () {
					var result, deltaThreshold = 100, width = 2, height = 2, hShift = 0, vShift = 0;

					result = instance._pixelCompare(image1, image2, image3, deltaThreshold, width, height, maskColor, shiftColor, backgroundMaskColor, hShift, vShift);

					expect(result).toBe(2);
				});
			});

			describe('_compare', function () {

				beforeEach(function () {
					instance._thresholdType = BlinkDiff.THRESHOLD_PIXEL;
					instance._threshold = 3;
				});

				it('should be different', function () {
					var result, deltaThreshold = 10, hShift = 0, vShift = 0;

					result = instance._compare(image1, image2, image3, deltaThreshold, maskColor, shiftColor, backgroundMaskColor, hShift, vShift);

					expect(result).toEqual({
						code: BlinkDiff.RESULT_DIFFERENT, differences: 4, dimension: 4, width: 2, height: 2
					});
				});

				it('should be similar', function () {
					var result, deltaThreshold = 100, hShift = 0, vShift = 0;

					result = instance._compare(image1, image2, image3, deltaThreshold, maskColor, shiftColor, backgroundMaskColor, hShift, vShift);

					expect(result).toEqual({
						code: BlinkDiff.RESULT_SIMILAR, differences: 2, dimension: 4, width: 2, height: 2
					});
				});

				it('should be identical', function () {
					var result, deltaThreshold = 10, hShift = 0, vShift = 0;

					result = instance._compare(image1, image4, image3, deltaThreshold, maskColor, shiftColor, backgroundMaskColor, hShift, vShift);

					expect(result).toEqual({
						code: BlinkDiff.RESULT_IDENTICAL, differences: 0, dimension: 4, width: 2, height: 2
					});
				});
			});
		});

		describe('Run', function () {

			beforeEach(function () {
				instance._imageA = generateImage('small-1');
				instance._imageB = generateImage('medium-1');

				instance._thresholdType = BlinkDiff.THRESHOLD_PIXEL;
				instance._threshold = 3;

				instance._composition = false;
			});

			it('should crop image-a', async function () {
				instance._cropImageA = {width: 1, height: 2};
				const result = await new Promise((resolve, reject) => {
					instance.run(function (err, result) {
						if (err) reject(err);
						else resolve(result);
					});
				});
				expect(result.dimension).toBe(2);
			});

			it('should crop image-b', async function () {
				instance._cropImageB = {width: 1, height: 1};
				const result = await new Promise((resolve, reject) => {
					instance.run(function (err, result) {
						if (err) reject(err);
						else resolve(result);
					});
				});
				expect(result.dimension).toBe(1);
			});

			it('should clip image-b', async function () {
				const result = await new Promise((resolve, reject) => {
					instance.run(function (err, result) {
						if (err) reject(err);
						else resolve(result);
					});
				});
				expect(result.dimension).toBe(4);
			});

			it('should crop and clip images', async function () {
				instance._cropImageA = {width: 1, height: 2};
				instance._cropImageB = {width: 1, height: 1};
				const result = await new Promise((resolve, reject) => {
					instance.run(function (err, result) {
						if (err) reject(err);
						else resolve(result);
					});
				});
				expect(result.dimension).toBe(1);
			});

			it('should write output file', async function () {
				instance._imageOutputPath = import.meta.dir + '/tmp.png';
				await new Promise((resolve, reject) => {
					instance.run(function (err) {
						if (err) reject(err);
						else resolve();
					});
				});
				expect(fs.existsSync(import.meta.dir + '/tmp.png')).toBe(true);
			});

			it('should compare image-a to image-b', async function () {
				const result = await new Promise((resolve, reject) => {
					instance.run(function (err, result) {
						if (err) reject(err);
						else resolve(result);
					});
				});
				expect(result.code).toBe(BlinkDiff.RESULT_DIFFERENT);
			});

			it('should be black', async function () {
				instance._delta = 1000;
				instance._copyImageAToOutput = false;
				instance._copyImageBToOutput = false;
				instance._outputBackgroundRed = 0;
				instance._outputBackgroundGreen = 0;
				instance._outputBackgroundBlue = 0;
				instance._outputBackgroundAlpha = 0;
				instance._outputBackgroundOpacity = undefined;

				await new Promise((resolve, reject) => {
					instance.run(function (err) {
						if (err) reject(err);
						else resolve();
					});
				});
				expect(instance._imageOutput.getAt(0, 0)).toBe(0);
			});

			it('should copy image-a to output by default', async function () {
				instance._delta = 1000;
				instance._outputBackgroundRed = undefined;
				instance._outputBackgroundGreen = undefined;
				instance._outputBackgroundBlue = undefined;
				instance._outputBackgroundAlpha = undefined;
				instance._outputBackgroundOpacity = undefined;

				await new Promise((resolve, reject) => {
					instance.run(function (err) {
						if (err) reject(err);
						else resolve();
					});
				});
				expect(instance._imageOutput.getAt(0, 0)).toBe(instance._imageA.getAt(0, 0));
			});

			it('should copy image-a to output', async function () {
				instance._delta = 1000;
				instance._copyImageAToOutput = true;
				instance._copyImageBToOutput = false;
				instance._outputBackgroundRed = undefined;
				instance._outputBackgroundGreen = undefined;
				instance._outputBackgroundBlue = undefined;
				instance._outputBackgroundAlpha = undefined;
				instance._outputBackgroundOpacity = undefined;

				await new Promise((resolve, reject) => {
					instance.run(function (err) {
						if (err) reject(err);
						else resolve();
					});
				});
				expect(instance._imageOutput.getAt(0, 0)).toBe(instance._imageA.getAt(0, 0));
			});

			it('should copy image-b to output', async function () {
				instance._delta = 1000;
				instance._copyImageAToOutput = false;
				instance._copyImageBToOutput = true;
				instance._outputBackgroundRed = undefined;
				instance._outputBackgroundGreen = undefined;
				instance._outputBackgroundBlue = undefined;
				instance._outputBackgroundAlpha = undefined;
				instance._outputBackgroundOpacity = undefined;

				await new Promise((resolve, reject) => {
					instance.run(function (err) {
						if (err) reject(err);
						else resolve();
					});
				});
				expect(instance._imageOutput.getAt(0, 0)).toBe(instance._imageB.getAt(0, 0));
			});

			it('should run as promise', async function () {
				var promise = instance.runWithPromise();

				expect(promise).toBeInstanceOf(Promise);
				const result = await promise;
				expect(result.code).toBe(BlinkDiff.RESULT_DIFFERENT);
			});
		});

		describe('Color-Conversion', function () {

			it('should convert RGB to XYZ', function () {
				var color = instance._convertRgbToXyz({c1: 92 / 255, c2: 255 / 255, c3: 162 / 255, c4: 1});

				expect(color.c1).toBeCloseTo(0.6144431682352941, 4);
				expect(color.c2).toBeCloseTo(0.8834245847058824, 4);
				expect(color.c3).toBeCloseTo(0.6390158682352941, 4);
				expect(color.c4).toBeCloseTo(1, 4);
			});

			it('should convert Xyz to CIELab', function () {
				var color = instance._convertXyzToCieLab({
						c1: 0.6144431682352941, c2: 0.8834245847058824, c3: 0.6390158682352941, c4: 1
					});

				expect(color.c1).toBeCloseTo(95.30495102757038, 4);
				expect(color.c2).toBeCloseTo(-54.68933740774734, 4);
				expect(color.c3).toBeCloseTo(19.63870174748623, 4);
				expect(color.c4).toBeCloseTo(1, 4);
			});
		});
	});
});

