const net = require('net');
const events = require('events');
const utils = require('./utils.js');

const Logger = require('./logger.js')
const CommandBuilder = require('./command-builder.js');

class Client extends events.EventEmitter {
    constructor(options) {
        super();
        let {host, port = 8728, encoding = 'gbk', debug = true} = options;

        // initalize logger instalce
        this.logger = Logger.createLogger("@mhycy/routeros-client/src/client.js", debug ? Logger.LEVEL.DEBUG : Logger.LEVEL.INFO);

        // session global encoding, it equal WinBox default encoding (windows default encoding)
        this.encoding = encoding;

        this.recvBuffer = Buffer.alloc(0);
        this.recvSentencesArray = [];

        // create connection
        this.socket = net.createConnection({host, port});
        
        // data receive handler
        this.socket.on("data", function(buffer) {
            this.recvBuffer = Buffer.concat([ this.recvBuffer, buffer ]);

            // find sentences (end of 0x00) then decode it.
            let sentencesEndOffset = this.recvBuffer.indexOf(0x00);
            while(sentencesEndOffset != -1) {
                if(sentencesEndOffset > 0) {
                    let sentences = utils.decSentences(this.recvBuffer.slice(0, sentencesEndOffset), this.encoding);                    
                    
                    // found sencentes, try Emit::receive
                    this.emitSentencesReceive(sentences);
                    this.recvBuffer = this.recvBuffer.slice(sentencesEndOffset + 1);
                }

                sentencesEndOffset = this.recvBuffer.indexOf(0x00);
            }
        }.bind(this));
    }
    
    // it will overwrite default logger instance, debug optionb control by new logger instance
    setLogger(logger) {
        this.logger = logger;
    }

    close() {
        this.socket.end();
    }

    emitSentencesReceive(recvSentencesArray) {
        // receive sentences array, line by line
        // merge 'this.recvSentencesArray', that's a sentences buffer.
        this.recvSentencesArray = this.recvSentencesArray.concat(recvSentencesArray);

        // if first word equal '!re' continue receive data then merge it
        // else convert sentences to object then emit Event::receive
        if(recvSentencesArray[0] == '!re') {
            return;
        }
        
        // convert sentences array to object
        this.logger.debug("Client::emitSentencesReceive -> recvSentencesArray", this.recvSentencesArray);
        let recvObject = utils.convertSentencesArrayToObject(this.recvSentencesArray);
        
        // reset recvSentencesArray buffer
        this.recvSentencesArray = [];
        
        // emit Event::receive
        this.logger.debug("Client::Emit<receive(Object)> -> receive", recvObject);
        this.emit("receive", recvObject);
    }

    sendSentences(sentences = []) {
        this.logger.debug("Client::sendSentences -> sentences", sentences);
        this.socket.write(utils.encSentences(sentences, this.encoding));
    }

    sendSentencesAsync(sentences = []) {
        return new Promise((resolve, reject) => {
            try {
                this.sendSentences(sentences);

                this.on("receive", function(result) {
                    resolve(result);
                });
            } catch(error) {
                reject(error);
            }
        })
    }

    command(command) {
        return new CommandBuilder(command, function(sentences) {
            return this.sendSentencesAsync(sentences);
        }.bind(this));
    }

    login(name, password) {
        return this.command("/login").setAttrs({name, password}).get();
    }
    
}

module.exports = Client