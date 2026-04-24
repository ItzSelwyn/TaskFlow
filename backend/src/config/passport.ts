import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as GitHubStrategy } from 'passport-github2';
import { config } from './env';
import { handleOAuthUser } from '../services/auth.service';
import { logger } from '../utils/logger';

export const configurePassport = () => {
  if (config.GOOGLE_CLIENT_ID && config.GOOGLE_CLIENT_SECRET) {
    passport.use(
      new GoogleStrategy(
        {
          clientID: config.GOOGLE_CLIENT_ID,
          clientSecret: config.GOOGLE_CLIENT_SECRET,
          callbackURL: `/api/auth/google/callback`,
        },
        async (_accessToken, _refreshToken, profile, done) => {
          try {
            const email = profile.emails?.[0]?.value;
            if (!email) return done(new Error('No email from Google'));

            const tokens = await handleOAuthUser({
              id: profile.id,
              email,
              name: profile.displayName,
              avatarUrl: profile.photos?.[0]?.value,
              provider: 'google',
            });
            done(null, tokens);
          } catch (err) {
            done(err as Error);
          }
        }
      )
    );
  }

  if (config.GITHUB_CLIENT_ID && config.GITHUB_CLIENT_SECRET) {
    passport.use(
      new GitHubStrategy(
        {
          clientID: config.GITHUB_CLIENT_ID,
          clientSecret: config.GITHUB_CLIENT_SECRET,
          callbackURL: `/api/auth/github/callback`,
          scope: ['user:email'],
        },
        async (_accessToken: string, _refreshToken: string, profile: any, done: any) => {
          try {
            const email = profile.emails?.[0]?.value;
            if (!email) return done(new Error('No email from GitHub'));

            const tokens = await handleOAuthUser({
              id: profile.id,
              email,
              name: profile.displayName || profile.username,
              avatarUrl: profile.photos?.[0]?.value,
              provider: 'github',
            });
            done(null, tokens);
          } catch (err) {
            done(err as Error);
          }
        }
      )
    );
  }

  logger.info('Passport configured');
};
