import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai'; // Asegúrase de instalar esta biblioteca y configurarla correctamente

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  throw new Error('GEMINI_API_KEY is not set');
}

const genAI = new GoogleGenerativeAI(apiKey);

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('imagen') as File;

    if (!file) {
      return NextResponse.json({ error: 'Por favor envía una imagen.' }, { status: 400 });
    }

    // Convertir el archivo a buffer
    const buffer = await file.arrayBuffer();
    const imagenParaIA = {
      inlineData: {
        data: Buffer.from(buffer).toString('base64'),
        mimeType: file.type,
      },
    };

    const modelsToTry = ['gemini-2.5-flash', 'gemini-2.5-flash-lite', 'gemini-2.5-pro'];
    let resultado;
    let lastError;

    for (const modelName of modelsToTry) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName });
        const fechaActual = new Date().toLocaleDateString('es-CO');

        const prompt = `
      Hoy es ${fechaActual}.
      Analiza esta imagen y extrae la información relevante del evento.

      Reglas para las fechas y horas:
      - Si la imagen dice un día de la semana o "mañana", calcula la fecha exacta en formato YYYY-MM-DD usando la fecha de hoy como referencia.
      - Si menciona un mes y día (ej. "15 de Octubre") o (ej. 21 julio), pero no el año, asume que es el año actual o el próximo más cercano, y conviértelo a YYYY-MM-DD.
      - Si de plano no puedes convertirlo a YYYY-MM-DD, escribe el texto de la fecha exactamente como aparece en la imagen.
      - Para la hora, conviértela siempre a formato de 24 horas (ej. 14:00).

      Devuelve ÚNICAMENTE un objeto JSON válido con esta estructura exacta, sin texto adicional:
      {
          "titulo": "Nombre del evento",
          "fecha": "YYYY-MM-DD o texto original",
          "hora": "HH:MM",
          "descripcion": "Breve resumen del evento"
      }
      Si algún dato definitivamente no está en la imagen, pon null.
    `;

        resultado = await model.generateContent([prompt, imagenParaIA]);
        console.log(`Modelo usado: ${modelName}`);
        break; // Success, sale del loop
      } catch (error: any) {
        lastError = error;
        if (error.message?.includes('503') || error.status === 503) {
          console.log(`Modelo ${modelName} no disponible (503), intentando con el siguiente...`);
          continue; // Intenta con el siguiente modelo 
        } else {
          // Otro tipo de error, no reintenta y lo muestra directamente
          throw error;
        }
      }
    }

    if (!resultado) {
      throw lastError; // Todos los modelos fallaron con 503 o hubo otro error, muestra el último error
    }

    // Mensajes para saber cuántos tokens costó esa imagen y ese texto
    if (resultado.response.usageMetadata) {
      console.log("=== ESTADÍSTICAS DE CONSUMO ===");
      console.log("Tokens de la imagen:", resultado.response.usageMetadata.promptTokenCount);
      console.log("Tokens de la respuesta:", resultado.response.usageMetadata.candidatesTokenCount);
      console.log("Total tokens usados:", resultado.response.usageMetadata.totalTokenCount);
    }

    const textoRespuesta = resultado.response.text();
    const jsonLimpio = textoRespuesta.replace(/```json/g, '').replace(/```/g, '').trim();
    const datosEvento = JSON.parse(jsonLimpio);

    return NextResponse.json(datosEvento);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Hubo un error procesando la imagen.' }, { status: 500 });
  }
}