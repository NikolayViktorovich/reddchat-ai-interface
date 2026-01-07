import express from 'express';
import axios from 'axios';
import cors from 'cors';

const app = express();

app.use(cors());
app.use(express.json());

const REPLICATE_TOKEN = "r8_5fN6YmTjkKTiwItrWbjOQP3FfJ7ruif4ZBxXu";

app.post('/generate', async (req, res) => {
  try {
    const { prompt = "a cat in space" } = req.body;
    
    const response = await axios.post("https://api.replicate.com/v1/predictions",
      {
        version: "39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b",
        input: { prompt }
      },
      {
        headers: {
          "Authorization": `Token ${REPLICATE_TOKEN}`,
          "Content-Type": "application/json"
        }
      }
    );

    const predictionId = response.data.id;
    let result;

    while (true) {
      const status = await axios.get(
        `https://api.replicate.com/v1/predictions/${predictionId}`,
        { headers: { "Authorization": `Token ${REPLICATE_TOKEN}` } }
      );

      if (status.data.status === "succeeded") {
        result = status.data.output[0];
        break;
      }
      if (status.data.status === "failed") {
        throw new Error("Replicate failed");
      }
      await new Promise(r => setTimeout(r, 1000));
    }

    res.json({ url: result });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.listen(3000, () => console.log('Сервер запущен: http://localhost:3000/generate'));
