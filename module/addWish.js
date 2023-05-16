import fs from 'node:fs/promises';
import { v4 as uuidv4 } from 'uuid';
import { readUsersFile, saveUsersFile, verifyToken } from './fileUtils.js';



export async function handleAddWishRequest(req, res) {
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
      const newWish = { id: uuidv4(), ...wish };
      if (users[userIndex].wish[category]) {
        users[userIndex].wish[category].push(newWish);
      } else {
        users[userIndex].wish[category] = [newWish];
      }
      if (newWish.image) {
        const matches = newWish.image.match(
          /^data:image\/([A-Za-z-+/]+);base64,(.+)$/,
        );
        if (!matches || matches.length !== 3) {
          throw new Error('Invalid image data URL');
        }
        const extension = matches[1].replace('jpeg', 'jpg');
        const base64Data = matches[2];
        await fs.writeFile(
          `./image/${newWish.id}.${extension}`,
          base64Data,
          'base64',
        );
        newWish.image = `/image/${newWish.id}.${extension}`;
      }
      await saveUsersFile(users);
      res.writeHead(201, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({category, ...newWish}));
    } catch (err) {
      res.writeHead(401, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ message: err.message }));
    }
  });
}
