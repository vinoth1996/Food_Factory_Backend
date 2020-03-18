var jwt = require('jsonwebtoken');
var key = require('./config/secretKey');
function verifyToken(req, res, next) {
  var token = req.headers['x-access-token'];
  if (!token)
    return res.status(403).send({ auth: false, message: 'No token provided.' });
  jwt.verify(token, key.secret, function(err, decoded) {
    if (err)
    return res.status(500).send({ auth: false, message: 'Failed to authenticate token.' });
    // if everything good, save to request for use in other routes
    req.email = decoded.email;
    next();
  });
}
module.exports = verifyToken;







//"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InZpamF5QGdtYWlsLmNvbSIsImlhdCI6MTU4NDUyNjY3NCwiZXhwIjoxNjE2MDYyNjc0fQ.mpA-MYTpSkTmvTFIrjQRF2giAzvQJ0CEAhFSDV0m5g4"