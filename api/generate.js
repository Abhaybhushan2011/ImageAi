export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Only POST requests allowed' });
    }

    try {
        const { prompt } = req.body;

        // Yahan maine fast aur reliable model (Stable Diffusion v1.5) select kiya hai
        const response = await fetch(
            "https://api-inference.huggingface.co/models/runwayml/stable-diffusion-v1-5",
            {
                headers: {
                    Authorization: `Bearer ${process.env.HF_API_KEY}`,
                    "Content-Type": "application/json",
                },
                method: "POST",
                body: JSON.stringify({ inputs: prompt }),
            }
        );

        // Ab agar error aayega toh hume exact error message milega Hugging Face se
        if (!response.ok) {
            const errorDetails = await response.text();
            return res.status(response.status).json({ error: `Hugging Face se Error: ${errorDetails}` });
        }

        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const base64Image = buffer.toString('base64');

        res.status(200).json({ image: `data:image/jpeg;base64,${base64Image}` });

    } catch (error) {
        console.error("Server Error:", error);
        res.status(500).json({ error: error.message });
    }
}
