/**
 * Modern PNGImage wrapper around pngjs
 * Replaces the deprecated pngjs-image library
 */

const fs = require('fs');
const { PNG } = require('pngjs');
const zlib = require('zlib');

/**
 * Logging function - can be overridden
 */
let logFn = function() {};

/**
 * @class PNGImage
 * A wrapper around pngjs providing a compatible API with pngjs-image
 */
class PNGImage {
    /**
     * @param {PNG} image - The underlying pngjs PNG object
     */
    constructor(image) {
        this._image = image;
        this._data = image.data;
    }

    /**
     * Gets the underlying pngjs PNG object
     * @returns {PNG}
     */
    getImage() {
        return this._image;
    }

    /**
     * Gets the raw RGBA pixel data buffer
     * @returns {Buffer}
     */
    getData() {
        return this._data;
    }

    /**
     * Gets the width of the image
     * @returns {number}
     */
    getWidth() {
        return this._image.width;
    }

    /**
     * Gets the height of the image
     * @returns {number}
     */
    getHeight() {
        return this._image.height;
    }

    /**
     * Gets the index in the data buffer for a given coordinate
     * @param {number} x
     * @param {number} y
     * @returns {number}
     */
    getIndex(x, y) {
        return (this._image.width * y + x) << 2;
    }

    /**
     * Gets the pixel value at a coordinate as a packed 32-bit integer (RGBA)
     * @param {number} x
     * @param {number} y
     * @returns {number}
     */
    getAt(x, y) {
        const idx = this.getIndex(x, y);
        return (
            (this._data[idx] << 24) |
            (this._data[idx + 1] << 16) |
            (this._data[idx + 2] << 8) |
            this._data[idx + 3]
        ) >>> 0;
    }

    /**
     * Gets the pixel at a coordinate as an object
     * @param {number} x
     * @param {number} y
     * @returns {{red: number, green: number, blue: number, alpha: number}}
     */
    getPixel(x, y) {
        const idx = this.getIndex(x, y);
        return {
            red: this._data[idx],
            green: this._data[idx + 1],
            blue: this._data[idx + 2],
            alpha: this._data[idx + 3]
        };
    }

    /**
     * Gets the red component at a buffer index
     * @param {number} idx - Buffer index (must be aligned to pixel start)
     * @returns {number}
     */
    getRed(idx) {
        return this._data[idx];
    }

    /**
     * Gets the green component at a buffer index
     * @param {number} idx - Buffer index (must be aligned to pixel start)
     * @returns {number}
     */
    getGreen(idx) {
        return this._data[idx + 1];
    }

    /**
     * Gets the blue component at a buffer index
     * @param {number} idx - Buffer index (must be aligned to pixel start)
     * @returns {number}
     */
    getBlue(idx) {
        return this._data[idx + 2];
    }

    /**
     * Gets the alpha component at a buffer index
     * @param {number} idx - Buffer index (must be aligned to pixel start)
     * @returns {number}
     */
    getAlpha(idx) {
        return this._data[idx + 3];
    }

    /**
     * Sets the red component at a buffer index
     * @param {number} idx - Buffer index (must be aligned to pixel start)
     * @param {number} value
     */
    setRed(idx, value) {
        this._data[idx] = value;
    }

    /**
     * Sets the green component at a buffer index
     * @param {number} idx - Buffer index (must be aligned to pixel start)
     * @param {number} value
     */
    setGreen(idx, value) {
        this._data[idx + 1] = value;
    }

    /**
     * Sets the blue component at a buffer index
     * @param {number} idx - Buffer index (must be aligned to pixel start)
     * @param {number} value
     */
    setBlue(idx, value) {
        this._data[idx + 2] = value;
    }

    /**
     * Sets the alpha component at a buffer index
     * @param {number} idx - Buffer index (must be aligned to pixel start)
     * @param {number} value
     */
    setAlpha(idx, value) {
        this._data[idx + 3] = value;
    }

