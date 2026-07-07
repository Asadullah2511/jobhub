// React Native DOM Polyfills
// These provide browser APIs that some packages expect

// DOMRect polyfill
if (typeof global.DOMRect === 'undefined') {
  global.DOMRect = class DOMRect {
    constructor(x = 0, y = 0, width = 0, height = 0) {
      this.x = x;
      this.y = y;
      this.width = width;
      this.height = height;
      this.top = y;
      this.left = x;
      this.bottom = y + height;
      this.right = x + width;
    }

    toJSON() {
      return {
        x: this.x,
        y: this.y,
        width: this.width,
        height: this.height,
        top: this.top,
        left: this.left,
        bottom: this.bottom,
        right: this.right,
      };
    }
  };
}

// window polyfill
if (typeof window !== 'undefined') {
  if (!window.DOMRect) {
    window.DOMRect = global.DOMRect;
  }
}

console.log('✅ DOM polyfills loaded');
