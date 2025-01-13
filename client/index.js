const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const readline = require('readline');
const path = require('path');

// Load Proto file
const protoPath = path.resolve(__dirname, 'chat.proto');
const packageDefinition = protoLoader.loadSync(protoPath, {});
const grpcObject = grpc.loadPackageDefinition(packageDefinition);

class ChatClient {
  constructor() {
    this.client = new grpcObject.ChatService(
      '192.168.0.14:1010',
      grpc.credentials.createInsecure()
    );
    this.currentRoom = null;
    this.username = null;
    this.stream = null;

    // Setup readline interface
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
  }

  async start() {
    try {
      await this.login();
      await this.showRoomMenu();
    } catch (error) {
      console.error('Error starting client:', error);
      this.cleanup();
    }
  }

  async login() {
    return new Promise((resolve) => {
      this.rl.question('Enter your username: ', (username) => {
        this.username = username;
        console.log(`Welcome, ${username}!`);
        resolve();
      });
    });
  }

  async joinRoom(roomName) {
    if (this.currentRoom === roomName) {
      console.log('You are already in this room');
      return;
    }

    // if (this.currentRoom) {
    //   await this.leaveRoom();
    // }

    try {
      const request = { username: this.username, roomName };
      this.stream = this.client.joinRoom(request);

      this.stream.on('data', (message) => {
        console.log(`${message.username}: ${message.content}`);
      });

      this.stream.on('error', (error) => {
        console.error('Stream error:', error);
        this.currentRoom = null;
      });

      this.stream.on('end', () => {
        console.log('Disconnected from room');
        this.currentRoom = null;
      });

      this.currentRoom = roomName;
      console.log(`Joined room: ${roomName}`);

    } catch (error) {
      console.error('Error joining room:', error);
    }
  }

  async sendMessage(content) {
    if (!this.currentRoom) {
      console.log('Not in a room');
      return;
    }

    const message = {
      username: this.username,
      roomName: this.currentRoom,
      content
    };

    this.client.sendMessage(message, (error, response) => {
      if (error) {
        console.error('Error sending message:', error);
      }
    });
  }

  async leaveRoom() {
    console.log('leaving');
  }


  async showRoomMenu() {
    console.log('\nAvailable commands:');
    console.log('/join <roomName> - Join a chat room');
    console.log('/leave - Leave current room');
    console.log('/quit - Exit application');
    
    this.rl.on('line', async (input) => {
      if (input.startsWith('/join ')) {
        const roomName = input.slice(6).trim(); // Remove '/join ' and trim whitespace
        await this.joinRoom(roomName);
      } else if (input.startsWith('/leave')) {
        // await this.leaveRoom();
      } else if (input.startsWith('/dm')) {
        // dm functionality here
      } else if (input.startsWith('/quit')) {
        // cleanup here
      } else if (this.currentRoom) {
        await this.sendMessage(input);
      } else {
        console.log('Please join a room first using /join <roomName>');
      }
    });
  }

}

process.on('SIGINT', async () => {
  console.log('\nReceived SIGINT. Cleaning up...');
  const client = new ChatClient();
  await client.cleanup();
});

const client = new ChatClient();
client.start();