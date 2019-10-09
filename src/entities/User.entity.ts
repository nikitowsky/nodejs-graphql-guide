import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  BaseEntity,
  OneToMany,
} from 'typeorm';
import { IsEmail, IsNotEmpty } from 'class-validator';
import { Article } from './Article.entity';

@Entity()
export class User extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  @IsEmail({}, { message: 'Invalid E-Mail' })
  email: string;

  @Column()
  @IsNotEmpty()
  password: string;

  @Column({ unique: true })
  @IsNotEmpty()
  username: string;

  @Column('text', { nullable: true })
  bio: string;

  @Column({ nullable: true })
  image: string;

  @OneToMany((type) => Article, (article) => article.author, {
    nullable: false,
  })
  articles: Article[];
}
