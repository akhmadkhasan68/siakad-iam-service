import { StorageDriverEnum } from 'src/shared/enums/storage-driver.enum';

export interface IStorageFile {
    name: string;
    path: string;
    size: number;
    mimetype: string;
    driver: StorageDriverEnum;
}
