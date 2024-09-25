import { expect, describe, test } from "@jest/globals";
import request from "supertest";
import express from "express";
import { NextApiHandler } from "next";

const app = express();

const helloHandler: NextApiHandler = (req, res) => {
  res.json({ message: "Hello from the custom Express server!" });
};

// @ts-expect-error
app.use("/api/hello", helloHandler);

describe("API Routes", () => {
  test("GET /api/hello", async () => {
    const res = await request(app).get("/api/hello");
    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      message: "Hello from the custom Express server!",
    });
  });
});
