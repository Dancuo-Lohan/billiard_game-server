// #########################################################################
// #########################################################################
// #########################################################################
const GameServer = require('../socket_handler/GameServer');
class Client {
    // ######### CONSTRUCTOR #########
    constructor() {
        this.socket;
        this.pseudo = "";
        this.gameServer;
    }
// #########################################################################
    login(pseudo, socket) {
        this.pseudo = `${pseudo}`;
        this.socket = socket;

        this.socket.send(JSON.stringify({
            type: 'info',
            message: `Vous êtes connecté sous le pseudo ${this.pseudo}`
        }));
    }
// #########################################################################
    startGame() {
        let newGameServer = new GameServer();
        this.gameServer = newGameServer.startGame(this);
        
        this.socket.send(JSON.stringify({
            type: 'info',
            message: `Vous venez de rejoindre le serveur créé : ${this.gameServer.serverID}`
        }));
    }
// #########################################################################
    joinGame(gameServer) {
        this.gameServer = gameServer;

        this.socket.send(JSON.stringify({
            type: 'info',
            message: `Un serveur vient d'être créé : ${this.gameServer.serverID}`
        }));
    }
// #########################################################################
    inviteClientInCurrentGame(clientInvited) {
        clientInvited.socket.send(JSON.stringify({
            type: 'game_invitation',
            playerID: this.pseudo
       }));
        this.socket.send(JSON.stringify({
            type: 'info',
            message: `Vous venez d'inviter le joueur ${clientInvited.pseudo} à rejoindre votre partie`
        }));
    }
// #########################################################################
    acceptClientInvitation(clientHost) {
        this.gameServer.clientDisconnect(this)
        this.gameServer.clientJoinGame(this, clientHost.gameServer)

        clientHost.socket.send(JSON.stringify({
            type: 'info',
            message: `Le joueur ${this.pseudo} vient de rejoindre votre partie`
        }));
        this.socket.send(JSON.stringify({
            type: 'info',
            message: `Vous êtes désormais avec le joueur ${clientHost.pseudo}`
        }));
    }
// #########################################################################
    disconnectFromCurrentGame() {
        this.gameServer.clientDisconnect(this)
        let newGameServer = new GameServer();
        this.gameServer = newGameServer.startGame(this);
    }
// #########################################################################
    disconnect() {
        if(this.gameServer != undefined) {
            this.gameServer.clientDisconnect(this)
        }
    }
}
// #########################################################################
// #########################################################################
// #########################################################################
module.exports = Client;