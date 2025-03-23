import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User from '../models/user.model.js';
import dotenv from 'dotenv';
dotenv.config();

passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: process.env.GOOGLE_CLIENT_URI_CALLBACK,
        },
        async (accessToken, refreshToken, profile, done) => {
            try {
                let user = await User.findOne({ google_id: profile.id });

                if (user) {
                    return done(null, user);
                } else {
                    user = new User({
                        google_id: profile.id,
                        name: profile.displayName,
                        email: profile.emails[0].value,
                        phone: '',
                        password: '',
                        profile_image: profile.photos[0].value,
                        role: 'passenger',
                        verified: [true, false],
                    });

                    await user.save();
                    return done(null, user);
                }
            } catch (error) {
                console.log('Error in passport config: ', error);
                return done(error, null);
            }
        }
    )
);
passport.serializeUser(function (user, done) {
    done(null, user);
});

passport.deserializeUser(function (user, done) {
    done(null, user);
});
export default passport;
