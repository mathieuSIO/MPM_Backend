import app from "./app.js";
import "dotenv/config";

const port: number = Number(process.env.PORT) || 4000;

app.listen(port, () => {
    console.log(`serveur is running on port ${port}`)
})

