import fs from 'fs';
import { readUsersFile, saveUsersFile, verifyToken } from './fileUtils.js';
import { DATA_FOLDER_AVATAR } from './checkFilesAndFoldersAvailability.js';
import sharp from 'sharp';
const updateUser = async (user, id, login, password, birthdate, avatar) => {
  if (login) {
    user.login = login;
  }
  if (password) {
    user.password = password;
  }
  if (birthdate) {
    user.birthdate = birthdate;
  }
  if (avatar) {
    const matches = avatar.match(/^data:image\/([A-Za-z-+/]+);base64,(.+)$/);
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

    const imageFilePath = `${DATA_FOLDER_AVATAR}${id}.jpg`;

    try {
      await fs.promises.writeFile(imageFilePath, processedImageBuffer);
      user.avatar = imageFilePath;
    } catch (error) {
      throw new Error(`Error writing image file: ${error.message}`);
    }
  }
};

export const handleUpdateUserRequest = async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];

  const { id: userId } = verifyToken(token);
  const users = await readUsersFile();
  const userIndex = users.findIndex(user => user.id === userId);
  if (userIndex === -1) {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ message: 'User not found' }));
  } else {
    const id = req.params.id;
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', async () => {
      const { login, password, birthdate, avatar } = JSON.parse(body);
      const user = users[userIndex];
      try {
        await updateUser(user, id, login, password, birthdate, avatar);
        await saveUsersFile(users);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(
          JSON.stringify({
            login: user.login,
            birthdate: user.birthdate,
            avatar: user.avatar,
          }),
        );
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: err.message }));
      }
    });
  }
};
