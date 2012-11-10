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
        function(c) {
            self._handleConnection(self, c);
        }
    );
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
                console.log(data);
                console.log(data.toString());
                console.log(length);
                console.log('-------');

                var messageData = data.slice(4, 4 + length);
                var message = JSON.parse(messageData.toString());

                data = data.slice(4 + length);
                if (data.length > 0) loop = true;
                length = null;

                self.onMessage(message.data);
            }
        }
    });
};

module.exports = {
    Socket: Socket
};
