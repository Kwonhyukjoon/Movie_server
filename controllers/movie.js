const connection = require("../db/mysql_connection");

// @desc      영화 데이터를 불러오는 API
// @route     GET/api/v1/movies?offset=0&limit=25
// @request   offset,limit
// @response  title, genre, attendance, year

exports.getMovies = async (req, res, next) => {
  let offset = req.query.offset;
  let limit = req.query.limit;

  let query = `select m.*, count(r.movie_id) as reply_cnt, 
  round(avg(r.rate) , 1) as avg_rating
  from movie as m
  left join movie_comment as r
  on m.id = r.movie_id
  group by m.id
  order by m.id
  limit ${offset}, ${limit};`;
  console.log(query);
  try {
    [rows] = await connection.query(query);
    res.status(200).json({ success: true, items: rows, cnt: rows.length });
  } catch (e) {
    res.status(500).json({ success: false, message: "DB Error", error: e });
  }
};

// @desc    영화명으로 검색하는 API (25개씩)
// @route   GET /api/v1/movie/search
// @req     offset, limit, keyword
//          (  ?offset=0&limit=25&keyword=war  )
// @res     success, items[ {  } ], cnt

exports.searchMovies = async (req, res, next) => {
  let offset = req.query.offset;
  let limit = req.query.limit;
  let keyword = req.query.keyword;

  if (!offset || !limit || !keyword) {
    res.status(400).json({ message: "parameters setting error" });
    return;
  }

  let query = `select * from movie where title like "%${keyword}%" limit ${offset}, ${limit}`;

  try {
    [rows, fields] = await connection.query(query);
    res.status(200).json({ success: true, items: rows });
  } catch (e) {
    res.status(500).json({ success: false, message: "DB Error", error: e });
  }
};

// @desc      로그인한 영화 데이터를 불러오는 API
// @route     GET/api/v1/movies?offset=0&limit=25/auth
// @request   offset,limit
// @response  title, genre, attendance, year

exports.getAuthMovies = async (req, res, next) => {
  let offset = req.query.offset;
  let limit = req.query.limit;
  let user_id = req.user.id;
  if (!offset || !limit) {
    res.status(400).json({ message: "parameters setting error" });
    return;
  }

  let query = `select m.*,
  if(f.id is not null, true, false) as favorite,
  count(c.movie_id) as reply_cnt,
  round(avg(c.comment), 1) as avg_rating  
  from movie as m
  left join movie_comment as c
  on m.id = c.movie_id
  left join favorite_movie as f
  on m.id = f.movie_id and f.user_id = ${user_id}
  group by m.id
  order by m.id
  limit ${offset}, ${limit};`;

  console.log(query);
  try {
    [rows] = await connection.query(query);
    res.status(200).json({ success: true, items: rows, cnt: rows.length });
  } catch (e) {
    res.status(500).json({ success: false, message: "DB Error", error: e });
  }
};

// @desc    연도로 정렬하는 API (25개씩) 오름,내림 둘다 가능
// @route   /api/v1/movie/year
// @req     offset, limit, order : asc / desc (디폴트 오름차순)
//          (?offset=0&limit=25&order=asc)
// @res     success, items[ ]  , cnt
exports.yearMovies = async (req, res, next) => {
  let offset = req.query.offset;
  let limit = req.query.limit;
  let order = req.query.order;

  if (!offset || !limit) {
    res.status(400).json({ message: "parameters setting error" });
    return;
  }

  if (!order) {
    order = "asc";
  }

  let query = `select * from movie order by year ${order} limit ${offset}, ${limit}`;
  try {
    [rows, fields] = await connection.query(query);
    res.status(200).json({ success: true, items: rows, cnt: rows.length });
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
  let order = req.query.order;

  if (!offset || !limit) {
    res.status(400).json({ message: "parameters setting error" });
    return;
  }

  if (!order) {
    order = "asc";
  }

  let query = `select * from movie order by attendance ${order} limit ${offset}, ${limit}`;
  try {
    [rows, fields] = await connection.query(query);
    res.status(200).json({ success: true, items: rows });
  } catch (e) {
    res.status(500).json({ success: false, message: "DB Error", error: e });
  }
};
