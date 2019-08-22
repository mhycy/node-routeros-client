const iconv = require('iconv-lite');

function encWordLength(word) {
    if(word.length < 0x80) {
        return Buffer.from([word.length]);
    } else if(word.length < 0x4000) {
        let length = word.length | 0x8000;
        return Buffer.from([
            (length >> 8) & 0xFF,
            length & 0xFF
        ]);
    } else if(word.length < 0x200000) {
        let length = word.length | 0xC00000;
        return Buffer.from([
            (length >> 16) & 0xFF,
            (length >> 8) & 0xFF,
            length & 0xFF
        ]);
    } else if(word.length < 0x10000000) {
        let length = word.length | 0xE0000000;
        return Buffer.from([
            (length >> 24) & 0xFF,
            (length >> 16) & 0xFF,
            (length >> 8) & 0xFF,
            length & 0xFF
        ]);
    } else if(word.length < 0x8000000000){
        let length = word.length | 0xE0000000;
        return Buffer.from([
            0xF0,
            (length >> 24) & 0xFF,
            (length >> 16) & 0xFF,
            (length >> 8) & 0xFF,
            length & 0xFF
        ]);
    } else {
        throw `Word length too long. (length = ${word.length})`;
    }
}

function encSentences(sentences = [], encoding = 'gbk') {
    let bufferArray = [];
    for(let word of sentences) {
        word = iconv.encode(word, encoding);
        bufferArray.push(encWordLength(word));
        bufferArray.push(word);
    }

    bufferArray.push(encWordLength(""));
    return Buffer.concat(bufferArray);
}

function decWordLength(wordLengthBuffer) {
    let length = wordLengthBuffer[0];

    if((length & 0x80) == 0x00) {
        return length;
    } else if( (length & 0xC0) == 0x80 ) {
        length &= ~0xC0;
        length <<= 8;
        length += wordLengthBuffer[1];
    } else if( (length & 0xE0) == 0xC0 ) {
        length &= ~0xE0;
        length <<= 8;
        length += wordLengthBuffer[1];
        length <<= 8;
        length += wordLengthBuffer[2];
    } else if( (length & 0xF0) == 0xE0 ) {
        length &= ~0xF0;
        length <<= 8;
        length += wordLengthBuffer[1];
        length <<= 8;
        length += wordLengthBuffer[2];
        length <<= 8;
        length += wordLengthBuffer[3];
    } else if( (length & 0xF8) == 0xF0 ) {
        length = wordLengthBuffer[1];
        length <<= 8;
        length += wordLengthBuffer[2];
        length <<= 8;
        length += wordLengthBuffer[3];
        length <<= 8;
        length += wordLengthBuffer[4];
    } else {
        return 0;
    }
    return length;
}

function decSentences(sentencesBuffer, encoding = 'gbk') {
    let words = [];
    
    let seek = 0;
    while(seek < sentencesBuffer.length) {
        let wordLength = decWordLength(sentencesBuffer.slice(seek, seek + 5));

        if(wordLength < 0x80) {
            seek += 1;
            words.push(
                iconv.decode(sentencesBuffer.slice(seek, seek + wordLength), encoding)
            );
            seek += wordLength;
        } else if (wordLength < 0x4000) {
            seek += 2;
            words.push(
                iconv.decode(sentencesBuffer.slice(seek, seek + wordLength), encoding)
            );
            seek += wordLength;
        }  else if (wordLength < 0x4000) {
            seek += 3;
            words.push(
                iconv.decode(sentencesBuffer.slice(seek, seek + wordLength), encoding)
            );
            seek += wordLength;
        }  else if (wordLength < 0x200000) {
            seek += 4;
            words.push(
                iconv.decode(sentencesBuffer.slice(seek, seek + wordLength), encoding)
            );
            seek += wordLength;
        }  else if (wordLength < 0x10000000) {
            seek += 5;
            words.push(
                iconv.decode(sentencesBuffer.slice(seek, seek + wordLength), encoding)
            );
            seek += wordLength;
        } else {
           // wordLength >= 0x10000000 ignore
        }
    }

    return words;
}

function convertSentencesArrayToObject(sentencesArray) {
    let result = {}
    
    let replies = [];
    let replyObject = {};
    let decodingReply = false;

    for(let word of sentencesArray) {
        if(word.startsWith("=")) {
            word = word.slice(1);
            let wordEqualSinIndex = word.indexOf("=");

            if(wordEqualSinIndex != -1) {
                if(decodingReply) {
                    replyObject[word.slice(0, wordEqualSinIndex)] = word.slice(wordEqualSinIndex + 1);
                } else {
                    result[word.slice(0, wordEqualSinIndex)] = word.slice(wordEqualSinIndex + 1);
                }
            }
        } else if(word.startsWith("!")) {
            switch(word) {
                case "!done":
                    result.status = true;
                break;

                case "!trap":
                    result.status = false;
                break;

                case "!fatal":
                    result.status = false;
                break;

                case "!re":
                    if(decodingReply) {
                        replies.push(replyObject);
                        replyObject = {};
                    } else {
                        decodingReply = true;
                    }
                break;
            }
        } else {
            result.message = word;
        }
    }

    if(decodingReply) {
        replies.push(replyObject);
        result.replies = replies;
    }

    return result;
}

module.exports = {
    encWordLength, encSentences,
    decWordLength, decSentences,
    
    convertSentencesArrayToObject
}