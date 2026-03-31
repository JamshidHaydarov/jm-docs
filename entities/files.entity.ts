import { Column, CreateDateColumn, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { FilesAccess } from './filesaccess.entity';
import { Users } from './users.entity';
import { IsString } from 'class-validator';

@Entity()
export class Files {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @IsString()
  filename:string

  @ManyToOne(() => Users, user => user.ownedFiles)
  owner: Users;

  @Column({type: 'text', nullable: true})
  context: string | null

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  update_at: Date;

  @OneToMany(() => FilesAccess, fileAccess => fileAccess.file)
  access: FilesAccess[];
}