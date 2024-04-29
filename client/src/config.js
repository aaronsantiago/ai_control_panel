

let host = "http://localhost:8000/";

if (process.env.NODE_ENV != "development") {
  host = "/";
};

export { host };