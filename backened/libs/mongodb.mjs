import mongoose from "mongoose"
import dns from "node:dns"

dns.setDefaultResultOrder("ipv4first")
dns.setServers(["8.8.8.8", "8.8.4.4"])

const uri = process.env.MONGO_DB_URI

export const connect_database = async () => {

    if (!uri) {
        console.error("mongodb uri is required")
        return
    }

    try {
        await mongoose.connect(uri, {
            dbName: "project-1"
        })
        console.log("mongoose is connected")
    } catch (error) {
        console.error(error)
        console.error("mongoose is disconnected")
    }

}