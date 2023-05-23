import fs from 'node:fs/promises';
import { readUsersFile, saveUsersFile, verifyToken } from './fileUtils.js';
import { DATA_FOLDER_IMAGES } from './checkFilesAndFoldersAvailability.js';
import sharp from 'sharp';
import { sendResponse } from './serviceResponse.js';

/**
 * Функция обновления желания пользователя
 * @async
 * @function
 *
 * @param {Object} user - объект пользователя
 * @param {string} category - категория желания
 * @param {string} id - идентификатор желания
 * @param {string} title - заголовок желания
 * @param {string} link - ссылка на желание
 * @param {number} price - цена желания
 * @param {string} image - изображение желания в формате base64
 *
 * @returns {Promise<string>} возвращает путь к файлу изображения желания
 *
 * @throws {Error} в случае, если желание не найдено
 * или URL изображения некорректный
 */
const updateWish = async (user, category, id, title, link, price, image) => {
  const wishToUpdate = user.wish[category].find(item => item.id === id);
  if (!wishToUpdate) {
    throw new Error('Wish not found');
  }
  if (title) {
    wishToUpdate.title = title;
  }
  if (link) {
    wishToUpdate.link = link;
  }
  if (price) {
    wishToUpdate.price = price;
  }
  if (image) {
    const matches = image.match(/^data:image\/([A-Za-z-+/]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      throw new Error('Invalid image data URL');
    }

    const base64Data = matches[2];

    const MAX_IMAGE_SIZE = 500;

    const processedImageBuffer = await sharp(Buffer.from(base64Data, 'base64'))
      .resize({
        width: MAX_IMAGE_SIZE,
        height: MAX_IMAGE_SIZE,
        fit: 'contain',
        background: { r: 255, g: 255, b: 255, alpha: 1 },
      })
      .flatten({ background: { r: 255, g: 255, b: 255, alpha: 1 } })
      .jpeg({ quality: 80 })
      .toBuffer();

    const imageFilePath = `${DATA_FOLDER_IMAGES}${id}.jpg`;
    await fs.writeFile(`./${imageFilePath}`, processedImageBuffer);
    return imageFilePath;
  }
};

/**
 * Функция обработки запроса на обновление желания
 * @async
 * @function
 *
 * @param {Object} req - объект запроса
 * @param {Object} res - объект ответа
 */
export const handleUpdateWishRequest = async (req, res) => {
  const id = req.url.split('/')[2];
  const token = req.headers.authorization?.split(' ')[1];
  try {
    const { id: userId } = verifyToken(token);
    const users = await readUsersFile();
    const user = users.find(user => user.id === userId);
    if (!user) {
      sendResponse(res, 404, { message: 'User not found' });
    } else {
      let body = '';
      req.on('data', chunk => {
        body += chunk.toString();
      });
      req.on('end', async () => {
        const { category, title, link, price, image } = JSON.parse(body);
        try {
          await updateWish(user, category, id, title, link, price, image);
          await saveUsersFile(users);
          const wish = user.wish[category].find(item => item.id === id);
          sendResponse(res, 200, wish);
        } catch (err) {
          sendResponse(res, 404, { message: err.message });
        }
      });
    }
  } catch (err) {
    sendResponse(res, 401, { message: err.message });
  }
};
