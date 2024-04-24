import opentype from 'opentype.js';
import archiver from 'archiver';
import fs from 'fs';

function toArrayBuffer(buffer: Buffer) {
    const arrayBuffer = new ArrayBuffer(buffer.length);
    const view = new Uint8Array(arrayBuffer);
    for (let i = 0; i < buffer.length; ++i) {
        view[i] = buffer[i];
    }
    return arrayBuffer;
}

export default defineEventHandler(async (event) => {
    const body = await readMultipartFormData(event);
    if (!body) {
        throw new Error('Body invalid');
    }
    try {
        const file = body[0].data;
        const arrayBufferFile = toArrayBuffer(file);
        // Set the appropriate content type and attachment header
        event.node.res.setHeader('Content-Type', 'application/zip');
        event.node.res.setHeader('Content-Disposition', 'attachment; filename="output.zip"');

        // Create a new archiver instance
        const archive = archiver('zip', {
            zlib: {level: 2} // Set compression level
        });

        // Pipe the archive to the response
        archive.pipe(event.node.res);

        // Parse the TTF font data
        const font = opentype.parse(arrayBufferFile);

        // Iterate through each glyph in the font
        Object.values(font.glyphs.glyphs).forEach(function (glyph: any, index: number) {
            // Create SVG path for the glyph
            const svgPath = glyph.getPath(0, 0, 1000).toSVG();

            // Add SVG path to the zip file
            archive.append(svgPath, {name: `glyph_${index}.svg`});
        });

        // Finalize the archive
        archive.finalize();
    } catch (error) {
        console.error('Error creating zip file:', error);
        event.node.res.statusCode = 500;
        event.node.res.end('Error creating zip file');
    }
});
