import app from "./app";

const port = process.env.LOCALHOST_PORT;

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});

// "@types/cors": "^2.8.18",
// "@types/express": "^5.0.2",
// "@types/node": "^22.15.21",
// "typescript": "^5.8.3"
