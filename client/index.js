const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const readline = require('readline');
const path = require('path');

// Load Proto file
const protoPath = path.resolve(__dirname, 'chat.proto');
const packageDefinition = protoLoader.loadSync(protoPath, {});
const grpcObject = grpc.loadPackageDefinition(packageDefinition);

// Chat service
const chatService = grpcObject.ChatService;

const client = new chatService('192.168.0.14:1010', grpc.credentials.createInsecure());

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function joinRoom(username, room) {
  console.log(username);
  console.log(room);

  client.JoinRoom({ username, room }, (error, response) => {
    console.log(response);
    if (error) {
      console.error(error);
      return;
    }
    console.log(response.message);
  });
}

function startChat(username) {
  rl.on('line', (line) => {
    const command = line.split(' ');

    if (command[0] === '/join') {
      const room = command[1];
      joinRoom(username, room);
    } else if (command[0] === '/send') {
      const message = command.slice(1).join(' ');
      sendMessage(username, message, "main");
    } else if (command[0] === '/leave') {
      leaveRoom(username);
    } else if (command[0] === '/dm') {
      const to = command[1];
      const message = command.slice(2).join(' ');
      directMessage(username, to, message);
    } else {
      console.log('Unknown command');
    }
  });
}

rl.question('Enter your username: ', (username) => {
  startChat(username);
});