    /**
     * Sets a pixel at a buffer index using a color object
     * Supports opacity blending when color.opacity is provided (0.0 to 1.0)
     * @param {number} idx - Buffer index (must be aligned to pixel start)
     * @param {{red?: number, green?: number, blue?: number, alpha?: number, opacity?: number}} color
     */
    setAtIndex(idx, color) {
        const opacity = color.opacity !== undefined ? color.opacity : 1.0;
        
        if (opacity < 1.0) {
            // Blend with existing pixel
            const invOpacity = 1.0 - opacity;
            if (color.red !== undefined) {
                this._data[idx] = Math.round(this._data[idx] * invOpacity + color.red * opacity);
            }
            if (color.green !== undefined) {
                this._data[idx + 1] = Math.round(this._data[idx + 1] * invOpacity + color.green * opacity);
            }
            if (color.blue !== undefined) {
                this._data[idx + 2] = Math.round(this._data[idx + 2] * invOpacity + color.blue * opacity);
            }
            if (color.alpha !== undefined) {
                this._data[idx + 3] = Math.round(this._data[idx + 3] * invOpacity + color.alpha * opacity);
            }
        } else {
            // No blending, direct set
            if (color.red !== undefined) this._data[idx] = color.red;
            if (color.green !== undefined) this._data[idx + 1] = color.green;
            if (color.blue !== undefined) this._data[idx + 2] = color.blue;
            if (color.alpha !== undefined) this._data[idx + 3] = color.alpha;
        }
    }

    /**
     * Gets a pixel at a buffer index as a color object
     * @param {number} idx - Buffer index (must be aligned to pixel start)
     * @returns {{red: number, green: number, blue: number, alpha: number}}
     */
    getAtIndex(idx) {
        return {
            red: this._data[idx],
            green: this._data[idx + 1],
            blue: this._data[idx + 2],
            alpha: this._data[idx + 3]
        };
    }

    /**
     * Sets the pixel value at a coordinate
     * @param {number} x
     * @param {number} y
     * @param {{red?: number, green?: number, blue?: number, alpha?: number}} color
     */
    setAt(x, y, color) {
        const idx = this.getIndex(x, y);
        if (color.red !== undefined) this._data[idx] = color.red;
        if (color.green !== undefined) this._data[idx + 1] = color.green;
        if (color.blue !== undefined) this._data[idx + 2] = color.blue;
        if (color.alpha !== undefined) this._data[idx + 3] = color.alpha;
    }

    /**
     * Sets a pixel using raw RGBA values
     * @param {number} x
     * @param {number} y
     * @param {number} red
     * @param {number} green
     * @param {number} blue
     * @param {number} alpha
     */
    setPixel(x, y, red, green, blue, alpha) {
        const idx = this.getIndex(x, y);
        this._data[idx] = red;
        this._data[idx + 1] = green;
        this._data[idx + 2] = blue;
        this._data[idx + 3] = alpha;
    }

    /**
     * Fills a rectangle with a color
     * @param {number} x
     * @param {number} y
     * @param {number} width
     * @param {number} height
     * @param {{red: number, green: number, blue: number, alpha: number}} color
     */
    fillRect(x, y, width, height, color) {
        for (let yi = y; yi < y + height; yi++) {
            for (let xi = x; xi < x + width; xi++) {
                this.setAt(xi, yi, color);
            }
        }
    }

    /**
     * Clips (crops) the image to the specified dimensions
     * @param {number} x
     * @param {number} y
     * @param {number} width
     * @param {number} height
     */
    clip(x, y, width, height) {
        const newImage = new PNG({ width, height });
        
        for (let yi = 0; yi < height; yi++) {
            for (let xi = 0; xi < width; xi++) {
                const srcIdx = this.getIndex(x + xi, y + yi);
                const dstIdx = (width * yi + xi) << 2;
                
                newImage.data[dstIdx] = this._data[srcIdx];
                newImage.data[dstIdx + 1] = this._data[srcIdx + 1];
                newImage.data[dstIdx + 2] = this._data[srcIdx + 2];
                newImage.data[dstIdx + 3] = this._data[srcIdx + 3];
            }
        }
        
        this._image = newImage;
        this._data = newImage.data;
    }

