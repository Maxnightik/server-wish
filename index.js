import { config } from 'dotenv';
import http from 'node:http';
import { handleRegisterRequest } from './module/register.js';
import { handleLoginFromToken, handleLoginRequest } from './module/login.js';
import { handleUserRequest } from './module/getUser.js';
import { handleAddWishRequest } from './module/addWish.js';
import { handleGetWishRequest } from './module/getWish.js';
import { handleUpdateWishRequest } from './module/updateWish.js';
import { handleAvatarRequest, handleImageRequest } from './module/getImage.js';
import { handleUpdateUserRequest } from './module/updateUser.js';
import { handleDeleteWishRequest } from './module/deleteWish.js';

export const JWT_SECRET = process.env.JWT_SECRET;

config();

const PORT = 3000;

// Проверка наличия файла и создание, если его нет

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
    handleRegisterRequest(req, res);
  } else if (req.url === '/login' && req.method === 'POST') {
    handleLoginRequest(req, res);
  } else if (req.url === '/getLogin' && req.method === 'GET') {
    handleLoginFromToken(req, res);
  } else if (req.url === '/addWish' && req.method === 'POST') {
    handleAddWishRequest(req, res);
  } else if (req.url.startsWith('/user/') && req.method === 'GET') {
    handleUserRequest(req, res);
  } else if (req.url.startsWith('/user/') && req.method === 'PUT') {
    handleUpdateUserRequest(req, res);
  } else if (req.url.startsWith('/wish/') && req.method === 'PUT') {
    handleUpdateWishRequest(req, res);
  } else if (req.url.startsWith('/wish/') && req.method === 'GET') {
    handleGetWishRequest(req, res);
  } else if (req.url.startsWith('/wish/') && req.method === 'DELETE') {
    handleDeleteWishRequest(req, res);
  } else if (req.url.startsWith('/images/') && req.method === 'GET') {
    handleImageRequest(req, res);
  } else if (req.url.startsWith('/avatars/') && req.method === 'GET') {
    handleAvatarRequest(req, res);
  } else {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ message: 'Route not found' }));
  }
});

server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
  console.log('Возможные запросы:');
  console.log('POST /register');
  console.log('POST /login');
  console.log('GET /getLogin Autorization');
  console.log('POST /addWish Autorization');
  console.log('GET /user/:login');
  console.log('PUT /user/ Autorization');
  console.log('PUT /wish/:id Autorization');
  console.log('GET /wish/:id Autorization');
  console.log('DELETE /wish/:id Autorization');
});
