import { v4 as uuidv4 } from 'uuid';
import { isValidLogin, isValidPassword } from './authValidation.js';
import { readUsersFile, saveUsersFile } from './fileUtils.js';

export const handleRegisterRequest = async (req, res) => {
  let body = '';
  req.on('data', chunk => {
    body += chunk.toString();
  });
  req.on('end', async () => {
    const { login, password } = JSON.parse(body);

    if (!isValidLogin(login)) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ message: 'Invalid login format' }));
      return;
    }
    if (!isValidPassword(password)) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ message: 'Invalid password format' }));
      return;
    }

    const users = await readUsersFile();
    if (users.find(user => user.login.toLowerCase() === login.toLowerCase())) {
      res.writeHead(409, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ message: 'User already exists' }));
    } else {
      const newUser = {
        id: uuidv4(),
        login,
        password,
        wish: {},
      };
      users.push(newUser);
      await saveUsersFile(users);
      res.writeHead(201, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ message: 'User created successfully' }));
    }
  });
};
