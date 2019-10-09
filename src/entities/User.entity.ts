import { Entity, PrimaryGeneratedColumn, Column, BaseEntity } from 'typeorm';
import { IsEmail, IsNotEmpty } from 'class-validator';

@Entity()
export class User extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  @IsEmail({}, { message: 'Invalid E-mail' })
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
}
