import { UserInputError } from 'apollo-server';
import { validate } from 'class-validator';

import { User } from '../../entities';
import { formatClassValidatorErrors } from '../../utils';

export interface UserCreateArguments {
  input: {
    email: string;
    password: string;
    username: string;
  };
}

export const userCreate = async (root: any, args: UserCreateArguments) => {
  const user = User.create({
    email: args.input.email,
    password: args.input.password,
    username: args.input.username,
  });

  // Input validation
  const errors = await validate(user);

  if (errors.length > 0) {
    throw new UserInputError('Validation failed!', {
      fields: formatClassValidatorErrors(errors),
    });
  }

  const [searchByEmail, searchByUsername] = await Promise.all([
    User.find({ email: args.input.username }),
    User.find({ username: args.input.username }),
  ]);

  if (searchByEmail.length > 0) {
    throw new UserInputError('Validation failed!', {
      fields: {
        email: ['User with such E-Mail already exists'],
      },
    });
  }

  if (searchByUsername.length > 0) {
    throw new UserInputError('Validation failed!', {
      fields: {
        username: ['User with such username already exists'],
      },
    });
  }

  return await user.save();
};
