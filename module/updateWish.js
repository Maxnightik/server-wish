import fs from 'node:fs/promises';
import { readUsersFile, saveUsersFile, verifyToken } from './fileUtils.js';
import { DATA_FOLDER_IMAGES } from './checkFilesAndFoldersAvailability.js';
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
    const extension = matches[1].replace('jpeg', 'jpg');
    const base64Data = matches[2];
    await fs.writeFile(
      `${DATA_FOLDER_IMAGES}${id}.${extension}`,
      base64Data,
      'base64',
    );
    wishToUpdate.image = `${DATA_FOLDER_IMAGES}${id}.${extension}`;
  }
};

export const handleUpdateWishRequest = async (req, res) => {
  const id = req.url.split('/')[2];
  const token = req.headers.authorization?.split(' ')[1];
  try {
    const { id: userId } = verifyToken(token);
    const users = await readUsersFile();
    const user = users.find(user => user.id === userId);
    if (!user) {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ message: 'User not found' }));
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
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(
            JSON.stringify(user.wish[category].find(item => item.id === id)),
          );
        } catch (err) {
          res.writeHead(404, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ message: err.message }));
        }
      });
    }
  } catch (err) {
    res.writeHead(401, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ message: err.message }));
  }
};
