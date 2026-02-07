/**
 * State Management for Pixel Wind Letter
 * Handles encoding/decoding of letter data to/from URL.
 */

export const encodeLetter = (data) => {
    // data = { to, from, msg1, msg2, seed }
    // Minimal JSON structure to save space
    const payload = JSON.stringify(data);
    // Base64 encode, handle unicode
    return btoa(unescape(encodeURIComponent(payload)));
};

export const decodeLetter = (hash) => {
    try {
        const payload = decodeURIComponent(escape(atob(hash)));
        return JSON.parse(payload);
    } catch (e) {
        console.error("Invalid letter data", e);
        return null; // Invalid link
    }
};

export const getLetterFromURL = () => {
    const params = new URLSearchParams(window.location.search);
    const letterHash = params.get('l');
    if (letterHash) {
        return decodeLetter(letterHash);
    }
    return null;
};
