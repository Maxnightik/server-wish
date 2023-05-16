import { config } from 'dotenv';
import fs from 'node:fs/promises';
import jwt from 'jsonwebtoken';
import { DATA_FILE_USERS } from './checkFilesAndFoldersAvailability.js';
import { JWT_SECRET } from '../index.js';

config();

export const readUsersFile = () =>
  fs.readFile(DATA_FILE_USERS, 'utf-8').then(data => JSON.parse(data));

export const saveUsersFile = users =>
  fs.writeFile(DATA_FILE_USERS, JSON.stringify(users, null, 2));

export const generateToken = userId => jwt.sign({ id: userId }, JWT_SECRET);

export const verifyToken = token => jwt.verify(token, JWT_SECRET);
