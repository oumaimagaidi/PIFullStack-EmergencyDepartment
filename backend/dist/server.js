"use strict";

var _express = _interopRequireDefault(require("express"));
var _mongoose = _interopRequireDefault(require("mongoose"));
var _cors = _interopRequireDefault(require("cors"));
var _dotenv = _interopRequireDefault(require("dotenv"));
var _auth = _interopRequireDefault(require("./routes/auth.js"));
var _users = _interopRequireDefault(require("./routes/users.js"));
var _db = _interopRequireDefault(require("./db.js"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { "default": e }; }
_dotenv["default"].config();
var app = (0, _express["default"])();

// ✅ Connexion à MongoDB
(0, _db["default"])();
  




// ✅ Middlewares
app.use(_express["default"].json());
app.use((0, _cors["default"])({
  origin: "http://localhost:3000",
  // Autoriser uniquement cette origine
  credentials: true,
  // Permettre l'envoi des cookies
  methods: ["GET", "POST", "PUT", "DELETE"],
  // Autoriser ces méthodes
  allowedHeaders: ["Content-Type", "Authorization"] // Headers autorisés
}));

// ✅ Routes
app.use("/api/auth", _auth["default"]);
app.use("/api/users", _users["default"]);

// ✅ Lancement du serveur
var PORT = process.env.PORT || 8080;
app.listen(PORT, function () {
  return console.log("\u2705 Serveur d\xE9marr\xE9 sur le port ".concat(PORT));
});