    /**
     * Applies a list of filters to the image
     * Available filters: blur, grayScale, lightness, luma, luminosity, sepia
     * @param {string[]} filters
     */
    applyFilters(filters) {
        if (!filters || filters.length === 0) return;
        
        for (const filter of filters) {
            switch (filter.toLowerCase()) {
                case 'blur':
                    this._applyBlur();
                    break;
                case 'grayscale':
                case 'greyscale':
                    this._applyGrayScale();
                    break;
                case 'lightness':
                    this._applyLightness();
                    break;
                case 'luma':
                    this._applyLuma();
                    break;
                case 'luminosity':
                    this._applyLuminosity();
                    break;
                case 'sepia':
                    this._applySepia();
                    break;
                default:
                    logFn(`Unknown filter: ${filter}`);
            }
        }
    }

    /**
     * Applies a simple box blur
     * @private
     */
    _applyBlur() {
        const width = this.getWidth();
        const height = this.getHeight();
        const src = Buffer.from(this._data);
        
        for (let y = 1; y < height - 1; y++) {
            for (let x = 1; x < width - 1; x++) {
                const idx = this.getIndex(x, y);
                
                for (let c = 0; c < 3; c++) {
                    let sum = 0;
                    let count = 0;
                    
                    for (let dy = -1; dy <= 1; dy++) {
                        for (let dx = -1; dx <= 1; dx++) {
                            const srcIdx = ((width * (y + dy)) + (x + dx)) << 2;
                            sum += src[srcIdx + c];
                            count++;
                        }
                    }
                    
                    this._data[idx + c] = Math.round(sum / count);
                }
            }
        }
    }

    /**
     * Converts to grayscale using average method
     * @private
     */
    _applyGrayScale() {
        const len = this._data.length;
        for (let i = 0; i < len; i += 4) {
            const gray = Math.round((this._data[i] + this._data[i + 1] + this._data[i + 2]) / 3);
            this._data[i] = gray;
            this._data[i + 1] = gray;
            this._data[i + 2] = gray;
        }
    }

    /**
     * Converts using lightness method: (max(R,G,B) + min(R,G,B)) / 2
     * @private
     */
    _applyLightness() {
        const len = this._data.length;
        for (let i = 0; i < len; i += 4) {
            const max = Math.max(this._data[i], this._data[i + 1], this._data[i + 2]);
            const min = Math.min(this._data[i], this._data[i + 1], this._data[i + 2]);
            const gray = Math.round((max + min) / 2);
            this._data[i] = gray;
            this._data[i + 1] = gray;
            this._data[i + 2] = gray;
        }
    }

    /**
     * Converts using luma (Rec. 601): 0.299*R + 0.587*G + 0.114*B
     * @private
     */
    _applyLuma() {
        const len = this._data.length;
        for (let i = 0; i < len; i += 4) {
            const gray = Math.round(
                0.299 * this._data[i] +
                0.587 * this._data[i + 1] +
                0.114 * this._data[i + 2]
            );
            this._data[i] = gray;
            this._data[i + 1] = gray;
            this._data[i + 2] = gray;
        }
    }

    /**
     * Converts using luminosity (Rec. 709): 0.2126*R + 0.7152*G + 0.0722*B
     * @private
     */
    _applyLuminosity() {
        const len = this._data.length;
        for (let i = 0; i < len; i += 4) {
            const gray = Math.round(
                0.2126 * this._data[i] +
                0.7152 * this._data[i + 1] +
                0.0722 * this._data[i + 2]
            );
            this._data[i] = gray;
            this._data[i + 1] = gray;
            this._data[i + 2] = gray;
        }
    }

