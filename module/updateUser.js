import fs from 'fs';
import {
  isBase64,
  readUsersFile,
  saveUsersFile,
  verifyToken,
} from './fileUtils.js';
import { DATA_FOLDER_AVATAR } from './checkFilesAndFoldersAvailability.js';
import sharp from 'sharp';
import { sendResponse } from './serviceResponse.js';
import { log } from 'console';

/**
 * Асинхронно обновляет данные пользователя
 *
 * @async
 * @function
 *
 * @param {Object} user - объект пользователя
 * @param {string} id - идентификатор пользователя
 * @param {string} [login] - логин пользователя
 * @param {string} [password] - пароль пользователя
 * @param {string} [birthdate] - дата рождения пользователя
 * @param {string} [avatar] - аватар пользователя в формате base64
 *
 * @throws {Error} если переданное изображение в формате base64 некорректно
 * @throws {Error} если произошла ошибка при записи изображения в файл
 */
const updateUser = async (
  user,
  { birthdate, avatar, name, surname, description },
) => {
  if (birthdate) {
    user.birthdate = birthdate;
  }

  if (name) {
    user.name = name;
  }

  if (surname) {
    user.surname = surname;
  }

  if (description) {
    user.description = description;
  }

  if (avatar && isBase64(avatar)) {
    const matches = avatar.match(/^data:image\/([A-Za-z-+/]+);base64,(.+)$/);
    console.log('ava');
    if (!matches || matches.length !== 3) {
      console.log('Invalid image data URL');
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
    const imageFilePath = `${DATA_FOLDER_AVATAR}${user.id}.jpg`;

    try {
      await fs.promises.writeFile(`./${imageFilePath}`, processedImageBuffer);
      user.avatar = imageFilePath;
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    } catch (error) {
      console.log(error);
      throw new Error(`Error writing image file: ${error.message}`);
    }
  }

  if (avatar && avatar.includes('empty')) {
    user.avatar = `${DATA_FOLDER_AVATAR}empty.png`;
  }
};

/**
 * Обрабатывает запрос на обновление данных пользователя
 *
 * @async
 * @function
 *
 * @param {Object} req - объект запроса
 * @param {Object} res - объект ответа
 */
export const handleUpdateUserRequest = async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];

  const { id: userId } = verifyToken(token);
  const users = await readUsersFile();
  const userIndex = users.findIndex(user => user.id === userId);
  if (userIndex === -1) {
    sendResponse(res, 404, { message: 'User not found' });
  } else {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', async () => {
      const data = JSON.parse(body);
      const user = users[userIndex];
      try {
        await updateUser(user, data);
        await saveUsersFile(users);
        sendResponse(res, 200, {
          login: user.login,
          birthdate: user.birthdate,
          avatar: user.avatar,
        });
      } catch (err) {
        sendResponse(res, 400, { message: err.message });
      }
    });
  }
};
