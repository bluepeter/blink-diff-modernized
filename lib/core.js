/**
 * Minimal replacement for preceptor-core
 * Provides Base class with extend() and deepExtend utility
 */

/**
 * Deep extend/merge objects
 * @param {object} target - Target object
 * @param {object[]} sources - Array of source objects
 * @returns {object} Merged object
 */
function deepExtend(target, sources) {
	if (!sources || !sources.length) return target;
	
	for (const source of sources) {
		if (!source) continue;
		
		for (const key in source) {
			if (Object.prototype.hasOwnProperty.call(source, key)) {
				const value = source[key];
				if (value && typeof value === 'object' && !Array.isArray(value)) {
					target[key] = deepExtend(target[key] || {}, [value]);
				} else if (value !== undefined) {
					target[key] = value;
				}
			}
		}
	}
	
	return target;
}

/**
 * Base class with classical inheritance support
 */
function Base() {}

/**
 * Extend this class with instance and static methods
 * @param {function} constructor - Constructor function
 * @param {object} [instanceMethods] - Instance methods
 * @param {object} [staticMethods] - Static methods
 * @returns {function} New class
 */
Base.extend = function(constructor, instanceMethods, staticMethods) {
	const Parent = this;
	
	// Create child constructor
	function Child() {
		// Call the provided constructor
		constructor.apply(this, arguments);
	}
	
	// Set up prototype chain
	Child.prototype = Object.create(Parent.prototype);
	Child.prototype.constructor = Child;
	
	// Add __super method for calling parent constructor
	Child.prototype.__super = function() {
		// Call parent constructor if it exists and is different from Base
		if (Parent !== Base && Parent.prototype.constructor) {
			Parent.prototype.constructor.apply(this, arguments);
		}
	};
	
	// Add instance methods
	if (instanceMethods) {
		for (const key in instanceMethods) {
			if (Object.prototype.hasOwnProperty.call(instanceMethods, key)) {
				Child.prototype[key] = instanceMethods[key];
			}
		}
	}
	
	// Add static methods
	if (staticMethods) {
		for (const key in staticMethods) {
			if (Object.prototype.hasOwnProperty.call(staticMethods, key)) {
				Child[key] = staticMethods[key];
			}
		}
	}
	
	// Copy parent static methods (including extend)
	Child.extend = Base.extend;
	
	return Child;
};

module.exports = {
	Base: Base,
	utils: {
		deepExtend: deepExtend
	}
};

