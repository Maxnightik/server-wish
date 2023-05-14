import fs from 'node:fs/promises';
import http from 'node:http';
import { v4 as uuidv4 } from 'uuid';
import jwt from 'jsonwebtoken';

const PORT = 3000;
const DATA_FILE_PATH = './users.json';
const JWT_SECRET =
  'a82ac686755e942e90b228f8ef257b5edcfd17677997452dafce68e94496976d';

const server = http.createServer(async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader(
    'Access-Control-Allow-Methods',
    'GET, POST, OPTIONS, PUT, DELETE',
  );
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-Requested-With, Content-Type, Authorization',
  );

  if (req.method === 'OPTIONS') {
    // end = закончить формировать ответ и отправить его клиенту
    res.end();
    return;
  }

  if (req.url === '/register' && req.method === 'POST') {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk.toString();
    });
    req.on('end', async () => {
      const newUser = JSON.parse(body);
      const users = await readUsersFile();
      if (
        users.find(
          (user) => user.login.toLowerCase() === newUser.login.toLowerCase(),
        )
      ) {
        res.writeHead(409, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'User already exists' }));
      } else {
        newUser.id = uuidv4();
        newUser.wish = {};
        users.push(newUser);
        await saveUsersFile(users);
        res.writeHead(201, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'User created successfully' }));
      }
    });
  } else if (req.url === '/login' && req.method === 'POST') {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk.toString();
    });
    req.on('end', async () => {
      const { login, password } = JSON.parse(body);
      const users = await readUsersFile();
      const user = users.find(
        (user) =>
          user.login.toLowerCase() === login.toLowerCase() &&
          user.password === password,
      );
      if (!user) {
        res.writeHead(401, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Invalid credentials' }));
      } else {
        const token = generateToken(user.id);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ token }));
      }
    });
  } else if (req.url === '/addWish' && req.method === 'POST') {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk.toString();
    });
    req.on('end', async () => {
      const { category, ...wish } = JSON.parse(body);
      const token = req.headers.authorization?.split(' ')[1];
      try {
        const { id } = jwt.verify(token, JWT_SECRET);
        const users = await readUsersFile();
        const userIndex = users.findIndex((user) => user.id === id);
        if (userIndex < 0) {
          throw new Error('User not found');
        }
        const newWish = { id: uuidv4(), ...wish };
        if (users[userIndex].wish[category]) {
          users[userIndex].wish[category].push(newWish);
        } else {
          users[userIndex].wish[category] = [newWish];
        }
        if (newWish.image) {
          const matches = newWish.image.match(
            /^data:image\/([A-Za-z-+/]+);base64,(.+)$/,
          );
          if (!matches || matches.length !== 3) {
            throw new Error('Invalid image data URL');
          }
          const extension = matches[1].replace('jpeg', 'jpg');
          const base64Data = matches[2];
          await fs.writeFile(
            `./image/${newWish.id}.${extension}`,
            base64Data,
            'base64',
          );
          newWish.image = `/image/${newWish.id}.${extension}`;
        }
        await saveUsersFile(users);
        res.writeHead(201, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Wish added successfully' }));
      } catch (err) {
        res.writeHead(401, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: err.message }));
      }
    });
  } else if (req.url.startsWith('/wishlist/') && req.method === 'GET') {
    const login = req.url.split('/')[2];
    const users = await readUsersFile();
    const user = users.find(
      (user) => user.login.toLowerCase() === login.toLowerCase(),
    );
    if (!user) {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ message: 'User not found' }));
    } else {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(user.wish));
    }
  } else if (req.url.startsWith('/wish/') && req.method === 'GET') {
    const id = req.url.split('/')[2];
    const token = req.headers.authorization?.split(' ')[1];
    try {
      const { id: userId } = jwt.verify(token, JWT_SECRET);
      console.log('userId: ', userId);
      const users = await readUsersFile();
      const user = users.find((user) => user.id === userId);
      if (!user) {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'User not found' }));
      } else {
        const wish = user.wish;
        const item = Object.keys(wish)
          .map((category) => wish[category])
          .reduce((acc, cur) => acc.concat(cur), [])
          .find((item) => item.id === id);
        if (!item) {
          res.writeHead(404, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ message: 'Item not found' }));
        } else {
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify(item));
        }
      }
    } catch (err) {
      res.writeHead(401, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ message: err.message }));
    }
  } else {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ message: 'Route not found' }));
  }
});

function readUsersFile() {
  return fs.readFile(DATA_FILE_PATH, 'utf-8').then((data) => JSON.parse(data));
}

function saveUsersFile(users) {
  return fs.writeFile(DATA_FILE_PATH, JSON.stringify(users, null, 2));
}

function generateToken(userId) {
  return jwt.sign({ id: userId }, JWT_SECRET);
}

server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
