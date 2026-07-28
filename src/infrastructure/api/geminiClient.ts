import { GoogleGenAI } from '@google/genai';

export async function runGeminiPrompt(promptText: string, modelName: string = 'gemini-2.5-flash'): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;

  if (!apiKey) {
    console.warn('GEMINI_API_KEY is not configured in .env. Returning simulated result for testing.');
    return `[Gemini AI 시뮬레이션 결과]\n\n입력받은 프롬프트:\n"${promptText}"\n\n위 프롬프트에 대한 Gemini AI의 응답입니다:\n- 요청사항이 성공적으로 처리되었습니다.\n- .env 파일에 GEMINI_API_KEY를 설정하시면 실제 Gemini 모델의 최신 생성 결과를 받아보실 수 있습니다.`;
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    
    // SDK 표준 Gemini API 호출
    const targetModel = modelName.includes('gemini') ? modelName : 'gemini-2.5-flash';
    const response = await ai.models.generateContent({
      model: targetModel,
      contents: promptText,
    });

    return response.text || '결과가 비어있습니다.';
  } catch (error: any) {
    console.error('Gemini API Error:', error);
    throw new Error(`Gemini API 호출 실패: ${error.message || error}`);
  }
}
