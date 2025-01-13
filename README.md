# GRPC Chat system

## Running the server
```bash
docker-compose up --build
```

# Running a client
```bash
docker run -it chat-socket-node-client  
```

# To run migration:
```bash
npx sequelize-cli db:migrate --config ./sequelize-config.js
```

# To undo a migration
```bash
npx sequelize-cli db:migrate:undo:all --config ./sequelize-config.js
```

# Usage

### Available Commands
Once connected as a client, you can use the following commands:
- `/join <roomName>` - Join a chat room
- `/leave` - Leave current room
- `/dm <username> <message>` - Send a direct message
- `/quit` - Exit application
