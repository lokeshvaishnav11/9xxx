"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const socket_io_client_1 = require("socket.io-client");
class UserSocket {
    constructor() {
        UserSocket.socket = (0, socket_io_client_1.io)(process.env.USER_SOCKET_URL, {
            transports: ['websocket'],
        });
        UserSocket.socket.on('connect', () => {
            console.log('connect user');
            // setInterval(() => {
            //   UserSocket.setExposer({
            //     balance: 10000,
            //     userId: '64643df6fcfcd41e7ee2cede',
            //   })
            // }, 3000)
        });
    }
    static setExposer({ exposer, balance, userId, commision }) {
        this.socket.emit('updateExposer', { exposer, balance, userId, commision });
    }
    static onRollbackPlaceBet(bet) {
        this.socket.emit('on-rollback-place-bet', bet);
    }
    static betDelete({ betId, userId }) {
        this.socket.emit('betDelete', { betId, userId });
    }
    static logout(user) {
        this.socket.emit('login', user);
    }
    static logoutAll() {
        this.socket.emit('logoutAll');
    }
    static logoutsp(userId) {
        this.socket.emit('logoutSp', userId);
    }
}
exports.default = UserSocket;
//# sourceMappingURL=user-socket.js.map