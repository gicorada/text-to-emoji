let probability = 7  // 0-10, with 0 is never and 10 is always

async function modifyTextNodes(node, callback) {
    if (node.nodeType === Node.TEXT_NODE) {
        if (node.parentNode && node.parentNode.nodeName !== 'SCRIPT') {
            node.textContent = await callback(node.textContent);
        }
    } else {
        for (let child of node.childNodes) {
            await modifyTextNodes(child, callback);
        }
    }
}
  
async function stringAnalyzer(text) {
    const words = text.split(" ");
    const promises = words.map(analyzeAndReplaceWord);
    const newWords = await Promise.all(promises);
    return newWords.join(" ");
}

async function analyzeAndReplaceWord(word) {
    let emoji = word.replace(/[!"#$%&'()*+,-./:;<=>?@[\]^_`{|}~]/g, '').toLowerCase();
    try {
        const response = await fetch("https://emoji-api.com/emojis?search=" + word + "&access_key=dd7d21a5d055d3c521c3dba1e38ba343e520734c"); // I need to change this to a better API, maybe a local database
        const json = await response.json();
        if (json.length > 0) {
            emoji = json[0].character; // replace the word with the first found emoji
        }
    } catch (error) {
        console.error('Error:', error);
		emoji = word;
    }
    return emoji;
}
  
modifyTextNodes(document.body, stringAnalyzer);