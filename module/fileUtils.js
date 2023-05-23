import { config } from 'dotenv';
import fs from 'node:fs/promises';
import jwt from 'jsonwebtoken';
import { DATA_FILE_USERS } from './checkFilesAndFoldersAvailability.js';
import { JWT_SECRET } from '../index.js';

config();

/**
 * Читает файл с данными пользователей и возвращает массив пользователей
 * @returns {Promise<Array>} - массив пользователей
 */
export const readUsersFile = () =>
  fs.readFile(DATA_FILE_USERS, 'utf-8').then(data => JSON.parse(data));

/**
 * Сохраняет массив пользователей в файл
 * @param {Array} users - массив пользователей для сохранения
 */
export const saveUsersFile = users =>
  fs.writeFile(DATA_FILE_USERS, JSON.stringify(users, null, 2));

/**
 * Генерирует JWT-токен для указанного идентификатора пользователя
 * @param {string} userId - идентификатор пользователя
 * @returns {string} - сгенерированный JWT-токен
 */
export const generateToken = userId => jwt.sign({ id: userId }, JWT_SECRET);

/**
 * Проверяет JWT-токен и возвращает декодированные данные,
 * если токен действителен
 * @param {string} token - JWT-токен для проверки
 * @returns {Object} - декодированные данные из токена
 * @throws {Error} - если токен недействительный
 */
export const verifyToken = token => jwt.verify(token, JWT_SECRET);

/**
 * Получает login пользователя по переданному jwt токену.
 *
 * @param {string} token - jwt токен.
 * @return {string} - login пользователя.
 */
export const getLoginFromToken = async token => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const users = await readUsersFile();
    const user = users.find(user => user.id === decoded.id);
    return user ? user.login : null;
  } catch (err) {
    console.error(err);
    return null;
  }
};

export const isBase64 = str => {
  const base64Regex = /^data:image\/([A-Za-z-+/]+);base64,(.+)$/;
  return base64Regex.test(str);
};
