const connection = require("../db/mysql_connection");

// @desc      영화 데이터를 불러오는 API
// @route     GET/api/v1/movies?offset=0&limit=25
// @request   offset,limit
// @response  title, genre, attendance, year

exports.getMovies = async (req, res, next) => {
  let offset = req.query.offset;
  let limit = req.query.limit;
  let query = `select * from movie limit ${offset},${limit}`;
  console.log(query);
  try {
    [rows, fields] = await connection.query(query);
    let cnt = rows.length();
    res.status(200).json({ success: true, items: rows, cnt: cnt });
  } catch (e) {
    res.status(500).json({ success: false, message: "DB Error", error: e });
  }
};

// @desc      영화명 검색하는 API
// @route     GET/api/v1/movies/search?keyword=Y&offset=0&limit=25
// @request   keyword,offset,limit
// @response  title

exports.searchMovies = async (req, res, next) => {
  let offset = req.query.offset;
  let limit = req.query.limit;
  let keyword = req.query.keyword;
  let query = `select * from movie where title like "%${keyword}%" limit ${offset}, ${limit}`;

  try {
    [rows, fields] = await connection.query(query);
    res.status(200).json({ success: true, items: rows });
  } catch (e) {
    res.status(500).json({ success: false, message: "DB Error", error: e });
  }
};

// @desc      연도 내림차순 정렬해서 가져오기
// @route     GET/api/v1/movies/year?offset=0&limit=25
// @request   offset,limit
// @response  title, genre, attendance, year
exports.yearMovies = async (req, res, next) => {
  let offset = req.query.offset;
  let limit = req.query.limit;
  let query = `select * from movie order by year desc limit ${offset}, ${limit}`;
  try {
    [rows, fields] = await connection.query(query);
    res.status(200).json({ success: true, items: rows });
  } catch (e) {
    res.status(500).json({ success: false, message: "DB Error", error: e });
  }
};

// @desc      관객수 내림차순 정렬해서 가져오기
// @route     GET/api/v1/movies/attend?offset=0&limit=25
// @request   offset,limit
// @response  title, genre, attendance, year
exports.attendanceMovies = async (req, res, next) => {
  let offset = req.query.offset;
  let limit = req.query.limit;
  let query = `select * from movie order by attendance desc limit ${offset}, ${limit}`;
  try {
    [rows, fields] = await connection.query(query);
    res.status(200).json({ success: true, items: rows });
  } catch (e) {
    res.status(500).json({ success: false, message: "DB Error", error: e });
  }
};
