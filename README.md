Glowing Bear
============

Glowing Bear is a simple messaging library for Node.js. It supports
sending and receiving messages over TCP.

Usage
-----
Here is an example of an echo server, which sends any messages it
receives back to the client. The client prints the messages it receives.

    var gb = require('glowing-bear');

    var server = new gb.Socket();
    server.bind(3000, '0.0.0.0');
    server.onMessage = function(client, data) {
        client.send(data);
    };

    var client = new gb.Socket();
    client.connect(3000, '127.0.0.1');
    client.onMessage = function(server, data) {
        console.log(data);
    };

    client.send('Hello, world!');
    client.send({some: 'object'});
    client.send([42, 1337, 3.14]);

You can send any objects that can be converted to JSON.

To do
-----
- Add an `on('connect', ...)` method to prevent race
  conditions.
- Change `onMessage` to `on('message', ...)`.
