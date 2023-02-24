const WebSocket = require('ws');
const GameServer = require('./server/socket_handler/GameServer');
const Client = require('./server/socket_handler/Client');
const server = new WebSocket.Server({ port: 8080 });
console.log("[o] | Server on :)")

let players = new Map();
let gameServers = new Map();

server.on('connection', function connection(socket) {
    console.log("[+] | Client connected")
    let client = new Client();
    let gameServer = new GameServer();

    socket.on('message', function incoming(message) {
        let data = JSON.parse(message);
        switch (data.type) {
            //Lors de la connexion, on assigne le joueur à une partie
            case 'login':
                client.login(`${data.playerPseudo}`, socket)
                players.set(client.pseudo, client);
                client.startGame();
                gameServers.set(client.gameServer.serverID, client.gameServer)
                break;
            //Invitation de l'hôte à un joueur pour rejoindre sa partie
            case 'invite_in_current_game':
                let invitedPlayerIsFind = 0
                for (let [loopedPseudo, loopedclient] of players) {
                    if(loopedPseudo == data.playerInvitedPseudo) {
                        client.inviteClientInCurrentGame(loopedclient);
                        invitedPlayerIsFind = 1
                    }
                }
                if (invitedPlayerIsFind == 1) {
                    client.socket.send(JSON.stringify({
                        type: 'information',
                        content: 'Le joueur vient a été invité'
                    }));
                } else {
                    client.socket.send(JSON.stringify({
                        type: 'information',
                        content: 'Le joueur invité n\'existe pas'
                    }));
                }
                break;
            //Si le joueur accepte l'invitation de l'hôte
            case 'accept_game_invitation':
                for (let [loopedPseudo, loopedclient] of players) {
                    if(loopedPseudo == data.playerHostPseudo) {
                        client.acceptClientInvitation(loopedclient);
                    }
                }
                break;
            case 'update_object_position':
                if(client.gameServer != undefined) {
                    for (let serverClient of client.gameServer.playersInGameServer) {
                        serverClient.socket.send(JSON.stringify({
                            type: 'object_move',
                            objectUUID: data.objectUUID,
                            position: data.position,
                            quaternion: data.quaternion
                        }));
                    }
                }
                break;
            case 'leave_game':
                client.disconnectFromCurrentGame()
                gameServers.set(client.gameServer.serverID, client.gameServer)
                break;
            case 'ping':
                socket.send(JSON.stringify({
                    type: 'pong'
                }))
                break;
            default:
                console.error('Message non reconnu reçu du client : ', data);
                break;
        }
    });

    socket.on('close', function close() {
        client.disconnect()
        console.log("[-] | Client disconnected")
    });
});