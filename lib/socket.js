var net = require('net');

Socket = function() { };

Socket.prototype.bind = function(host, port) {
    var self = this;

    this._server = net.createServer(function(c) {
        self._handleConnection(self, c);
    });
    this._server.listen(port, host);
};

Socket.prototype.connect = function(host, port) {
    var self = this;

    this._connection = net.createConnection(
        {port: port, host: host},
        function() {
            self._handleConnection(self, self._connection);
        }
    );
};

Socket.prototype.send = function(data) {
    var conn = new Connection(this._connection);
    conn.send(data);
};

Socket.prototype._handleConnection = function(self, c) {
    var data = null;
    var length = null;
    c.on('data', function(d) {
        if (data === null) {
            data = d;
        } else {
            data = Buffer.concat([data, d]);
        }

        var loop = true;
        while (loop) {
            loop = false;

            if (length === null) {
                if (data.length >= 4) {
                    length = data.readUInt32BE(0);
                }
            }

            if (length !== null && data.length >= length + 4) {
                var messageData = data.slice(4, 4 + length);
                var message = JSON.parse(messageData.toString());

                data = data.slice(4 + length);
                if (data.length > 0) loop = true;
                length = null;

                var connection = new Connection(c);
                self.onMessage(connection, message.data);
            }
        }
    });
};

Connection = function(connection) {
    this._connection = connection;
};

Connection.prototype.send = function(data) {
    var string = JSON.stringify({data: data});

    var buffer = new Buffer(4 + string.length);
    buffer.writeUInt32BE(string.length, 0);
    buffer.write(string, 4);

    this._connection.write(buffer);
};

module.exports = {
    Socket: Socket
};