    /**
     * Applies sepia tone effect
     * @private
     */
    _applySepia() {
        const len = this._data.length;
        for (let i = 0; i < len; i += 4) {
            const r = this._data[i];
            const g = this._data[i + 1];
            const b = this._data[i + 2];
            
            this._data[i] = Math.min(255, Math.round(0.393 * r + 0.769 * g + 0.189 * b));
            this._data[i + 1] = Math.min(255, Math.round(0.349 * r + 0.686 * g + 0.168 * b));
            this._data[i + 2] = Math.min(255, Math.round(0.272 * r + 0.534 * g + 0.131 * b));
        }
    }

    /**
     * Writes the image to a file synchronously
     * @param {string} path
     */
    writeImageSync(path) {
        const buffer = PNG.sync.write(this._image);
        fs.writeFileSync(path, buffer);
    }

    /**
     * Writes the image to a file asynchronously
     * @param {string} path
     * @param {function} [callback] - Optional callback(err)
     * @returns {Promise<void>}
     */
    writeImage(path, callback) {
        const promise = new Promise((resolve, reject) => {
            const buffer = PNG.sync.write(this._image);
            fs.writeFile(path, buffer, (err) => {
                if (err) reject(err);
                else resolve();
            });
        });

        if (callback) {
            promise.then(
                () => callback(null),
                (err) => callback(err)
            );
        }

        return promise;
    }

    /**
     * Returns a PNG buffer of the image
     * @returns {Buffer}
     */
    toBuffer() {
        return PNG.sync.write(this._image);
    }

    // Static methods

    /**
     * Creates a new blank image
     * @param {number} width
     * @param {number} height
     * @returns {PNGImage}
     */
    static createImage(width, height) {
        const png = new PNG({ width, height, fill: true });
        // Initialize to transparent black
        png.data.fill(0);
        return new PNGImage(png);
    }

    /**
     * Creates a copy of an image
     * @param {PNGImage} source
     * @returns {PNGImage}
     */
    static copyImage(source) {
        const srcPng = source.getImage();
        const newPng = new PNG({
            width: srcPng.width,
            height: srcPng.height
        });
        srcPng.data.copy(newPng.data);
        return new PNGImage(newPng);
    }

    /**
     * Reads an image from a file synchronously
     * @param {string} path
     * @returns {PNGImage}
     */
    static readImageSync(path) {
        const buffer = fs.readFileSync(path);
        return PNGImage.loadImageSync(buffer);
    }

    /**
     * Reads an image from a file asynchronously
     * @param {string} path
     * @param {function} [callback] - Optional callback(err, image)
     * @returns {Promise<PNGImage>}
     */
    static readImage(path, callback) {
        const promise = new Promise((resolve, reject) => {
            fs.readFile(path, (err, buffer) => {
                if (err) {
                    reject(err);
                    return;
                }
                try {
                    const image = PNGImage.loadImageSync(buffer);
                    resolve(image);
                } catch (e) {
                    reject(e);
                }
            });
        });

        if (callback) {
            promise.then(
                (image) => callback(null, image),
                (err) => callback(err)
            );
        }

        return promise;
    }

    /**
     * Loads an image from a buffer synchronously
     * @param {Buffer} buffer
     * @returns {PNGImage}
     */
    static loadImageSync(buffer) {
        // PNG.sync.read returns a plain object, not a PNG instance
        // We need to create a proper PNG instance to get prototype methods like bitblt
        const parsed = PNG.sync.read(buffer);
        const png = new PNG({
            width: parsed.width,
            height: parsed.height
        });
        parsed.data.copy(png.data);
        return new PNGImage(png);
    }

