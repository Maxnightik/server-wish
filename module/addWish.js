import fs from 'node:fs/promises';
import { v4 as uuidv4 } from 'uuid';
import { readUsersFile, saveUsersFile, verifyToken } from './fileUtils.js';
import { DATA_FOLDER_IMAGES } from './checkFilesAndFoldersAvailability.js';
import sharp from 'sharp';
import { sendResponse } from './serviceResponse.js';

/**
 * Сохраняет изображение в формате base64 в файл и возвращает путь к файлу
 * @param {string} image - изображение в формате base64
 * @param {string} id - идентификатор изображения
 * @returns {Promise<string>} - путь к сохраненному файлу
 * @throws {Error} - если image не является допустимым
 * URL-адресом данных изображения
 */
const saveImage = async (image, id) => {
  const matches = image.match(/^data:image\/([A-Za-z-+/]+);base64,(.+)$/);
  if (!matches || matches.length !== 3) {
    throw new Error('Invalid image data URL');
  }

  const base64Data = matches[2];

  const MAX_IMAGE_SIZE = 500;

  const processedImageBuffer = await sharp(Buffer.from(base64Data, 'base64'))
    .resize({ width: MAX_IMAGE_SIZE, height: MAX_IMAGE_SIZE, fit: 'contain' })
    .background({ r: 255, g: 255, b: 255, alpha: 1 })
    .flatten({ background: { r: 255, g: 255, b: 255, alpha: 1 } })
    .jpeg({ quality: 80 })
    .toBuffer();

  const imageFilePath = `${DATA_FOLDER_IMAGES}${id}.jpg`;
  await fs.writeFile(imageFilePath, processedImageBuffer);
  return imageFilePath;
};

/**
 * Добавляет новое желание в список желаний пользователя
 * в соответствующей категории
 * @param {Array} users - массив пользователей, в котором нужно добавить желание
 * @param {number} userIndex - индекс пользователя в массиве
 * @param {string} category - категория желания
 * @param {Object} wish - объект желания
 * @returns {Promise<Object>} - добавленное желание
 */
const addWishToUser = async (users, userIndex, category, wish) => {
  const newWish = { id: uuidv4(), ...wish };
  const user = users[userIndex];
  if (user.wish[category]) {
    user.wish[category].push(newWish);
  } else {
    user.wish[category] = [newWish];
  }
  if (newWish.image) {
    const imageFilePath = await saveImage(newWish.image, newWish.id);
    newWish.image = imageFilePath;
  } else {
    newWish.image = `${DATA_FOLDER_IMAGES}empty.jpg`;
  }
  await saveUsersFile(users);
  return newWish;
};

/**
 * Обрабатывает запрос на добавление нового желания
 * @param {Object} req - объект запроса
 * @param {Object} res - объект ответа
 */
export const handleAddWishRequest = (req, res) => {
  let body = '';
  req.on('data', chunk => {
    body += chunk.toString();
  });
  req.on('end', async () => {
    const { category, ...wish } = JSON.parse(body);
    const token = req.headers.authorization?.split(' ')[1];
    try {
      const { id } = verifyToken(token);
      const users = await readUsersFile();
      const userIndex = users.findIndex(user => user.id === id);
      if (userIndex < 0) {
        throw new Error('User not found');
      }
      const newWish = await addWishToUser(users, userIndex, category, wish);
      sendResponse(res, 201, { category, ...newWish });
    } catch (err) {
      sendResponse(res, 401, { message: err.message });
    }
  });
};
