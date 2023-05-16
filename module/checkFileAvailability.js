import fs from 'node:fs/promises';
export const DATA_FILE_PATH = './users.json';

const checkFileAvailability = async filePath => {
  try {
    await fs.access(
      filePath,
      fs.constants.F_OK | fs.constants.R_OK | fs.constants.W_OK,
    );
    console.log('Файл доступен для чтения и записи');
  } catch (error) {
    if (error.code === 'ENOENT') {
      console.log('Файл не существует. Создание нового файла...');
      await fs.writeFile(filePath, '[]');
      console.log('Файл создан успешно.');
    } else {
      console.log('Файл недоступен для чтения и записи.');
    }
  }
};

checkFileAvailability(DATA_FILE_PATH);
