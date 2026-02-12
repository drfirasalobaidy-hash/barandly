import { Injectable } from '@angular/core';
import { GoogleGenAI } from '@google/genai';

@Injectable({
  providedIn: 'root'
})
export class GeminiService {
  private ai: GoogleGenAI;

  constructor() {
    this.ai = new GoogleGenAI({ apiKey: process.env['API_KEY'] || '' });
  }

  async getStrategicInsight(financialData: any, projectData: any): Promise<string> {
    try {
      const prompt = `
        أنت مستشار أعمال استراتيجي رفيع المستوى لوكالة تصميم إبداعية.
        قم بتحليل البيانات التالية وقدم ملخصًا تنفيذيًا للمدير العام (CEO) باللغة العربية.
        
        البيانات المالية: ${JSON.stringify(financialData)}
        إحصائيات المشاريع: ${JSON.stringify(projectData)}
        
        المطلوب:
        1. اكتب 3 نقاط مركزة ومختصرة.
        2. ركز على الصحة المالية، الاختناقات التشغيلية، وتوصية استراتيجية.
        3. استخدم لغة مهنية رسمية ومباشرة.
        4. لا تستخدم تنسيق Markdown الثقيل (فقط نص عادي).
      `;

      const response = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });

      return response.text;
    } catch (error) {
      console.error('Gemini API Error:', error);
      return "عذراً، لا يمكن توليد التحليلات في الوقت الحالي. يرجى التحقق من الاتصال.";
    }
  }
}