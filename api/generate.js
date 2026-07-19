export default async function handler(req, res) {
    // Vercel Serverless Function sirf POST request allow karega
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Only POST requests allowed' });
    }

    try {
        const { prompt } = req.body;

        // Hugging Face API call (Vercel Node 18+ use karta hai, so fetch default kaam karega)
        const response = await fetch(
            "https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-xl-base-1.0",
            {
                headers: {
                    Authorization: `Bearer ${process.env.HF_API_KEY}`,
                    "Content-Type": "application/json",
                },
                method: "POST",
                body: JSON.stringify({ inputs: prompt }),
            }
        );

        if (!response.ok) {
            throw new Error(`Hugging Face Error: ${response.statusText}`);
        }

        // Image data ko base64 format mein convert karna
        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const base64Image = buffer.toString('base64');

        // Frontend ko image send karna
        res.status(200).json({ image: `data:image/jpeg;base64,${base64Image}` });

    } catch (error) {
        console.error("Server Error:", error);
        res.status(500).json({ error: "Failed to generate image." });
    }
}
