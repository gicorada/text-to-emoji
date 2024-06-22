let probability = 7  // 0-10, with 0 is never and 10 is always. I know this is not implemented yet, but I will do it soon.

async function loadEmojiMapping() {
    const response = await fetch('./emojiMapping.json') // I hate this, but at the moment I don't have a better way to do it
    if (!response.ok) {
        throw new Error('Network response was not ok ' + response.statusText)
    }
    
    return await response.json()
}

async function modifyTextNodes(node, callback) {
    if (node.nodeType === Node.TEXT_NODE) {
        if (node.parentNode && node.parentNode.nodeName !== 'SCRIPT') {
            node.textContent = await callback(node.textContent)
        }
    } else {
        for (let child of node.childNodes) {
            await modifyTextNodes(child, callback) // let's do it recursively
        }
    }
}

function getEmoji(word, mapping) {
    for (let i = 0; i < mapping.length; i++) {
        if (find(word, mapping[i])) {
            return mapping[word]
        }
    }

    return mapping[word] || ""
}

function find(txt, src) {
    var re = new RegExp(txt.split('').map(function(a,b,c){ return txt.substr(0, b)+a+'?.?'+ txt.substr(b+1);}).join('|'),'gi') // why does regex have to be so complicated?

    return src.match(re) != null
}

function tokenize(input) {
    return input.split(/\s+/g)
}
  
async function stringAnalyzer(text, mapping) {
    var tokens = tokenize(text)

    const promises = tokens.map(word => analyzeAndReplaceWord(word, mapping))
    const newWords = await Promise.all(promises)

    return newWords.join(" ")
}

async function analyzeAndReplaceWord(word, mapping) {
    try {
        const response = getEmoji(word.toLowerCase().replace(/[^a-z0-9_\s]/g, '').trim(), mapping)
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