    /**
     * Loads an image from a buffer asynchronously
     * @param {Buffer} buffer
     * @param {function} [callback] - Optional callback(err, image)
     * @returns {Promise<PNGImage>}
     */
    static loadImage(buffer, callback) {
        const promise = new Promise((resolve, reject) => {
            try {
                const image = PNGImage.loadImageSync(buffer);
                resolve(image);
            } catch (e) {
                reject(e);
            }
        });

        if (callback) {
            promise.then(
                (image) => callback(null, image),
                (err) => callback(err)
            );
        }

        return promise;
    }

    /**
     * Sets the logging function
     * @param {function} fn
     */
    static set log(fn) {
        logFn = fn;
    }

    /**
     * Gets the logging function
     * @returns {function}
     */
    static get log() {
        return logFn;
    }

    /**
     * Expose the Decoder class for compatibility
     * Note: This provides a minimal compatibility layer for code that uses PNGImage.Decoder
     */
    static get Decoder() {
        return PNGDecoder;
    }
}

/**
 * Minimal PNG Decoder for compatibility with pngjs-image's Decoder API
 * Used by lib/configuration/image.js for embedded structure data
 */
class PNGDecoder {
    constructor() {
        this._chunks = {};
        this._headerChunk = null;
    }

    /**
     * Decodes a PNG buffer
     * @param {Buffer} buffer
     * @param {object} options
     * @returns {Buffer} The raw pixel data
     */
    decode(buffer, options = {}) {
        // Parse the PNG to extract chunks
        this._parseChunks(buffer);
        
        // Use pngjs to decode the actual image data
        const png = PNG.sync.read(buffer);
        this._headerChunk = {
            width: png.width,
            height: png.height,
            getWidth: () => png.width,
            getHeight: () => png.height
        };
        
        return png.data;
    }

    /**
     * Parses PNG chunks from a buffer
     * @param {Buffer} buffer
     * @private
     */
    _parseChunks(buffer) {
        // PNG signature is 8 bytes
        let offset = 8;
        
        while (offset < buffer.length) {
            // Each chunk: 4 bytes length, 4 bytes type, N bytes data, 4 bytes CRC
            const length = buffer.readUInt32BE(offset);
            const type = buffer.toString('ascii', offset + 4, offset + 8);
            const data = buffer.slice(offset + 8, offset + 8 + length);
            
            if (!this._chunks[type]) {
                this._chunks[type] = [];
            }
            this._chunks[type].push(this._parseChunkData(type, data));
            
            offset += 12 + length; // 4 (length) + 4 (type) + length + 4 (crc)
            
            if (type === 'IEND') break;
        }
    }

    /**
     * Parses chunk data based on type
     * @param {string} type
     * @param {Buffer} data
     * @returns {object}
     * @private
     */
    _parseChunkData(type, data) {
        if (type === 'stRT') {
            // Custom structure chunk used by blink-diff
            // Format: 4 bytes dataType, 1 byte major, 1 byte minor, rest is JSON content
            if (data.length >= 6) {
                const dataType = data.toString('ascii', 0, 4);
                const major = data.readUInt8(4);
                const minor = data.readUInt8(5);
                let content = null;
                
                if (data.length > 6) {
                    try {
                        content = JSON.parse(data.toString('utf8', 6));
                    } catch (e) {
                        content = null;
                    }
                }
                
                return {
                    getDataType: () => dataType,
                    getMajor: () => major,
                    getMinor: () => minor,
                    getContent: () => content
                };
            }
        }
        
        return { data };
    }

    /**
     * Gets the header chunk
     * @returns {object}
     */
    getHeaderChunk() {
        return this._headerChunk;
    }

    /**
     * Checks if chunks of a given type exist
     * @param {string} type
     * @returns {boolean}
     */
    hasChunksOfType(type) {
        return !!this._chunks[type] && this._chunks[type].length > 0;
    }

    /**
     * Gets the first chunk of a given type
     * @param {string} type
     * @returns {object|null}
     */
    getFirstChunk(type) {
        if (this._chunks[type] && this._chunks[type].length > 0) {
            return this._chunks[type][0];
        }
        return null;
    }
}

module.exports = PNGImage;

