
chrome.runtime.onInstalled.addListener(() => {
    chrome.action.setBadgeText({
        text: "OFF",
    });
});

chrome.action.onClicked.addListener(async (tab) => {

    const prevState = await chrome.action.getBadgeText({ tabId: tab.id });
    const nextState = prevState === 'ON' ? 'OFF' : 'ON';

    await chrome.action.setBadgeText({
        tabId: tab.id,
        text: nextState
    });

    if (nextState === 'ON') {
        chrome.scripting.executeScript({
            target: { tabId: tab.id },
            function: () => {
                function getWordWithSuffix(word) {
                    if (word.length < 3) return word;
                    const vowels = ['а', 'е', 'ё', 'и', 'о', 'у', 'ы', 'э', 'ю', 'я'];
                    // все что не в алфавите — знаки препинания
                    const alphabet = [
                        'а', 'б', 'в', 'г', 'д', 'е', 'ё', 'ж', 'з', 'и', 'й', 'к', 'л', 'м', 'н',
                        'о', 'п', 'р', 'с', 'т', 'у', 'ф', 'х', 'ц', 'ч', 'ш', 'щ', 'ъ', 'ы', 'ь', 'э', 'ю', 'я'
                    ];
                    for (let i = 0; i < word.length; i++) {
                        const char = word[i].toLowerCase();
                        let replacement = char;
                        if (vowels.includes(char)) {
                            switch (char) {
                                case 'a':
                                    replacement = 'я';
                                    break;
                                case 'у':
                                    replacement = 'ю';
                                    break;
                                case 'ы':
                                    replacement = 'и';
                                    break;
                                case 'о':
                                    replacement = 'ё';
                                    break;
                                case 'э':
                                    replacement = 'е';
                                    break;
                            }
                            const restOfWord = word.substring(i + 1);
                            if (alphabet.includes(word[word.length - 1])) {
                                return word + '-ху' + replacement + restOfWord;
                            }
                            else {
                                return word.substring(0, word.length - 1) + '-ху' + replacement + restOfWord;
                            }
                        }
                    }
                    return word;
                }


                function addHahaToTextNodes(node) {
                    if (node.nodeType === Node.TEXT_NODE) {
                        const words = node.nodeValue.split(/\s+/);
                        const modifiedWords = words.map(word => {
                            return getWordWithSuffix(word);
                        });
                        node.nodeValue = modifiedWords.join(' ');
                    } else if (node.nodeType === Node.ELEMENT_NODE) {
                        for (const childNode of node.childNodes) {
                            addHahaToTextNodes(childNode);
                        }
                    }
                }

                addHahaToTextNodes(document.body);
            },
            args: []
        });
    } else if (nextState === 'OFF') {
        chrome.tabs.reload(tab.id);
    }
});