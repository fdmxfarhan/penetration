import express from "express";
import path from "path";
import devicesRouter from "./routes/devices";

const app = express();

app.set("view engine", "ejs");
app.set(
    "views",
    path.join(__dirname, "../views")
);

app.use(express.json());
app.use(express.urlencoded({
    extended: true
}));

app.use(
    express.static(
        path.join(__dirname, "../public")
    )
);

app.use("/devices", devicesRouter);

app.get("/", (req, res) => {
    res.redirect("/devices");
});

export default app;