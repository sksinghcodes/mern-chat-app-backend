import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { JWT_SECRET_KEY } from '../constants';
import User from '../models/user';
import ConfirmationCode from '../models/confirmationCode';
import nextTenMinutes from '../utils/nextTenMinutes';
import sendMail from '../utils/sendEmail';
import { CODE_PURPOSE, ENV_TYPE_IS_PROD } from '../constants';
import authenticatePassword from '../utils/authenticatePassword';

interface UserIdRequest extends Request {
  userId: string;
}

const setTokenOnResponse = (res: Response, userId: string) => {
  const token = jwt.sign({ userId: userId }, JWT_SECRET_KEY);

  res.cookie('jwt-token', token, {
    httpOnly: true, // accessible only by web server
    secure: ENV_TYPE_IS_PROD === '1', // https
    sameSite: 'none', // cross site cookie
  });
};

export const signUp = async (req: Request, res: Response) => {
  try {
    const { firstName, lastName, username, email, password } = req.body;

    const hashedPassword = await bcrypt.hash(password, 12);

    const newUser = new User({ firstName, lastName, username, email, password: hashedPassword });
    const confirmationCode = new ConfirmationCode({
      userId: newUser._id,
      purpose: CODE_PURPOSE.PROFILE_VERIFICATION,
      expirationDate: nextTenMinutes(),
    });
    const text = `Your profile verification code is ${confirmationCode.code}. It is only valid for the next 10 minutes`;
    const html = `<p>${text}</p>`;

    await newUser.save();
    await confirmationCode.save();
    await sendMail({
      receivers: [newUser.email],
      subject: 'Profile verification code',
      text: text,
      html: html,
    });

    res.status(200).json({
      success: true,
      confirmationCodeId: confirmationCode._id,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
};

export const signIn = async (req: Request, res: Response) => {
  try {
    const { usernameOrEmail, password } = req.body;
    const user = await User.findOne({
      $or: [{ username: usernameOrEmail }, { email: usernameOrEmail }],
    });

    if (user) {
      const passwordMatched = await authenticatePassword(password, user.password);

      if (passwordMatched) {
        if (user.isVerified) {
          setTokenOnResponse(res, String(user._id));

          res.status(200).json({
            success: true,
            message: 'Login Successful',
          });
        } else {
          const confirmationCode = new ConfirmationCode({
            userId: user._id,
            purpose: CODE_PURPOSE.PROFILE_VERIFICATION,
            expirationDate: nextTenMinutes(),
          });
          const text = `Your profile verification code is ${confirmationCode.code}. It is only valid for the next 10 minutes`;
          const html = `<p>${text}</p>`;

          await confirmationCode.save();
          await sendMail({
            receivers: [user.email],
            subject: 'Profile verification code',
            text: text,
            html: html,
          });

          res.status(200).json({
            success: true,
            confirmationCodeId: confirmationCode._id,
          });
        }
      } else {
        res.status(401).json({
          success: false,
          error: 'Invalid credentials',
        });
      }
    } else {
      res.status(401).json({
        success: false,
        error: 'Invalid credentials',
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
};

export const getPasswordResetId = async (req: Request, res: Response) => {
  try {
    const email = String(req.query.email);
    if (!email.trim()) {
      res.status(400).json({
        success: false,
        error: 'Please enter a valid email',
      });
      return;
    }

    const user = await User.findOne({ email: email });

    if (user) {
      const confirmationCode = new ConfirmationCode({
        userId: user._id,
        purpose: CODE_PURPOSE.PASSWORD_RESET,
        expirationDate: nextTenMinutes(),
      });
      const text = `Your password reset code is ${confirmationCode.code}. It is only valid for the next 10 minutes`;
      const html = `<p>${text}</p>`;

      await confirmationCode.save();
      await sendMail({
        receivers: [user.email],
        subject: 'Code for resetting password',
        text: text,
        html: html,
      });

      res.status(200).json({
        success: true,
        passwordResetId: confirmationCode._id,
      });
    } else {
      res.status(404).json({
        success: false,
        error: 'This email address is not used in any profile',
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { passwordResetId, code, newPassword } = req.body;

    const confirmationCode = await ConfirmationCode.findById(passwordResetId);

    if (
      confirmationCode &&
      confirmationCode.purpose === CODE_PURPOSE.PASSWORD_RESET &&
      confirmationCode.code === String(code)
    ) {
      if (new Date(confirmationCode.expirationDate) > new Date(Date.now())) {
        const hashedPassword = await bcrypt.hash(newPassword, 12);

        await User.findOneAndUpdate(
          { _id: confirmationCode.userId },
          {
            isVerified: true,
            password: hashedPassword,
          },
        );

        await ConfirmationCode.findByIdAndDelete(passwordResetId);

        res.status(200).json({
          success: true,
          message: 'Password reset was successful',
        });
      } else {
        res.status(498).json({
          success: false,
          error: 'Password reset code has been expired',
        });
      }
    } else {
      res.status(401).json({
        success: false,
        error: 'Password reset code is incorrect',
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
};

export const verifyProfile = async (req: Request, res: Response) => {
  try {
    const confirmationCode = await ConfirmationCode.findById(req.body.verificationId);
    if (
      confirmationCode &&
      confirmationCode.purpose === CODE_PURPOSE.PROFILE_VERIFICATION &&
      confirmationCode.code === String(req.body.code)
    ) {
      if (new Date(confirmationCode.expirationDate) > new Date(Date.now())) {
        await User.findOneAndUpdate({ _id: confirmationCode.userId }, { isVerified: true });
        await ConfirmationCode.findByIdAndDelete(confirmationCode._id);

        res.status(200).json({
          success: true,
          message: 'Profile verification was successful',
        });
      } else {
        res.status(498).json({
          success: false,
          error: 'Profile verification code has been expired',
        });
      }
    } else {
      res.status(401).json({
        success: false,
        error: 'Profile verification code is incorrect',
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
};

export const checkUnique = async (req: Request, res: Response) => {
  try {
    if (
      Object.keys(req.query).length === 1 &&
      (Object.prototype.hasOwnProperty.call(req.query, 'email') ||
        Object.prototype.hasOwnProperty.call(req.query, 'username'))
    ) {
      const user = await User.findOne(req.query);
      if (user) {
        res.status(200).json({
          success: true,
          isUnique: false,
        });
      } else {
        res.status(200).json({
          success: true,
          isUnique: true,
        });
      }
    } else {
      res.status(400).json({
        success: false,
        error: 'Please send only one field, with either "email" or "username"',
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
};

export const checkLoggedInStatus = async (req: Request, res: Response) => {
  try {
    const user = await User.findOne(
      { _id: (req as UserIdRequest).userId },
      {
        first_name: 1,
        last_name: 1,
        username: 1,
        email: 1,
      },
    );
    res.status(200).json({
      success: true,
      user: user,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
};

export const signOut = async (req: Request, res: Response) => {
  try {
    res
      .cookie('jwt-token', '', {
        expires: new Date(0),
        httpOnly: true,
        sameSite: 'none',
        secure: ENV_TYPE_IS_PROD === '1',
      })
      .status(200)
      .json({
        success: true,
        message: 'User sign out was successful',
      });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
};
