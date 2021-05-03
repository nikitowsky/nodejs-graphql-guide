import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  BaseEntity,
  ManyToOne,
} from 'typeorm';
import { IsNotEmpty } from 'class-validator';

import { User } from './User.entity';

@Entity()
export class Article extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @IsNotEmpty()
  title: string;

  @Column({ unique: true })
  slug: string;

  @Column('text', { nullable: true })
  content: string;

  @ManyToOne((_type) => User, (user) => user.articles)
  @IsNotEmpty()
  author: User;
}
