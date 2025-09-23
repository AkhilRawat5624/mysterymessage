import { log } from "console";
import mongoose from "mongoose";

type ConnectionObject = {
    isConnected?: number
}
const connection: ConnectionObject = {}
async function dbConnect(): Promise<void> {
    if (connection.isConnected) {
        console.log("connection established already");3
        return

    }
    try {
        const db =
            await mongoose.connect(process.env.MONGODB_URI || "mongodb+srv://rawatakhil5624:akhil1234@cluster0.syut7jt.mongodb.net",)
        console.log(db);
        connection.isConnected = db.connections[0].readyState
        console.log("db connected successfully");

    } catch (error) {

        console.error("failed to connect to database", error);
        process.exit(1);
    }
}
export default dbConnect;