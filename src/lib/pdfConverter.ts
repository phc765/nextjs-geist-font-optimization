import * as pdfjsLib from 'pdfjs-dist'
import { createWorker } from 'tesseract.js'
import { Document, Packer, Paragraph, TextRun, ImageRun } from 'docx'

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`

interface ExtractedContent {
  text: string
  images: ImageData[]
  formulas: FormulaData[]
}

interface ImageData {
  buffer: Buffer
  width: number
  height: number
  x: number
  y: number
}

interface FormulaData {
  latex: string
  x: number
  y: number
  width: number
  height: number
}

export async function convertPDFToDocx(pdfBuffer: Buffer): Promise<Buffer> {
  try {
    console.log('Starting PDF conversion...')
    
    // Load PDF document
    const pdfDoc = await pdfjsLib.getDocument({ data: pdfBuffer }).promise
    const numPages = pdfDoc.numPages
    
    console.log(`PDF has ${numPages} pages`)
    
    const docParagraphs: Paragraph[] = []
    
    // Process each page
    for (let pageNum = 1; pageNum <= numPages; pageNum++) {
      console.log(`Processing page ${pageNum}/${numPages}`)
      
      const page = await pdfDoc.getPage(pageNum)
      const content = await extractPageContent(page)
      
      // Add page content to document
      const pageParagraphs = await processPageContent(content, pageNum)
      docParagraphs.push(...pageParagraphs)
      
      // Add page break (except for last page)
      if (pageNum < numPages) {
        docParagraphs.push(
          new Paragraph({
            children: [new TextRun({ text: '', break: 1 })],
            pageBreakBefore: true,
          })
        )
      }
    }
    
    // Create Word document
    const doc = new Document({
      sections: [
        {
          properties: {},
          children: docParagraphs,
        },
      ],
    })
    
    // Generate DOCX buffer
    const buffer = await Packer.toBuffer(doc)
    console.log('PDF conversion completed successfully')
    
    return buffer
    
  } catch (error) {
    console.error('Error in PDF conversion:', error)
    throw new Error(`Lỗi chuyển đổi PDF: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

async function extractPageContent(page: any): Promise<ExtractedContent> {
  try {
    // Extract text content
    const textContent = await page.getTextContent()
    let fullText = ''
    
    // Combine all text items
    textContent.items.forEach((item: any) => {
      if (item.str) {
        fullText += item.str + ' '
      }
    })
    
    // Extract images and potential formulas
    const viewport = page.getViewport({ scale: 2.0 })
    const canvas = document.createElement('canvas')
    const context = canvas.getContext('2d')!
    canvas.height = viewport.height
    canvas.width = viewport.width
    
    const renderContext = {
      canvasContext: context,
      viewport: viewport,
    }
    
    await page.render(renderContext).promise
    
    // Extract images from rendered page
    const images = await extractImagesFromCanvas(canvas)
    
    // Process images for potential formulas using OCR
    const formulas = await processImagesForFormulas(images)
    
    return {
      text: fullText.trim(),
      images,
      formulas,
    }
    
  } catch (error) {
    console.error('Error extracting page content:', error)
    return {
      text: '',
      images: [],
      formulas: [],
    }
  }
}

async function extractImagesFromCanvas(canvas: HTMLCanvasElement): Promise<ImageData[]> {
  try {
    // This is a simplified approach - in a real implementation,
    // you would need more sophisticated image detection
    const imageData = canvas.getContext('2d')!.getImageData(0, 0, canvas.width, canvas.height)
    const buffer = Buffer.from(imageData.data)
    
    return [{
      buffer,
      width: canvas.width,
      height: canvas.height,
      x: 0,
      y: 0,
    }]
    
  } catch (error) {
    console.error('Error extracting images:', error)
    return []
  }
}

