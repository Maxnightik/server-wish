import fs from 'node:fs/promises';

export const DATA_FILE_USERS = './users.json';
export const DATA_FILES_PATH = [DATA_FILE_USERS];

export const DATA_FOLDER_IMAGES = 'images/';
export const DATA_FOLDER_AVATAR = 'avatars/';
export const DATA_FOLDERS_PATH = [DATA_FOLDER_IMAGES, DATA_FOLDER_AVATAR];

// /**
//  * Проверяет доступность указанного файла и создает его, если его нет
//  * @param {string} filePath - путь к файлу
//  */
// const checkFileAvailability = async filePath => {
//   try {
//     await fs.access(
//       filePath,
//       fs.constants.F_OK | fs.constants.R_OK | fs.constants.W_OK,
//     );
//     console.log(`Файл ${filePath} доступен для чтения и записи`);
//   } catch (error) {
//     if (error.code === 'ENOENT') {
//       console.log(`Файл ${filePath} не существует. Создание нового файла...`);
//       await fs.writeFile(filePath, '[]');
//       console.log(`Файл ${filePath} создан успешно.`);
//     } else {
//       console.log(`Файл ${filePath} недоступен для чтения и записи.`);
//     }
//   }
// };

// /**
//  * Проверяет доступность указанной папки и создает ее, если ее нет
//  * @param {string} folder - путь к папке
//  */
// const checkFolderAvailability = async folder => {
//   try {
//     await fs.access(folder, fs.constants.F_OK | fs.constants.W_OK);
//     console.log(`Папка ${folder} существует`);
//   } catch (error) {
//     console.log(
//       // eslint-disable-next-line
//       `Папка ${folder} не существует или не доступна для записи. Создание новой папки...`,
//     );
//     try {
//       await fs.mkdir(folder);
//       console.log(`Папка ${folder} создана успешно`);
//     } catch (error) {
//       console.log(`Не удалось создать папку ${folder}: ${error}`);
//     }
//   }
// };

// /**
//  * Проверяет доступность всех файлов и папок, необходимых для работы приложения,
//  * и создает их, если они не существуют
//  */
// DATA_FILES_PATH.forEach(checkFileAvailability);
// DATA_FOLDERS_PATH.forEach(checkFolderAvailability);
