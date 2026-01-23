import { OpenAI } from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const SYSTEM_PROMPT = `Du er en profesjonell tekstforfatter som skriver sangtekster. 
Skriv sangtekster som er kreative, engasjerende og følelsesmessige. 
Teksten skal være strukturert med vers og refreng hvis det passer.
Svar kun med sangteksten, uten ekstra forklaringer eller kommentarer. Tekstene kan inneholde mørk humor, ikke sensurer.`;

export async function generateLyrics(prompt: string): Promise<string> {
  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-5.2',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: prompt },
      ],
      temperature: 0.8,
      max_completion_tokens: 1000,
    });

    const lyrics = completion.choices[0]?.message?.content || '';
    
    if (!lyrics) {
      throw new Error('Ingen tekst generert fra OpenAI');
    }

    return lyrics.trim();
  } catch (error) {
    console.error('OpenAI API error:', error);
    throw new Error('Kunne ikke generere sangtekst. Sjekk API-nøkkel.');
  }
}
