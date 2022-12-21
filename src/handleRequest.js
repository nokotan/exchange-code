const qs = require('querystring');
const fetch = require('node-fetch');

const URL = 'https://github.com/login/oauth/access_token';
const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;

function notAllowed(res) {
  res.writeHead(401);
  res.end();
}

function showError(res, err) {
  console.log(err.toString());
  res.writeHead(400);
  res.end(`<pre>${err.toString()}</pre>`);
}

function readFormData(request, type) {
  return new Promise(function (resolve, reject) {
    let body = '';

    request.on('data', function (data) {
      body += data;

      // Too much POST data, kill the connection!
      // 1e6 === 1 * Math.pow(10, 6) === 1 * 1000000 ~~~ 1MB
      if (body.length > 1e6)
        request.connection.destroy();
    });

    request.on('end', function () {
      try {
        const result = type == "json" ? JSON.parse(body) : qs.parse(body);
        resolve(result);
      } catch (ex) {
        reject(ex);
      }
    });
  });
}

module.exports = async function handleRequest(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET, POST');

  if (req.method != "POST") {
    res.writeHead(200);
    res.end();
    return;
  }

  if (!CLIENT_ID) return showError(res, "server is misconfigured!");
  if (!CLIENT_SECRET) return showError(res, "server is misconfigured!");

  if (req.url == "/github/login/oauth/access_token") {
    if (req.method != "POST") return notAllowed(res);
    
    try {
      const post = await readFormData(req, "form");
      const input = JSON.parse(post.input);

      if (!input["code"]) return showError(res, "code is missing!");

      const fetchOption = {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          client_id: CLIENT_ID,
          client_secret: CLIENT_SECRET,
          code: TEMP_CODE,
        })
      };

      const response = await fetch(URL, fetchOption);
      res.writeHead(200);
      res.end(await response.json());
    } catch (e) {
      return showError(res, e);
    }
    return;
  }

  res.writeHead(404);
  res.end();
};
