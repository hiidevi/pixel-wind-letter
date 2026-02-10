import { AnimationEngine } from './js/animation.js';
import { getLetterFromURL, encodeLetter } from './js/state.js';

// YouTube Helper
function extractVideoID(url) {
    if (!url) return false;
    // Added support for 'shorts/'
    const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?)|(shorts\/))\??v?=?([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[8].length == 11) ? match[8] : false;
}

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

    // Initially hide Page 2 content with opacity 0
    page2.style.opacity = '0';

    // YouTube Integration
    if (data.yt) {
        // Load YouTube IFrame API
        const tag = document.createElement('script');
        tag.src = "https://www.youtube.com/iframe_api";
        const firstScriptTag = document.getElementsByTagName('script')[0];
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

        let player;
        window.onYouTubeIframeAPIReady = function () {
            player = new YT.Player('youtube-player-container', {
                height: '0',
                width: '0',
                videoId: data.yt,
                playerVars: {
                    'autoplay': 1,
                    'controls': 0,
                    'loop': 1,
                    'playlist': data.yt
                },
                events: {
                    'onReady': onPlayerReady,
                    'onStateChange': onPlayerStateChange
                }
            });
        };

        function onPlayerReady(event) {
            event.target.playVideo();
        }

        function onPlayerStateChange(event) {
            checkAudioState(event.target);
        }

        function checkAudioState(p) {
            const btn = document.getElementById('btn-play-music');
            const controls = document.getElementById('music-controls');

            if (p.getPlayerState() === YT.PlayerState.PLAYING) {
                if (p.isMuted()) {
                    controls.classList.remove('hidden');
                    btn.textContent = "♪ Unmute Music";
                } else {
                    controls.classList.add('hidden');
                }
            } else {
                controls.classList.remove('hidden');
                btn.textContent = "♪ Play Music";
            }
        }

        // Manual Play Button
        const btnPlay = document.getElementById('btn-play-music');
        document.getElementById('music-controls').classList.remove('hidden');

        const handlePlayParams = (e) => {
            // Prevent ghost clicks if touch fired first
            if (e.type === 'touchstart') e.preventDefault();

            if (player) {
                player.unMute();
                player.setVolume(100);
                player.playVideo();
                setTimeout(() => checkAudioState(player), 500);
            }
        };

        btnPlay.addEventListener('click', handlePlayParams);
        btnPlay.addEventListener('touchstart', handlePlayParams, { passive: false });
    }

    // Sequenced Animation
    setTimeout(() => {
        typeText(msg1El, data.msg1 || "", 50, () => {
            if (data.msg2 && data.msg2.trim().length > 0) {
                setTimeout(() => {
                    page1.style.opacity = '0'; // Fade out
                    page1.classList.add('fade-out');

                    setTimeout(() => {
                        page1.classList.add('hidden');
                        page2.classList.remove('hidden');
                        void page2.offsetWidth;
                        page2.style.transition = 'opacity 2s ease-in';
                        page2.style.opacity = '1';
                        msg2El.textContent = data.msg2;
                    }, 1000);
                }, 2000);
            }
        });
    }, 2000);
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
            setTimeout(type, speed + (Math.random() * 30));
        } else {
            element.classList.remove('typewriter-text');
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
    const btnReset = document.getElementById('btn-reset');

    btnGenerate.addEventListener('click', () => {
        const to = document.getElementById('input-to').value.trim();
        const from = document.getElementById('input-from').value.trim();
        const msg1 = document.getElementById('input-msg1').value.trim();
        const msg2 = document.getElementById('input-msg2').value.trim();
        const ytUrl = document.getElementById('input-youtube').value.trim();

        if (!to || !from || !msg1) {
            alert("Please fill in the required fields (To, From, Letter 1).");
            return;
        }

        let ytId = null;
        if (ytUrl) {
            ytId = extractVideoID(ytUrl);
            if (!ytId) {
                alert("Invalid YouTube URL. Please use a standard video link, shorts link, or share link.");
                return;
            }
        }

        const data = {
            to,
            from,
            msg1,
            msg2,
            yt: ytId,
            seed: Math.random()
        };

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
            document.getElementById('input-youtube').value = "";
        });
    }
}
