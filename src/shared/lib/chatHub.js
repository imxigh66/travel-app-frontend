import * as signalR from '@microsoft/signalr';

let connection = null;

function buildConnection() {
  return new signalR.HubConnectionBuilder()
    .withUrl('http://localhost:5114/hubs/chat', {
      accessTokenFactory: () => localStorage.getItem('authToken') ?? '',
    })
    .withAutomaticReconnect()
    .configureLogging(signalR.LogLevel.Warning)
    .build();
}

export const chatHub = {
  async connect() {
    if (!connection) {
      connection = buildConnection();
    }
    if (connection.state === signalR.HubConnectionState.Disconnected) {
      await connection.start();
    }
  },

  async disconnect() {
    if (connection && connection.state !== signalR.HubConnectionState.Disconnected) {
      await connection.stop();
    }
    connection = null;
  },

  async joinConversation(conversationId) {
    if (!connection) return;
    await connection.invoke('JoinConversation', conversationId);
  },

  async sendMessage(conversationId, content) {
    if (!connection) return;
    await connection.invoke('SendMessage', conversationId, content);
  },

  onReceiveMessage(callback) {
    if (!connection) return () => {};
    connection.on('ReceiveMessage', callback);
    return () => connection?.off('ReceiveMessage', callback);
  },

  onUserOnline(callback) {
    if (!connection) return () => {};
    connection.on('UserOnline', callback);
    return () => connection?.off('UserOnline', callback);
  },

  onUserOffline(callback) {
    if (!connection) return () => {};
    connection.on('UserOffline', callback);
    return () => connection?.off('UserOffline', callback);
  },

  joinTripChat(tripId) {
    if (!connection) return;
    connection.invoke('JoinTripChat', tripId).catch(console.error);
  },

  leaveTripChat(tripId) {
    if (!connection) return;
    connection.invoke('LeaveTripChat', tripId).catch(console.error);
  },

  sendTripMessage(tripId, content) {
    if (!connection) return;
    return connection.invoke('SendTripMessage', tripId, content);
  },

  onReceiveTripMessage(callback) {
    if (!connection) return;
    connection.on('ReceiveTripMessage', callback);
  },

  offReceiveTripMessage() {
    if (!connection) return;
    connection.off('ReceiveTripMessage');
  },
};
