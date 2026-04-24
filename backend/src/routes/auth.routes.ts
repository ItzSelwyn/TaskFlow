import { Router } from 'express';
import passport from 'passport';
import * as authController from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/refresh', authController.refresh);
router.post('/logout', authController.logout);
router.post('/switch-org', authenticate, authController.switchOrg);
router.get('/me', authenticate, authController.me);

// Google OAuth
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'], session: false }));
router.get('/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: '/login' }),
  authController.oauthCallback('google')
);

// GitHub OAuth
router.get('/github', passport.authenticate('github', { scope: ['user:email'], session: false }));
router.get('/github/callback',
  passport.authenticate('github', { session: false, failureRedirect: '/login' }),
  authController.oauthCallback('github')
);

export default router;
