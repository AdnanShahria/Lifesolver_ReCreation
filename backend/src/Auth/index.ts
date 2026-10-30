import { Hono } from 'hono';
import { registerRoute } from './Register';
import { loginRoute } from './Login';
import { verifyOtpRoute } from './VerifyOtp';
import { resendOtpRoute } from './ResendOtp';
import { forgotPasswordRoute } from './ForgotPassword';
import { resetPasswordRoute } from './ResetPassword';
import { meRoute } from './Me';
import { profileRoute } from './Profile';
import type { Env, AppVariables } from '../types';

export const authRouter = new Hono<{ Bindings: Env; Variables: AppVariables }>();

authRouter.route('/', registerRoute);
authRouter.route('/', loginRoute);
authRouter.route('/', verifyOtpRoute);
authRouter.route('/', resendOtpRoute);
authRouter.route('/', forgotPasswordRoute);
authRouter.route('/', resetPasswordRoute);
authRouter.route('/', meRoute);
authRouter.route('/', profileRoute);

export * from './crypto';
