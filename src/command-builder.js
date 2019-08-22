const utils = require('./utils.js');

class Builder {
    constructor(command, sendCallback) {
        this.command = command;
        this.attrs = {};
        this.queries = [];

        this.sendCallback = sendCallback ? sendCallback : (sentences) => {};
    }

    addAttr(name, value) {
        this.attrs[name] = value;
        return this;
    }

    setAttrs(attrsObject) {
        this.attrs = attrsObject;
        return this;
    }

    exists(name) {
        this.queries.push(`?${name}`);
        return this;
    }

    doesntExists(name) {
        this.queries.push(`?-${name}`);
        return this;
    }

    equal(name, value) {
        this.queries.push(`?${name}=${value}`);
        return this;
    }

    lessThan(name, value) {
        this.queries.push(`?<${name}=${value}`);
        return this;
    }

    greaterThan(name, value) {
        this.queries.push(`?>${name}=${value}`);
        return this;
    }

    operation(operation) {
        this.queries.push(`?#${operation}`);
        return this;
    }

    send() {
        let sentences = [this.command];
        for(let key in this.attrs) {
            sentences.push(`=${key}=${this.attrs[key]}`);
        }

        sentences = sentences.concat(this.queries);
        return this.sendCallback(sentences);
    }
}

module.exports = {
    Builder
}