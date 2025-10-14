// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';

const SUBJECTS = ["Libft", "ft_printf", "Born2beroot", "get_next_line", "minitalk", "pipex", "push_swap", "so_long", "FdF", "fract-ol", "minishell", "Philosophers", "NetPractice", "cub3d", "miniRT", "CPP Module 00", "CPP Module 01", "CPP Module 02", "CPP Module 03", "CPP Module 04", "Inception", "ft_irc", "webserv", "CPP Module 05", "CPP Module 06", "CPP Module 07", "CPP Module 08", "CPP Module 09"];

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	const disposable = vscode.commands.registerCommand('42sub.openPdf', async () => {
		const subject = await vscode.window.showQuickPick(SUBJECTS, {
			placeHolder: 'Select which subject to open'
		});
		if (!subject) {
            return; // user cancelled
        }

        const panel = vscode.window.createWebviewPanel(
            'pdfViewer',
            `Subject PDF - ${subject}`,
            vscode.ViewColumn.One,
            {
                enableScripts: true,
                localResourceRoots: [vscode.Uri.file(path.join(context.extensionPath, 'media'))],
            }
        );

        const pdfPath = path.join(context.extensionPath, 'media', `${subject}.pdf`);
        // const pdfBase64 = fs.readFileSync(pdfPath).toString('base64');

        panel.webview.html = `
            <!DOCTYPE html>
            <html>
                <head>
                    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/5.4.149/pdf_viewer.min.css" integrity="sha512-qbvpAGzPFbd9HG4VorZWXYAkAnbwKIxiLinTA1RW8KGJEZqYK04yjvd+Felx2HOeKPDKVLetAqg8RIJqHewaIg==" crossorigin="anonymous" referrerpolicy="no-referrer" />
                    <style>
                        #pdf-container {
                            width: 100%;
                            max-width: 1000px;
                            margin: auto;
                            height: 100vh;
                            overflow-y: scroll;
                        }
                        canvas {
                            display: block;
                            margin: 10px auto;
                        }
                    </style>
                </head>
                <body>
                    <div id="pdf-container"></div>

                    <script type="module">
                        import * as pdfjsLib from 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/5.4.149/pdf.min.mjs';

                        pdfjsLib.GlobalWorkerOptions.workerSrc =
                            'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/5.4.149/pdf.worker.min.mjs';

                        const url = '${panel.webview.asWebviewUri(vscode.Uri.file(pdfPath))}';
                        const container = document.getElementById('pdf-container');
                        
                        let pdfDoc = null;
                        let canvases = [];
                        const scaleFactor = 2; // 👈 increase this for sharper rendering

                        function renderPage(pageNum) {
                            return pdfDoc.getPage(pageNum).then(page => {
                                const containerWidth = container.clientWidth;
                                const unscaledViewport = page.getViewport({ scale: 1 });
                                const scale = (containerWidth / unscaledViewport.width) * scaleFactor;
                                const viewport = page.getViewport({ scale });

                                let canvas = canvases[pageNum - 1];
                                let context;

                                if (!canvas) {
                                    canvas = document.createElement('canvas');
                                    canvases[pageNum - 1] = canvas;
                                    container.appendChild(canvas);
                                }

                                context = canvas.getContext('2d');
                                canvas.width = viewport.width;
                                canvas.height = viewport.height;

                                // scale down to container width
                                canvas.style.width = containerWidth + 'px';
                                canvas.style.height = (viewport.height / scaleFactor) + 'px';

                                return page.render({ canvasContext: context, viewport }).promise;
                            });
                        }

                        function renderAllPages() {
                            canvases.forEach(c => c.remove());
                            canvases = [];
                            for (let i = 1; i <= pdfDoc.numPages; i++) {
                                renderPage(i);
                            }
                        }

                        pdfjsLib.getDocument(url).promise.then(pdf => {
                            pdfDoc = pdf;
                            renderAllPages();
                        });

                        window.addEventListener('resize', () => {
                            if (pdfDoc) renderAllPages();
                        });
                    </script>
                </body>
            </html>
        `;
    });

    context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
export function deactivate() {}
