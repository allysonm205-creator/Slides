import { GoogleGenAI } from "@google/genai";
import type { Slide, Source, PresentationPattern, SlideLayout } from '../types';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable is not set.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const fileToGenerativePart = async (file: File) => {
  const base64EncodedData = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve((reader.result as string).split(',')[1]);
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });

  return {
    inlineData: {
      data: base64EncodedData,
      mimeType: file.type,
    },
  };
};

const imageUrlToDataUrl = async (url: string): Promise<string> => {
    if (!url) return '';
    try {
        // Use a robust image processing service as a proxy
        const proxyUrl = `https://images.weserv.nl/?url=${encodeURIComponent(url)}`;
        const response = await fetch(proxyUrl);

        if (!response.ok) {
            throw new Error(`Failed to fetch image via proxy. Status: ${response.status} ${response.statusText}`);
        }
        const blob = await response.blob();

        if (!blob.type.startsWith('image/')) {
            console.warn(`Proxy returned non-image content for URL: ${url}. MIME type: ${blob.type}`);
            return '';
        }

        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    } catch (error) {
        console.error(`Could not convert image URL to Base64: ${url}`, error);
        return ''; // Return empty string on failure
    }
};


const getPatternInstructions = (pattern: PresentationPattern): string => {
    switch (pattern) {
        case 'analise-de-dados':
            return `
                O estilo da apresentação deve ser "Análise de Dados".
                - Estrutura: Comece com um slide de resumo executivo, seguido por metodologia, principais descobertas (use pontos de dados e métricas), e termine com conclusões e recomendações.
                - Conteúdo: Seja orientado por dados. Use linguagem precisa e foque em insights acionáveis.
                - Imagens: Priorize a busca por gráficos, infográficos e tabelas que representem dados. Se não encontrar, use imagens conceituais de negócios ou tecnologia.
                - Layouts: Use predominantemente o layout 'default'.
            `;
        case 'visual':
            return `
                O estilo da apresentação deve ser "Visual".
                - Estrutura: Cada slide deve ter um título impactante e no máximo 1-2 frases curtas de conteúdo. O foco principal é a imagem.
                - Conteúdo: O texto deve ser mínimo e poético ou provocativo, complementando a imagem.
                - Imagens: Procure por imagens de alta resolução, artísticas e de forte impacto emocional (fotografias, ilustrações) que contem uma história. A imagem é a protagonista de cada slide.
                - Layouts: Use predominantemente o layout 'image_full' para slides de conteúdo e 'title_only' para introdução e seções.
            `;
        case 'anatomia':
            return `
                O estilo da apresentação deve ser "Anatomia e Histologia".
                - Estrutura: Organize o conteúdo de forma lógica para o estudo anatômico/histológico (ex: macro para micro, sistema por sistema).
                - Conteúdo: Use terminologia médica e científica precisa. Descreva estruturas, funções e relações espaciais.
                - Imagens: A busca por imagens DEVE priorizar ilustrações anatômicas detalhadas, diagramas de sistemas do corpo, e fotomicrografias de tecidos (histologia).
                - Layouts: Use o layout 'default' para mostrar imagens ao lado de descrições detalhadas.
            `;
        case 'processos':
            return `
                O estilo da apresentação deve ser "Processos e Fluxogramas".
                - Estrutura: Organize os slides para mostrar uma sequência passo a passo de um processo ou um sistema hierárquico.
                - Conteúdo: Explique cada etapa ou componente de um processo fisiológico, farmacológico ou de qualquer sistema.
                - Imagens: A busca por imagens DEVE priorizar fluxogramas, diagramas de processo, mapas conceituais e organogramas. Se não encontrar, use ícones ou ilustrações que representem cada etapa.
                - Layouts: Use o layout 'default', focando na clareza do diagrama ou imagem.
            `;
        case 'padrao':
        default:
            return `
                O estilo da apresentação deve ser "Padrão".
                - Estrutura: Um equilíbrio entre texto e imagem. Siga a estrutura lógica de introdução, desenvolvimento e conclusão. Use layouts variados ('default', 'title_only') para manter o interesse.
                - Conteúdo: O texto deve ser informativo e conciso, usando bullet points.
                - Imagens: Busque por imagens relevantes e de boa qualidade que ilustrem o ponto de cada slide.
            `;
    }
};


