function ConnectServer() {
    currentHost = 'localhost:12345';

    // connect to WebSocket server:
    try {
        oscWebSocket = new osc.WebSocketPort({
            url: "ws://" + currentHost,
            metadata: true
        });

        oscWebSocket.on("ready", onSocketOpen);
        oscWebSocket.on("message", onSocketMessage);
        oscWebSocket.on("error", function(e){
            print(e.message);
        });
  
        oscWebSocket.open();
    } catch(e) {
        print(e);
        statusMessage = e;
    }
}

function SendMessage(address, msg) {
    console.log(address, msg);
    // send the OSC message to server. (osc.js will convert it to binary packet):
    oscWebSocket.send({
        address: address,
        args: [{
            type: "s",
            value: msg
        }]
    });
}


function onSocketOpen(e) {
    print('server connected');
    statusMessage = 'server connected';
}


function onSocketMessage(message) {
    print(message);
    if (message) {
        receivedMessage = 'address: ' + message.address;
        if (message.args && message.args.length > 0) {
            receivedMessage += ', value: ' + message.args[0].value;
        }
    }
}