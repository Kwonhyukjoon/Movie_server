const express = require("express");
const auth = require("../middleware/auth");
const {
  getMovies,
  searchMovies,
  yearMovies,
  attendanceMovies,
  getAuthMovies,
} = require("../controllers/movie");
const { route } = require("./user");

const router = express.Router();
// 각 경로별로 데이터 가져올 수 있도록, router 셋팅
router.route("/").get(getMovies);
router.route("/search").get(searchMovies);
router.route("/desc").get(yearMovies);
router.route("/pop").get(attendanceMovies);
router.route("/auth").get(auth, getAuthMovies);

module.exports = router;
