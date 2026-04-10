const passport = require("passport");
const { Strategy: JwtStrategy, ExtractJwt } = require("passport-jwt");
const db = require("../config/database");  
require("dotenv").config();

const opts = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.SECRET_KEY,
};

passport.use(
  new JwtStrategy(opts, async (jwt_payload, done) => {  
    try {
      const query = "SELECT * FROM users WHERE id = ?";
      const [rows] = await db.query(query, [jwt_payload.id]);  
      
      if (rows.length > 0) {
        return done(null, rows[0]);
      }
      return done(null, false);
    } catch (err) {
      return done(err, false);
    }
  })
);

module.exports = passport;