# @mhycy/routeros-client
MikroTik RouterOS API client for node.js.

## Table of Contents
- [@mhycy/routeros-client](#mhycyrouteros-client)
  - [Table of Contents](#table-of-contents)
  - [Install](#install)
  - [Usage](#usage)
  - [API](#api)
    - [module.createClient(options)](#modulecreateclientoptions)
    - [Class: module.CommandBuilder](#class-modulecommandbuilder)
      - [new mooduel.CommandBuilder(command, [callback])](#new-mooduelcommandbuildercommand-callback)
      - [CommandBuilder.addAttr(name, value)](#commandbuilderaddattrname-value)
      - [CommandBuilder.setAttrs(attrs)](#commandbuildersetattrsattrs)
      - [CommandBuilder.exists(name)](#commandbuilderexistsname)
      - [CommandBuilder.doesntExists(name)](#commandbuilderdoesntexistsname)
      - [CommandBuilder.equal(name, value)](#commandbuilderequalname-value)
      - [CommandBuilder.lessThan(name, value)](#commandbuilderlessthanname-value)
      - [CommandBuilder.greaterThan(name, value)](#commandbuildergreaterthanname-value)
      - [CommandBuilder.operation(operation)](#commandbuilderoperationoperation)
    - [Class: module.Client](#class-moduleclient)
      - [new module.Client(options)](#new-moduleclientoptions)
      - [Event: 'receive'](#event-receive)
      - [Client.socket](#clientsocket)
      - [Client.close()](#clientclose)
      - [Client.sendSentences(sentences)](#clientsendsentencessentences)
      - [Client.sendSentencesAsync(sentences)](#clientsendsentencesasyncsentences)
      - [Client.command(command)](#clientcommandcommand)
      - [Client.login(name, password)](#clientloginname-password)
      - [Client.setLogger(logger)](#clientsetloggerlogger)
    - [module.Logger](#modulelogger)
    - [module.Utils](#moduleutils)

## Install
```console
$ npm install @mhycy/routeros-client
```

## Usage
```js
const RouterClient = require('@mhycy/routeros-client');

const USER = "admin";
const PASSWD = "test"

// connect options
const connectOptions = {
  host: '192.168.1.254',
  // port: 8728,
  // encoding: 'gbk',
  debug: true
};

// create client instance
const client = RouterClient.createClient(connectOptions);

// async request
(async function() {
  // login helper function
  await client.login(USER, PASSWD);

  // login use command builder
  await client.command("/login").setAttrs({
    name: USER,
    password: PASSWD
  }).send();
  
  // get interfaces that 'type' attribute equal 'pppoe-out'
  await client.command("/interface/print")
          .equal("type", "pppoe-out")
          .send();

  client.close();
})();
```

## API
### module.createClient(options)
Helper for `new module.Client(options)`

### Class: module.CommandBuilder
Command sentences chainable query builder.

**Query word** see offical wiki: [Mikrotik-Wiki-API](https://wiki.mikrotik.com/wiki/Manual:API#Queries)

**Example:**
```js
let sentences = new CommandBuilder("/interface/print")
                      .equal('type', 'pppoe-out')
                      .get();
/* sentences
[
  '/interface/print',
  '?type=pppoe-out'
]
*/
```
#### new mooduel.CommandBuilder(command, [callback])
* `command` `<string>` command word. Example: `/interface/print`
* `callback` `<Function>` use for `.get()` method. Defualt: `(sentences) => { return sentences; }`
  * `sentences` `<array>` sentences array.

Create a new CommandBuilder object.

Example:
```js
new CommandBuilder('/login', (sentences) => {
  console.log(sentences);
})
.setAttrs({
  name: 'admin',
  password: 'test'
})
.get();

// console.log output
// [
//   '/login',
//   '=name=admin',
//   '=password=test',
// ]
```

#### CommandBuilder.addAttr(name, value)
* `name` `<string>` attribute name.
* `value` `<string>` attributes value.

Add an attribute value to exists attributes object.

Example:
```js
let sentences = new CommandBuilder('/login')
      .setAttr(name, 'admin')
      .setAttr(password, 'test')
      .get();
```

#### CommandBuilder.setAttrs(attrs)
* `attrs` `<object>` attributes object.

Overwrite attributes object.

Example:
```js
let sentences = new CommandBuilder('/login')
      .setAttrs({
        name: 'admin',
        password: 'test'
      })
      .get();
```

#### CommandBuilder.exists(name)
* `name` `<string>` property name.

Query word `?name`, check property `name` exists.

#### CommandBuilder.doesntExists(name)
* `name` `<string>` property name.

Query word `?-name`, check property `name` doesn't exists.

#### CommandBuilder.equal(name, value)
* `name` `<string>` property name.
* `value` `<string>` attributes value.

Query word `?name=value`, check property `name` has value equal to `value`.

#### CommandBuilder.lessThan(name, value)
* `name` `<string>` property name.
* `value` `<string>` attributes value.

Query word `?<name=value`, check property `name` has value less than `value`.

#### CommandBuilder.greaterThan(name, value)
* `name` `<string>` property name.
* `value` `<string>` attributes value.

Query word `?>name=value`, check property `name` has value greater than `value`.

#### CommandBuilder.operation(operation)
* `operation` `<string>` operation word < `|`, `&`, `!`, `.` > .

Operation word see [Mikrotik-Wiki-API](https://wiki.mikrotik.com/wiki/Manual:API#Queries).

### Class: module.Client

#### new module.Client(options)
* `options` <Object>
  * `host` `<string>` Router hostname or ip
  * `port` `<number>` api port, doesn't support ssl. Default: `8728`.
  * `encoding` `<string>` sentences enc/dec encoding, it equal windows environment encode. (MikroTik WinBox used it) Default: `gbk`.
  * `debug` `<boolean>` if `true` print debug infomation to console. Default: `false`.

Create a new Client object.

#### Event: 'receive'
* `<object>` sentences decode object.

```js
// '!done'
{
  status: true
}

// '!re'
// ......
// '!re'
// ......
{
  'status': true,
  'replies': [
    {
      '.id': '*9',
      name: 'pppoe-out1',
      type: 'pppoe-out',
      'link-downs': '0',
      'rx-byte': '0',
      'tx-byte': '0',
      'rx-packet': '0',
      'tx-packet': '0',
      'rx-drop': '0',
      'tx-drop': '0',
      'tx-queue-drop': '0',
      'rx-error': '0',
      'tx-error': '0',
      'fp-rx-byte': '0',
      'fp-tx-byte': '0',
      'fp-rx-packet': '0',
      'fp-tx-packet': '0',
      running: 'false',
      'tx-queue-drop': '0',
      'rx-error': '0',
      'tx-error': '0',
      'fp-rx-byte': '0',
      'fp-tx-byte': '0',
      'fp-rx-packet': '0',
      'fp-tx-packet': '0',
      running: 'true',
      disabled: 'false',
      comment: 'ChinaNet 500M'
    }
  ]
}

// '!trap'
// '=message=invalid user name or password (6)'
{
  status: false,
  message: 'invalid user name or password (6)'
}

// '!fatal',
// 'not logged in',
{
  status: false,
  message: 'not logged in'
}
```

#### Client.socket
`<net.Socket>` instance.

#### Client.close()
Close `Client.socket`. Call `<net.Socket.end()>` to close.

#### Client.sendSentences(sentences)
* `sentences` `<array>` sentences array.

Direct write a sentences, you need set listener to listen `Event::receive` by your self.

#### Client.sendSentencesAsync(sentences)
* `sentences` `<array>` sentences array.

Return: `<Promise>`

Promise resolve an object. see: [Usage](#usage)

#### Client.command(command)
* `command` `<string>` command words. Example: `/login` or `/interface/print`

Return: `<CommandBuilder>`

Return chainable query builder. `CommandBuilder.get()` method will send sentences request. (Use: `Client.sendSentencesSync()`)

#### Client.login(name, password)
* `name` `<string>` user name.
* `password` `<string>` user password.

Return: `<Promise>`

Promise resolve an object. see: [Usage](#usage)

#### Client.setLogger(logger)
* `logger` `<object>` new logger instance.

Logger instance need implementing some method. see `src/logger.js` source code.

### module.Logger
Module logger, export api see `src/logger.js` source code.

### module.Utils
Module utilities, export api see `src/utils.js` source code.