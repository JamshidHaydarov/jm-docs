import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Users } from './users.entity';
import { Files } from './files.entity';

@Entity()
export class FilesAccess {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Users, user => user.access)
  user: Users;

  @ManyToOne(() => Files, file => file.access)
  file: Files;
}