import { v4 as uuidv4 } from 'uuid';
import { isValidLogin, isValidPassword } from './authValidation.js';
import { readUsersFile, saveUsersFile } from './fileUtils.js';
import { DATA_FOLDER_AVATAR } from './checkFilesAndFoldersAvailability.js';

export const handleRegisterRequest = async (req, res) => {
  let body = '';
  req.on('data', chunk => {
    body += chunk.toString();
  });
  req.on('end', async () => {
    const { login, password } = JSON.parse(body);

    if (!isValidLogin(login)) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(
        JSON.stringify({
          message: 'Логин должен состоять только из латинских букв',
        }),
      );
      return;
    }
    if (!isValidPassword(password)) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(
        JSON.stringify({
          message:
            // eslint-disable-next-line
            'Пароль должен содержать как минимум одну строчную букву, одну заглавную букву, одну цифру, один специальный символ и иметь длину не менее 8 символов',
        }),
      );
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
        avatar: `${DATA_FOLDER_AVATAR}empty.jpg`,
        birthdate: '',
      };
      users.push(newUser);
      await saveUsersFile(users);
      res.writeHead(201, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ message: 'User created successfully' }));
    }
  });
};
