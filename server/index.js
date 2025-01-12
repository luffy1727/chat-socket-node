const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');
const { joinRoom } = require('./services/chatService');

// Load Proto file
const protoPath = path.resolve(__dirname, 'chat.proto');
const packageDefinition = protoLoader.loadSync(protoPath, {});
const chatProto = grpc.loadPackageDefinition(packageDefinition).ChatService;

const server = new grpc.Server();

server.addService(chatProto.service, { JoinRoom: joinRoom });

// Start server
server.bindAsync("0.0.0.0:1010", grpc.ServerCredentials.createInsecure(), () => {
  console.log("Server running at http://localhost:1010");
  server.start();
});
