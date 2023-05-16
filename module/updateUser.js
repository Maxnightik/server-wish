import fs from 'fs';
import { readUsersFile, saveUsersFile, verifyToken } from './fileUtils.js';
import { DATA_FOLDER_AVATAR } from './checkFilesAndFoldersAvailability.js';
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
    const extension = matches[1].replace('jpeg', 'jpg');
    const base64Data = matches[2];
    await fs.writeFile(
      `${DATA_FOLDER_AVATAR}${id}.${extension}`,
      base64Data,
      'base64',
    );
    user.avatar = `${DATA_FOLDER_AVATAR}${id}.${extension}`;
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
