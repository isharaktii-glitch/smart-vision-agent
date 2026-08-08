export async function POST(req) {
  try {
    const { image } = await req.json();

    if (!image) {
      return Response.json({ error: 'No image provided' }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return Response.json({ error: 'API key not configured' }, { status: 500 });
    }

    const base64Data = image.replace(/^data:image\/\w+;base64,/, '');

    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: 'මේ මුහුණේ mood එක විශ්ලේෂණය කරන්න. සතුට, දුක, කෝපය, පුදුමය, සාමාන්‍ය මේ වගේ mood එකක් සහ approximate percentage එකක් සිංහලෙන් කෙටියෙන් කියන්න. Example format: "සතුට 80%, සාමාන්‍ය 20%"',
                },
                {
                  inline_data: {
                    mime_type: 'image/jpeg',
                    data: base64Data,
                  },
                },
              ],
            },
          ],
        }),
      }
    );

    const data = await geminiResponse.json();

    if (!geminiResponse.ok) {
      return Response.json({ error: data.error?.message || 'Gemini API error' }, { status: 500 });
    }

    const moodText = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Mood detect කරන්න බැරි වුනා';

    return Response.json({ mood: moodText });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
