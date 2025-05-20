class TextAnimator {
    constructor(selector, options = {}) {
        this.element = typeof selector === 'string' ? document.querySelector(selector) : selector;
        this.options = {
            animation: 'fadeIn',
            delay: 100,
            duration: 500,
            loop: false,
            infinite: false,
            level: 'letter', // NEW: 'letter' or 'word'
            easing: 'ease',  // NEW: any CSS easing
            direction: 'normal', // NEW: 'normal' or 'reverse'
            ...options
        };
        this.originalText = this.element.textContent;
        this.letters = [];
        this.isRunning = false;
        this.loopTimer = null;
        this.customAnimations = {}; // NEW
    }

    splitText() {
        this.element.innerHTML = '';

        const chunks = this.options.level === 'word'
            ? this.originalText.split(/(\s+)/) // Preserve spaces
            : this.originalText.split('');

        this.letters = chunks.map((chunk) => {
            const span = document.createElement('span');
            span.textContent = chunk;
            span.style.display = 'inline-block';
            span.style.opacity = 0;
            span.style.transition = `all ${this.options.duration}ms ${this.options.easing}`;
            this.element.appendChild(span);
            return span;
        });

        // Reverse if direction is "reverse"
        if (this.options.direction === 'reverse') {
            this.letters.reverse();
        }
    }

    async animate() {
        if (this.isRunning) return;
        this.isRunning = true;

        const animationFn = this[this.options.animation] || this.customAnimations[this.options.animation];
        if (!animationFn) {
            console.error(`Animation "${this.options.animation}" is not defined.`);
            return;
        }

        await animationFn.call(this);

        const totalTime = this.options.duration + this.options.delay * this.letters.length + 200;

        if (this.options.loop || this.options.infinite) {
            this.loopTimer = setTimeout(() => {
                this.splitText();
                this.isRunning = false;
                this.animate();
            }, totalTime);
        } else {
            this.isRunning = false;
        }
    }

    init() {
        clearTimeout(this.loopTimer);
        this.isRunning = false;
        this.splitText();
        this.animate();
    }

    stop() {
        clearTimeout(this.loopTimer);
        this.isRunning = false;
    }

    // 🎞️ BUILT-IN ANIMATIONS

    async fadeIn() {
        this.letters.forEach((letter, i) => {
            setTimeout(() => {
                letter.style.opacity = 1;
            }, i * this.options.delay);
        });
    }

    async slideIn() {
        this.letters.forEach((letter) => {
            letter.style.transform = 'translateY(20px)';
        });
        this.letters.forEach((letter, i) => {
            setTimeout(() => {
                letter.style.opacity = 1;
                letter.style.transform = 'translateY(0)';
            }, i * this.options.delay);
        });
    }

    async typewriter() {
        this.letters.forEach((letter) => (letter.style.opacity = 0));
        this.letters.forEach((letter, i) => {
            setTimeout(() => {
                letter.style.opacity = 1;
            }, i * this.options.delay);
        });
    }

    async bounce() {
        this.letters.forEach((letter) => {
            letter.style.transform = 'translateY(0)';
        });
        this.letters.forEach((letter, i) => {
            setTimeout(() => {
                letter.style.opacity = 1;
                letter.style.transition = `transform ${this.options.duration}ms ${this.options.easing}`;
                letter.style.transform = 'translateY(-10px)';
                setTimeout(() => {
                    letter.style.transform = 'translateY(0)';
                }, this.options.duration / 2);
            }, i * this.options.delay);
        });
    }

    // 🔧 DYNAMIC ANIMATION ADD/REMOVE

    addAnimation(name, fn) {
        if (typeof fn !== 'function') return console.error('Animation must be a function');
        this.customAnimations[name] = fn;
    }

    removeAnimation(name) {
        delete this.customAnimations[name];
    }
}