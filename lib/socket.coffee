net = require('net')

class Socket
    constructor: ->
        @_socket = null

    bind: (port, host='0.0.0.0') ->
        self = this
        @_socket = net.createServer (c) ->
            self._handleConnection(self, c)
        @_socket.listen(port, host)

    connect: (port, host='127.0.0.0') ->
        self = this
        @_socket = net.createConnection {port: port, host: host}, ->
            self._handleConnection(self, self._socket)

    send: (data) ->
        string = JSON.stringify({data: data})

        buffer = new Buffer(4 + string.length)
        buffer.writeUInt32BE(string.length, 0)
        buffer.write(string, 4)

        @_socket.write(buffer)

    _handleConnection: (self, c) ->
        client = new Socket()
        client._socket = c

        data = null;
        length = null;

        c.on 'data', (d) ->
            if data == null
                data = d
            else
                data = Buffer.concat([data, d])

            loopp = true
            while loopp
                loopp = false

                if length == null and data.length >= 4
                    length = data.readUInt32BE(0)

                if length != null and data.length >= length + 4
                    messageData = data.slice(4, 4 + length)
                    message = JSON.parse(messageData.toString())

                    data = data.slice(4 + length)
                    loopp = true if data.length > 0
                    length = null

                    self.onMessage(client, message.data)

module.exports =
    Socket: Socket
