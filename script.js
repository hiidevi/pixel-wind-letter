import { AnimationEngine } from './js/animation.js';
import { getLetterFromURL, encodeLetter } from './js/state.js';

// Init App
document.addEventListener('DOMContentLoaded', () => {
    // 1. Start Pixel Animation immediately
    const engine = new AnimationEngine('pixel-canvas');
    engine.start();

    // 2. Parse State
    const letterData = getLetterFromURL();

    // 3. Decide UI Mode
    if (letterData) {
        // Reader Mode
        initReaderMode(letterData, engine);
    } else {
        // Creator Mode
        initCreatorMode(engine);
    }
});

// Implementation of Reader Mode
function initReaderMode(data, engine) {
    document.getElementById('creator-ui').classList.add('hidden');
    document.getElementById('reader-ui').classList.remove('hidden');

    // Set content
    document.getElementById('display-to').textContent = data.to;
    document.getElementById('display-from').textContent = data.from;

    // Animation Sequencing
    const msg1El = document.getElementById('display-msg1');
    const msg2El = document.getElementById('display-msg2');
    const page1 = document.getElementById('letter-page-1');
    const page2 = document.getElementById('letter-page-2');

    // Initially hide Page 2 content with opacity 0 (via CSS logic or inline style)
    page2.style.opacity = '0';

    // Step 1: Wind Animation (already running)
    // Step 2: Show Recipient Name + Page 1 content after delay
    setTimeout(() => {
        // Typewriter Effect for Msg 1
        typeText(msg1El, data.msg1 || "", 50, () => {
            // After typing finishes... wait a bit, then transition if Msg 2 exists
            if (data.msg2 && data.msg2.trim().length > 0) {
                setTimeout(() => {
                    // Transition to Page 2
                    page1.style.opacity = '0'; // Fade out
                    page1.classList.add('fade-out');

                    setTimeout(() => {
                        page1.classList.add('hidden');
                        page2.classList.remove('hidden');

                        // Trigger reflow
                        void page2.offsetWidth;

                        // Fade In Page 2
                        page2.style.transition = 'opacity 2s ease-in';
                        page2.style.opacity = '1';

                        // Show text immediately or type it? Let's just show it for "Page 2" feel
                        msg2El.textContent = data.msg2;
                    }, 1000); // 1s fade out duration
                }, 2000); // Read time delay
            }
        });
    }, 2000); // Initial "Wind Only" delay
}

// Implementation of Typewriter Effect
function typeText(element, text, speed, callback) {
    let i = 0;
    element.innerHTML = "";
    element.classList.add('typewriter-text');

    function type() {
        if (i < text.length) {
            element.textContent += text.charAt(i);
            i++;
            setTimeout(type, speed + (Math.random() * 30)); // Subtle jitter
        } else {
            element.classList.remove('typewriter-text'); // Stop cursor blink?
            if (callback) callback();
        }
    }
    type();
}

// Implementation of Creator Mode
function initCreatorMode(engine) {
    const btnGenerate = document.getElementById('btn-generate');
    const shareContainer = document.getElementById('share-container');
    const shareLinkInput = document.getElementById('share-link');
    const btnCopy = document.getElementById('btn-copy');
    const btnReset = document.getElementById('btn-reset'); // Fix ID reference

    btnGenerate.addEventListener('click', () => {
        const to = document.getElementById('input-to').value.trim();
        const from = document.getElementById('input-from').value.trim();
        const msg1 = document.getElementById('input-msg1').value.trim();
        const msg2 = document.getElementById('input-msg2').value.trim();

        if (!to || !from || !msg1) {
            alert("Please fill in the required fields (To, From, Letter 1).");
            return;
        }

        // Generate Data Payload
        const data = {
            to,
            from,
            msg1,
            msg2,
            seed: Math.random()
        };

        // Create Encoded URL
        // Encode the Hash component
        const hash = encodeLetter(data);
        const safeHash = encodeURIComponent(hash);
        const url = `${window.location.origin}${window.location.pathname}?l=${safeHash}`;

        shareLinkInput.value = url;
        shareContainer.classList.remove('hidden');

        btnGenerate.textContent = "Sealed!";
        btnGenerate.disabled = true;
    });

    btnCopy.addEventListener('click', () => {
        shareLinkInput.select();
        document.execCommand('copy');
        btnCopy.textContent = "Copied!";
        setTimeout(() => btnCopy.textContent = "Copy", 2000);
    });

    if (btnReset) {
        btnReset.addEventListener('click', () => {
            shareContainer.classList.add('hidden');
            btnGenerate.disabled = false;
            btnGenerate.textContent = "Seal Letter";
            document.getElementById('input-to').value = "";
            document.getElementById('input-from').value = "";
            document.getElementById('input-msg1').value = "";
            document.getElementById('input-msg2').value = "";
        });
    }
}
