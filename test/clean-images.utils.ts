import * as fsExtra from 'fs-extra';

export const cleanImages = () => {
  fsExtra.emptyDirSync('./files');
};