export const generateSlides = async (topic: string, file: File | null, pattern: PresentationPattern): Promise<{ slides: Slide[]; sources: Source[] }> => {
  const topicPrompt = topic ? `com base no seguinte tópico: "${topic}"` : '';
  const filePrompt = file ? `usando o conteúdo do documento anexado como fonte primária de informação` : '';
  const connector = topic && file ? ' e ' : '';
  const patternInstructions = getPatternInstructions(pattern);

  const prompt = `
    Você é um especialista em criar apresentações. Sua tarefa é gerar um deck de slides profissional e informativo ${topicPrompt}${connector}${filePrompt}.

    **INSTRUÇÕES DE ESTILO E LAYOUT:**
    ${patternInstructions}
    Para cada slide, você DEVE escolher um dos seguintes layouts visuais: 'default' (imagem ao lado do texto), 'image_full' (imagem de fundo em tela cheia com texto sobreposto), ou 'title_only' (apenas título e subtítulo, sem imagem). A escolha do layout deve ser apropriada para o conteúdo e estilo do slide.

    **INSTRUÇÕES CRÍTICAS PARA IMAGENS:**
    Sua tarefa mais importante é garantir que CADA URL de imagem seja válido. Siga estas regras estritamente:
    1.  **Use a Busca:** Para encontrar uma imagem, use sua ferramenta de busca na web.
    2.  **Use URLs Exatos:** Você SÓ PODE usar URLs de imagem que aparecem DIRETAMENTE nos resultados da busca.
    3.  **NÃO MODIFIQUE:** É absolutamente proibido modificar, combinar, adivinhar ou inventar qualquer parte de um URL de imagem. Copie-o exatamente como o encontrou.
    4.  **Verifique o Link:** O URL DEVE apontar diretamente para um arquivo de imagem (\`.jpg\`, \`.png\`, \`.webp\`, etc.), não para uma página da web (HTML). A sua prioridade máxima é a validade e acessibilidade do URL.
    5.  **Fallback:** Se a busca não retornar uma imagem adequada e válida para um slide que precisa de uma, deixe o campo \`imageUrl\` como uma string vazia (\`""\`). É muito melhor não ter imagem do que ter um link quebrado que resulta em erro.

    **INSTRUÇÕES GERAIS:**
    Se um documento for fornecido, priorize seu conteúdo. Se apenas um tópico for dado, gere o conteúdo com base em seu conhecimento e pesquisa na web. Se ambos forem fornecidos, sintetize-os.
    Se nenhum tópico for fornecido, crie uma apresentação que resuma os pontos-chave do documento.
    A apresentação deve ter um fluxo lógico e o número total de slides deve ser entre 5 e 10.
    
    Sua resposta DEVE ser um único bloco de código JSON, sem nenhum texto ou explicação antes ou depois. O JSON deve seguir estritamente esta estrutura:
    \`\`\`json
    {
      "slides": [
        {
          "title": "string",
          "content": ["string"],
          "layout": "default | image_full | title_only",
          "speakerNotes": "string (opcional)",
          "imageUrl": "string (opcional, necessário para layouts 'default' e 'image_full')"
        }
      ]
    }
    \`\`\`
  `;

  const parts: any[] = [{ text: prompt.trim() }];

  if (file) {
    try {
      const filePart = await fileToGenerativePart(file);
      parts.push(filePart);
    } catch (error) {
       console.error("Erro ao processar arquivo:", error);
       throw new Error("Não foi possível processar o arquivo enviado. Pode estar corrompido ou em um formato não suportado.");
    }
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: { parts },
      config: {
        tools: [{googleSearch: {}}],
      },
    });

    if (!response || !response.text) {
        console.error("API response is empty or invalid:", response);
        const blockReason = response?.candidates?.[0]?.finishReason;
        if (blockReason === 'SAFETY') {
             throw new Error("A geração de slides foi bloqueada por motivos de segurança. Por favor, ajuste seu tópico ou documento.");
        }
        throw new Error("A IA retornou uma resposta vazia. Tente reformular seu tópico ou usar um arquivo diferente.");
    }

    let jsonText = response.text.trim();
    
    const markdownMatch = jsonText.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (markdownMatch && markdownMatch[1]) {
      jsonText = markdownMatch[1];
    }

    const parsedJson = JSON.parse(jsonText);
    const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks ?? [];
    
    if (!parsedJson || !Array.isArray(parsedJson.slides)) {
        console.error("JSON gerado não corresponde à estrutura esperada:", parsedJson);
        throw new Error("Falha ao gerar slides no formato correto.");
    }

    const slidesWithEmbeddedImages = await Promise.all(
        parsedJson.slides.map(async (slide: Slide) => {
            if (slide.imageUrl) {
                const dataUrl = await imageUrlToDataUrl(slide.imageUrl);
                return { ...slide, imageUrl: dataUrl };
            }
            return slide;
        })
    );

    return { slides: slidesWithEmbeddedImages, sources };

  } catch (error) {
    console.error("Erro ao gerar slides com a API Gemini:", error);
    if (error instanceof Error) {
        if (error.name === 'SyntaxError') {
             throw new Error("O modelo de IA retornou um formato de dados inválido. Tente novamente.");
        }
        if (error.message.startsWith("A IA retornou") || error.message.startsWith("A geração de slides foi bloqueada") || error.message.startsWith("Não foi possível processar o arquivo")) {
            throw error;
        }
    }
    throw new Error("Não foi possível conectar ao serviço de IA. Verifique sua conexão e chave de API.");
  }
};