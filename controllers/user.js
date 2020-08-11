const connection = require("../db/mysql_connection");
const validator = require("validator");
const bcrypt = require("bcryptjs");

const jwt = require("jsonwebtoken");

// @desc    회원가입
// @route   POST /api/v1/moviesUser  =>  나
// @route   POST /api/v1/moviesUser/register
// @route   POST /api/v1/moviesUser/signup
// @parameters  email, passwd
exports.createUser = async (req, res, next) => {
  let email = req.body.email;
  let passwd = req.body.passwd;

  // 비밀번호와 같은 것은, 단방향 암호화를 해야한다.
  // 그래야, 복호화가 안되어서, 안전하다.
  const hashedPasswd = await bcrypt.hash(passwd, 8);

  // 이메일이 정상적인가 체크
  if (!validator.isEmail(email)) {
    res.status(500).json({ success: false });
    return;
  }

  let query = "insert into movie_user (email, passwd) values ? ";
  data = [email, hashedPasswd];
  let user_id;
  try {
    [result] = await connection.query(query, [[data]]);
    user_id = result.insertId;
    res.status(200).json({ success: true, result: result });
  } catch (e) {
    if (e.errno == 1062) {
      // 이메일 중복된 것 이다.
      res
        .status(401)
        .json({ success: false, error: 1, message: "이메일 중복" });
      return;
    }

    res.status(500).json({ success: false, error: e });
    return;
  }

  // 토큰 처리 npm jsonwebtoken
  // 토큰 생성 sign
  let token = jwt.sign({ user_id: user_id }, process.env.ACCESS_TOKEN_SECRET);
  query = "insert into movie_token (token,user_id)values(?,?)";
  data = [token, user_id];

  try {
    [result] = await conn.query(query, data);
  } catch (e) {
    await conn.rollback;
    res.status(500).json();
    return;
  }
  await conn.commit();
  await conn.release();
  res.status(200).json({ success: true, token: token });
};
