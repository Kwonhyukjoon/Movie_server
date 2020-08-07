const express = require("express");
const { getMovies, yearMovies } = require("../controllers/movie");

const router = express.Router();
// 각 경로별로 데이터 가져올 수 있도록, router 셋팅
router.route("/").get(getMovies);
router.route("/desc").get(yearMovies);

module.exports = router;
