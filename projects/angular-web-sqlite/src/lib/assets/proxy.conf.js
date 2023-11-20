module.exports =
{
  "/": {
    secure: false,
    logLevel: "debug",
    changeOrigin: true,
    bypass: function (req, res, proxyOptions) {
      if (!res.headers) {
        return console.log('error no res: ' + res);
      }
      res.headers["Cross-Origin-Opener-Policy"] = "same-origin";
      res.headers["Cross-Origin-Embedder-Policy"] = "require-corp";
    }
  }
}