async function processImagesForFormulas(images: ImageData[]): Promise<FormulaData[]> {
  const formulas: FormulaData[] = []
  
  try {
    // Create Tesseract worker for OCR
    const worker = await createWorker('eng', 1, {
      logger: m => console.log(m)
    })
    
    for (const image of images) {
      try {
        // Convert image buffer to canvas for OCR
        const canvas = document.createElement('canvas')
        canvas.width = image.width
        canvas.height = image.height
        const ctx = canvas.getContext('2d')!
        
        const imageDataObj = new ImageData(
          new Uint8ClampedArray(image.buffer),
          image.width,
          image.height
        )
        ctx.putImageData(imageDataObj, 0, 0)
        
        // Perform OCR
        const { data: { text } } = await worker.recognize(canvas)
        
        // Check if text contains mathematical symbols or patterns
        if (containsMathematicalContent(text)) {
          const latex = convertToLatex(text)
          formulas.push({
            latex,
            x: image.x,
            y: image.y,
            width: image.width,
            height: image.height,
          })
        }
        
      } catch (error) {
        console.error('Error processing image for formulas:', error)
      }
    }
    
    await worker.terminate()
    
  } catch (error) {
    console.error('Error in formula processing:', error)
  }
  
  return formulas
}

function containsMathematicalContent(text: string): boolean {
  // Check for mathematical symbols and patterns
  const mathPatterns = [
    /[∫∑∏√±×÷≤≥≠≈∞∂∇]/,  // Mathematical symbols
    /\d+[\+\-\*\/]\d+/,      // Basic arithmetic
    /[a-zA-Z]\s*[=]\s*[a-zA-Z0-9\+\-\*\/\(\)]+/, // Equations
    /\b(sin|cos|tan|log|ln|exp|sqrt)\b/i, // Mathematical functions
    /\([a-zA-Z0-9\+\-\*\/\s]+\)/,       // Expressions in parentheses
  ]
  
  return mathPatterns.some(pattern => pattern.test(text))
}

function convertToLatex(text: string): string {
  // Basic conversion to LaTeX format
  let latex = text
  
  // Replace common mathematical symbols
  latex = latex.replace(/\*/g, '\\cdot ')
  latex = latex.replace(/\//g, '\\div ')
  latex = latex.replace(/sqrt\(([^)]+)\)/gi, '\\sqrt{$1}')
  latex = latex.replace(/\^([a-zA-Z0-9]+)/g, '^{$1}')
  latex = latex.replace(/_([a-zA-Z0-9]+)/g, '_{$1}')
  
  // Handle fractions (simple pattern)
  latex = latex.replace(/(\d+)\/(\d+)/g, '\\frac{$1}{$2}')
  
  // Handle common functions
  latex = latex.replace(/\b(sin|cos|tan|log|ln|exp)\b/gi, '\\$1')
  
  return latex
}

async function processPageContent(content: ExtractedContent, pageNum: number): Promise<Paragraph[]> {
  const paragraphs: Paragraph[] = []
  
  try {
    // Add page header
    paragraphs.push(
      new Paragraph({
        children: [
          new TextRun({
            text: `Trang ${pageNum}`,
            bold: true,
            size: 24,
          }),
        ],
        spacing: { after: 200 },
      })
    )
    
    // Process text content
    if (content.text) {
      const textParagraphs = content.text.split('\n').filter(line => line.trim())
      
      for (const textLine of textParagraphs) {
        paragraphs.push(
          new Paragraph({
            children: [
              new TextRun({
                text: textLine.trim(),
                size: 22,
              }),
            ],
            spacing: { after: 100 },
          })
        )
      }
    }
    
    // Process formulas
    for (const formula of content.formulas) {
      paragraphs.push(
        new Paragraph({
          children: [
            new TextRun({
              text: `Công thức: ${formula.latex}`,
              italics: true,
              size: 20,
            }),
          ],
          spacing: { after: 150 },
        })
      )
    }
    
  } catch (error) {
    console.error('Error processing page content:', error)
    // Add error message to document
    paragraphs.push(
      new Paragraph({
        children: [
          new TextRun({
            text: `Lỗi xử lý nội dung trang ${pageNum}`,
            color: 'FF0000',
            size: 20,
          }),
        ],
      })
    )
  }
  
  return paragraphs
}
