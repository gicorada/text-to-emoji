let probability = 7  // 0-10, with 0 is never and 10 is always. I know this is not implemented yet, but I will do it soon.

async function loadEmojiMapping() {
    const response = await fetch('./emojiMapping.json') // I hate this, but at the moment I don't have a better way to do it
    if (!response.ok) {
        throw new Error('Network response was not ok ' + response.statusText)
    }
    
    const data = await response.json();
    const map = new Map();
    for (const [emoji, words] of Object.entries(data)) {
        for (const word of words) {
            map.set(word.toLowerCase(), emoji);
        }
    }
    return map;
}

async function modifyTextNodes(node, callback) {
    if (node.nodeType === Node.TEXT_NODE) {
        if (node.parentNode && node.parentNode.nodeName !== 'SCRIPT' && !node.parentNode.classList.contains('tte-nochange')) {
            node.textContent = await callback(node.textContent)
        }
    } else {
        for (let child of node.childNodes) {
            if (!child.classList || !child.classList.contains('nochange')) {
                await modifyTextNodes(child, callback);
            }
        }
    }
}

function getEmoji(word, mapping) {
    return mapping.get(word.toLowerCase().replace(/[^a-z0-9]/gi, '').trim()) || "";
}

function tokenize(input) {
    // Aggiustamento della regex per includere l'apostrofo come parte di una parola
    return input.split(/(\s+|[.,;:?!()_'"\[\]{}<>+\-*\/=@#$%^&])/g);
}

  
async function stringAnalyzer(text, mapping) {
    var tokens = tokenize(text)

    const promises = tokens.map(word => analyzeAndReplaceWord(word, mapping))
    const newWords = await Promise.all(promises)

    return newWords.join("")
}

async function analyzeAndReplaceWord(word, mapping) {
    if (/^[\s.,;:?!()_'"[\]{}<>+\-*\/=@#$%^&]*$/.test(word)) {
        return word;
    }

    try {
        const response = getEmoji(word, mapping)
        if (response.length > 0) {
            console.log('Replaced:', word, 'with:', response)
            return response
        } else {
            emoji = word
        }
    } catch (error) {
        console.error('Error:', error)
    }

    return word
}


document.addEventListener('DOMContentLoaded', async () => {
    try {
        const wordToEmoji = await loadEmojiMapping()
        await modifyTextNodes(document.body, text => stringAnalyzer(text, wordToEmoji))
    } catch (error) {
        console.error('Error during initialization:', error)
    }
});
