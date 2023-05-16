import fs from 'node:fs/promises';
import { v4 as uuidv4 } from 'uuid';
import { readUsersFile, saveUsersFile, verifyToken } from './fileUtils.js';
import { DATA_FOLDER_IMAGES } from './checkFilesAndFoldersAvailability.js';

const saveImage = async image => {
  const matches = image.match(/^data:image\/([A-Za-z-+/]+);base64,(.+)$/);
  if (!matches || matches.length !== 3) {
    throw new Error('Invalid image data URL');
  }
  const extension = matches[1].replace('jpeg', 'jpg');
  const base64Data = matches[2];
  const imageFilePath = `${DATA_FOLDER_IMAGES}${uuidv4()}.${extension}`;
  await fs.writeFile(imageFilePath, base64Data, 'base64');
  return imageFilePath;
};

const addWishToUser = async (users, userIndex, category, wish) => {
  const newWish = { id: uuidv4(), ...wish };
  const user = users[userIndex];
  if (user.wish[category]) {
    user.wish[category].push(newWish);
  } else {
    user.wish[category] = [newWish];
  }
  if (newWish.image) {
    const imageFilePath = await saveImage(newWish.image);
    newWish.image = imageFilePath;
  } else {
    newWish.image = `${DATA_FOLDER_IMAGES}empty-wish.jpg`;
  }
  await saveUsersFile(users);
  return newWish;
};

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
      res.writeHead(201, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ category, ...newWish }));
    } catch (err) {
      res.writeHead(401, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ message: err.message }));
    }
  });
};