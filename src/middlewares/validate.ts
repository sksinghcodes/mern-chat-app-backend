import user from '../models/user';
import { Request, Response, NextFunction } from 'express';
import validationFunctions from '../utils/validationFunctions';

interface Validations {
  function: keyof typeof validationFunctions;
  args?: string[] | number[];
}

type KeysToValidateSignUp =
  | 'firstName'
  | 'lastName'
  | 'username'
  | 'email'
  | 'password'
  | 'confirmPassword';
type KeysToValidateSignIn = 'usernameOrEmail' | 'password';

type SignUpValidationRules = Record<KeysToValidateSignUp, Validations[]>;
type SignInValidationRules = Record<KeysToValidateSignIn, Validations[]>;

export const validateSignUp = async (req: Request, res: Response, next: NextFunction) => {
  const signUpData = req.body;

  const validationRules: SignUpValidationRules = {
    firstName: [
      { function: 'isRequired' },
      { function: 'checkLength', args: [1, 20] },
      { function: 'isUsername' },
    ],
    lastName: [{ function: 'checkLength', args: [2, 20] }],
    username: [
      { function: 'isRequired' },
      { function: 'noSpaces' },
      { function: 'checkLength', args: [2, 30] },
      { function: 'isUsername' },
    ],
    email: [{ function: 'isRequired' }, { function: 'noSpaces' }, { function: 'isEmail' }],
    password: [
      { function: 'isRequired' },
      { function: 'noSpaces' },
      { function: 'checkLength', args: [6, 30] },
      { function: 'isPassword' },
    ],
    confirmPassword: [
      { function: 'isRequired' },
      { function: 'isSameAsPassword', args: [signUpData.password] },
    ],
  };

  const signUpValidation = {
    firstName: {
      errorMessage: '',
      isValid: false,
    },
    lastName: {
      errorMessage: '',
      isValid: false,
    },
    username: {
      errorMessage: '',
      isValid: false,
      isUnique: false,
    },
    email: {
      errorMessage: '',
      isValid: false,
      isUnique: false,
    },
    password: {
      errorMessage: '',
      isValid: false,
    },
    confirmPassword: {
      errorMessage: '',
      isValid: false,
    },
  };

  for (const [key, validations] of Object.entries(validationRules)) {
    for (const [index, validation] of Object.entries(validations)) {
      const message = validationFunctions[validation.function](
        signUpData[key] || '',
        validation.args || [],
      );

      if (message) {
        signUpValidation[key as keyof typeof signUpValidation].errorMessage = message;
        signUpValidation[key as keyof typeof signUpValidation].isValid = false;
        break;
      } else {
        if (+index === validations.length - 1) {
          signUpValidation[key as keyof typeof signUpValidation].isValid = true;
        }
        signUpValidation[key as keyof typeof signUpValidation].errorMessage = message;
      }
    }
  }

  const userByUsername = await user.findOne({ username: signUpData.username });
  const userByEmail = await user.findOne({ email: signUpData.email });

  if (!userByUsername) {
    signUpValidation.username.isUnique = true;
  }

  if (!userByEmail) {
    signUpValidation.email.isUnique = true;
  }

  if (
    signUpValidation.username.isValid &&
    signUpValidation.username.isUnique &&
    signUpValidation.email.isValid &&
    signUpValidation.email.isUnique &&
    signUpValidation.password.isValid &&
    signUpValidation.confirmPassword.isValid
  ) {
    next();
  } else {
    res.status(400).json({
      success: false,
      validation: signUpValidation,
      values: signUpData,
    });
  }
};

export const validateSignIn = (req: Request, res: Response, next: NextFunction) => {
  const signInData = req.body;

  const validationRules: SignInValidationRules = {
    usernameOrEmail: [{ function: 'isRequired' }],
    password: [{ function: 'isRequired' }],
  };

  const signInValidation = {
    usernameOrEmail: {
      errorMessage: '',
      isValid: false,
    },
    password: {
      errorMessage: '',
      isValid: false,
    },
  };

  for (const [key, validations] of Object.entries(validationRules)) {
    for (const [index, validation] of Object.entries(validations)) {
      const message = validationFunctions[validation.function](
        signInData[key],
        validation.args || [],
      );

      if (message) {
        signInValidation[key as keyof typeof signInValidation].errorMessage = message;
        signInValidation[key as keyof typeof signInValidation].isValid = false;
        break;
      } else {
        if (+index === validations.length - 1) {
          signInValidation[key as keyof typeof signInValidation].isValid = true;
        }
        signInValidation[key as keyof typeof signInValidation].errorMessage = message;
      }
    }
  }

  if (signInValidation.usernameOrEmail.isValid && signInValidation.password.isValid) {
    next();
  } else {
    res.status(400).json({
      success: false,
      validation: signInValidation,
      values: signInData,
    });
  }
};
