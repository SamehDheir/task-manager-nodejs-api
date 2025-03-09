const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("../models/user.model");
const bcrypt = require("bcryptjs");
require("dotenv").config(); // Load environment variables

// Configure Google OAuth Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL, // Use environment variable
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Ensure the user has an email from Google
        if (!profile.emails || !profile.emails.length) {
          return done(
            new Error("No email associated with this Google account"),
            null
          );
        }

        const email = profile.emails[0].value;

        // Check if user already exists in the database
        let user = await User.findOne({ email });

        if (!user) {
          // If user doesn't exist, create a new one
          const hashedPassword = await bcrypt.hash(profile.id, 10); // Use Google ID as a base for hashing

          user = new User({
            username: profile.displayName,
            email,
            password: hashedPassword, // Encrypted password
            googleId: profile.id, // Store Google ID
            avatar: profile.photos?.[0]?.value, // Save profile picture if available
          });

          await user.save();
        }

        return done(null, user);
      } catch (err) {
        return done(err, null);
      }
    }
  )
);

// Serialize user (store user ID in session)
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Deserialize user (retrieve user from ID)
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

module.exports = passport;
