export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Only POST requests allowed' });
    }

    try {
        const { prompt } = req.body;

        // Ek 8-second ka timer bana rahe hain
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000);

        const response = await fetch(
            "https://api-inference.huggingface.co/models/runwayml/stable-diffusion-v1-5",
            {
                headers: {
                    Authorization: `Bearer ${process.env.HF_API_KEY}`,
                    "Content-Type": "application/json",
                },
                method: "POST",
                body: JSON.stringify({ inputs: prompt }),
                signal: controller.signal // Is fetch ko timer se connect kar diya
            }
        );

        // Agar 8 second se pehle response aa gaya, toh timer cancel kar do
        clearTimeout(timeoutId);

        if (!response.ok) {
            const errText = await response.text();
            return res.status(response.status).json({ error: `Hugging Face Error: ${errText}` });
        }

        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const base64Image = buffer.toString('base64');

        res.status(200).json({ image: `data:image/jpeg;base64,${base64Image}` });

    } catch (error) {
        // Agar 8 second wala timer hit hota hai:
        if (error.name === 'AbortError') {
            return res.status(504).json({ error: "AI Model sleep mode se jaag raha hai. Please 5-10 second ruko aur dobara 'Generate' button dabao!" });
        }
        
        // Agar koi aur network error aata hai:
        console.error("Server Error:", error);
        res.status(500).json({ error: error.message });
    }
}
