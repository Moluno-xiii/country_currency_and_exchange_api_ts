import app from "./app";

const port = process.env.LOCALHOST_PORT;

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
