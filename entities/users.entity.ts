import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { FilesAccess } from './filesaccess.entity';
import { Files } from './files.entity';

@Entity()
export class Users {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  username: string;

  @Column()
  password: string;

  @OneToMany(() => FilesAccess, filesAccess => filesAccess.user)
  access: FilesAccess[];

  @OneToMany(() => Files, file => file.owner)
  ownedFiles: File[];
}