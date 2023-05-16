import { config } from 'dotenv';
import fs from 'node:fs/promises';
import jwt from 'jsonwebtoken';
import { DATA_FILE_PATH } from './checkFileAvailability.js';
import { JWT_SECRET } from '../index.js';


config();



export function readUsersFile() {
  return fs.readFile(DATA_FILE_PATH, 'utf-8').then(data => JSON.parse(data));
}

export function saveUsersFile(users) {
  return fs.writeFile(DATA_FILE_PATH, JSON.stringify(users, null, 2));
}

export function generateToken(userId) {
  const token = jwt.sign({ id: userId }, JWT_SECRET);
  return token;
}

export function verifyToken(token) {
  return jwt.verify(token, JWT_SECRET);
}
