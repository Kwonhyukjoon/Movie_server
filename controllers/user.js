const connection = require("../db/mysql_connection");
const validator = require("validator");
const bcrypt = require("bcryptjs");

const jwt = require("jsonwebtoken");

// @desc    회원가입
// @route   POST /api/v1/user  =>  나
// @route   POST /api/v1/user/register
// @route   POST /api/v1/user/signup
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
  const conn = await connection.getConnection();

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

// @desc    로그인
// @route   POST /api/v1/moviesUser/login
// @parameters  {email : "hj@naver.com", passwd : "1234"}
exports.loginUser = async (req, res, next) => {
  let email = req.body.email;
  let passwd = req.body.passwd;

  let query = "select * from movie_user where email = ? ";
  let data = [email];
  try {
    [rows] = await connection.query(query, data);
    // 디비에 저장된 비밀번호 가져와서
    let savedPasswd = rows[0].passwd;
    // 비밀번호 체크 : 비밀번호가 서로 맞는지 확인
    let isMatch = await bcrypt.compare(passwd, savedPasswd);
    // let isMatch = bcrypt.compareSync(passwd, savedPasswd); 위랑같음
    if (isMatch == false) {
      res.status(400).json({ success: true, result: isMatch });
      return;
    }
    let token = jwt.sign(
      { user_id: rows[0].id },
      process.env.ACCESS_TOKEN_SECRET
    );

    query = "insert into movie_token (token,user_id)values(?,?)";
    data = [token, rows[0].id];

    try {
      [result] = await connection.query(query, data);
      res.status(200).json({ success: true, result: isMatch, token: token });
    } catch (e) {
      res.status(500).json({ success: false, error: e });
    }
  } catch (e) {
    res.status(500).json({ success: false, error: e });
  }
};

// @desc  로그아웃(현재의 기기 1개에 대한 로그아웃)
// @route /api/v1/users/logout
exports.logout = async (req, res, next) => {
  // movie_token 테이블에서, 토큰 삭제해야 로그아웃이 되는것이다.
  let user_id = req.user.id;
  let token = req.user.token;

  let query = "delete from movie_token where user_id =? and token = ?";
  let data = [user_id, token];

  try {
    [result] = await connection.query(query, data);
    res.status(200).json({ success: true });
  } catch (e) {
    res.status(500).json({ success: false, error: e });
  }
};
