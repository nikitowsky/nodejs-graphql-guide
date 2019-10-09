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

  const errors = await validate(user);

  if (errors.length > 0) {
    throw new UserInputError('Validation failed!', {
      fields: formatClassValidatorErrors(errors),
    });
  }

  return await user.save();
};
