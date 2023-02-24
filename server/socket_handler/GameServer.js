class GameServer {
    // ######### CONSTRUCTOR #########
    constructor() {
        this.serverID;
        this.playersInGameServer = [];
    }

    startGame(client) {
        this.serverID = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        this.playersInGameServer.push(client)
        client.socket.send(JSON.stringify({
            type: 'start_game'
        }));
        return(this)
    }

    clientDisconnect(client) {
        this.playersInGameServer.splice(client, 1);
        if (this.playersInGameServer.length === 0) {
            delete this;
        } else {
            for (let serverClient of client.gameServer.playersInGameServer) {
                serverClient.socket.send(JSON.stringify({
                    type: 'player_leave',
                    playerPseudo: client.pseudo
                }));
            }
        }
    }

    clientJoinGame(client, serverHost) {
        this.clientDisconnect(client);

        client.joinGame(serverHost)
        serverHost.playersInGameServer.push(client)
    }

}


module.exports = GameServer;