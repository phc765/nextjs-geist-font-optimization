Below is the detailed plan for implementing the PDF-to-DOCX conversion application with formula preservation, including all dependent files, step‐by‐step modifications, error handling, and UI/UX considerations.

---

**Project Overview**  
This Next.js application will let users upload a PDF (with Math, Physics, Chemistry content) and convert it to a DOCX file without losing formulas. The conversion will preserve formulas by keeping text-based formulas (in MathML/LaTeX) and running OCR (using Tesseract.js) on image formulas. The final output is downloadable and compatible with Microsoft Word. The app is built with the Next.js App Router, React, TypeScript, and TailwindCSS and will be deployable on Vercel.

---

**Dependent Files and Libraries**

1. **package.json**  
   - Ensure dependencies include:  
  - "react-dropzone" (for drag & drop uploads)  
  - "formidable" (or an equivalent like "multer" for parsing multipart/form-data)  
  - "docx" (for generating DOCX files)  
  - "pdfjs-dist" (for PDF text and image extraction)  
  - "tesseract.js" (for OCR on formula images)  
   - Update scripts and dependency versions as needed.

2. **tsconfig.json**  
   - Confirm that the configuration supports the "src" directory and strict TypeScript checks.

3. **src/app/globals.css**  
   - Add/modify CSS for overall styling, responsiveness, and custom classes (e.g. a spinner class, error message styling).

4. **UI/UX Files**  
   - **src/app/page.tsx** – Main file for the upload interface and client-side logic.  
   - Use plain text, typography, spacing, and layout (no external icons) for a modern and clean UI.

5. **Backend Files**  
   - **src/app/api/convert/route.ts** – API endpoint that receives the PDF upload, calls the conversion function, and returns the DOCX file.  
   - **src/lib/pdfConverter.ts** – Utility module containing the conversion logic that processes the PDF, runs OCR when needed, and uses the docx package to generate the final DOCX buffer.  

---

**Step-by-Step Outline of Changes**

1. **package.json**  
   - **Step 1:** Add dependencies for “react-dropzone”, “formidable” (or “multer”), “docx”, “pdfjs-dist”, and “tesseract.js”.  
   - **Step 2:** Run npm install to install and lock dependency versions.  
   - **Error Handling:** Address any installation issues and resolve version conflicts.

2. **tsconfig.json**  
   - **Step 1:** Ensure the “include” array contains “src” and strict mode is enabled.  
   - **Error Handling:** Fix any TypeScript errors upon compilation.

3. **src/app/globals.css**  
   - **Step 1:** Import TailwindCSS base styles and add custom classes:  
     - A spinner class (e.g., using animations via Tailwind’s animate-spin).  
     - Styles for error messages (red text, clear margin/padding).
   - **Error Handling:** Verify that new styles do not conflict with existing ones.

4. **src/app/page.tsx**  
   - **Step 1:** Create a functional React component using useState and useCallback.  
   - **Step 2:** Integrate react-dropzone to create a drag-and-drop area with instructions like “Drag and drop your PDF file here or click to upload”.  
   - **Step 3:** On file selection, validate that a PDF is chosen and send the file as multipart/form-data to the /api/convert endpoint.  
   - **Step 4:** Display a loading spinner (using the CSS class) while waiting for the conversion.  
   - **Step 5:** Once conversion succeeds, show a “Download Word” button that downloads the DOCX file.  
   - **Step 6:** Display error messages in case the upload or conversion fails.  
   - **Error Handling:** Wrap file upload action in try/catch and validate file type before sending.

   *Example snippet:*  
   ```tsx
   const onDrop = useCallback((acceptedFiles: File[]) => {
     if (acceptedFiles[0]?.type !== "application/pdf") {
       setError("File must be a PDF.");
       return;
     }
     // Set state, call upload API, show spinner...
   }, []);
   ```

5. **src/app/api/convert/route.ts**  
   - **Step 1:** Implement a POST handler in a new API route that receives a PDF file.  
   - **Step 2:** Use formidable (or multer) to parse multipart/form-data and extract the file buffer.  
   - **Step 3:** Validate that the file is indeed a PDF.  
   - **Step 4:** Call the conversion function from src/lib/pdfConverter.ts with the PDF buffer.  
   - **Step 5:** Return the resulting DOCX file buffer with headers:  
     - Content-Type: application/vnd.openxmlformats-officedocument.wordprocessingml.document  
     - Content-Disposition: attachment; filename="converted.docx"  
   - **Error Handling:** Use try/catch to catch errors during file parsing or conversion and return appropriate HTTP error responses with JSON messages.

6. **src/lib/pdfConverter.ts**  
   - **Step 1:** Export an async function called `convertPDFToDocx(pdfBuffer: Buffer): Promise<Buffer>`.  
   - **Step 2:** Utilize pdfjs-dist to extract text and images from the PDF.  
   - **Step 3:** For pages with formulas:  
     - Detect if formulas are embedded as text (preserve directly as MathML/LaTeX).  
     - If formulas are images, run OCR using tesseract.js to generate a LaTeX representation.  
   - **Step 4:** Use the docx package to build a DOCX document by inserting text and formula content.  
   - **Step 5:** Return the generated DOCX buffer.  
   - **Error Handling:** Catch and log conversion errors, returning clear error messages upward.

---

**UI/UX Considerations and Best Practices**

- The upload area is designed with ample spacing and clear instructions using modern typography and tailwind classes.  
- A CSS-based spinner (using animate-spin) provides real-time feedback during conversion.  
- The “Download Word” button is clearly visible after processing, styled with a modern button design.  
- All error messages are displayed below the upload area in a user-friendly manner.  
- Both client and server validations ensure only valid PDFs are processed.

---

**Summary**  
- Modified package.json to add react-dropzone, formidable, docx, pdfjs-dist, and tesseract.js.  
- Updated tsconfig.json for proper module resolution and strict type checking.  
- Enhanced globals.css with spinner and error styles using TailwindCSS.  
- Developed src/app/page.tsx for a modern, responsive drag-and-drop upload interface with progress feedback and a download button.  
- Created an API route in src/app/api/convert/route.ts that parses the PDF, calls conversion logic, and returns a downloadable DOCX.  
- Implemented conversion logic in src/lib/pdfConverter.ts, including text extraction, OCR processing for image formulas, and DOCX generation with preserved formulas.  
- Proper error handling, validations, and user-friendly UI feedback have been integrated.
