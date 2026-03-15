/**
 * Image Background Remover - Cloudflare Workers
 * 使用 Remove.bg API 去除图片背景
 */

const HTML = `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Image Background Remover</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      min-height: 100vh;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }
    .container {
      background: white;
      border-radius: 20px;
      padding: 40px;
      max-width: 600px;
      width: 100%;
      box-shadow: 0 20px 60px rgba(0,0,0,0.3);
    }
    h1 { text-align: center; color: #333; margin-bottom: 30px; }
    .upload-area {
      border: 3px dashed #667eea;
      border-radius: 12px;
      padding: 40px;
      text-align: center;
      cursor: pointer;
      transition: all 0.3s;
      margin-bottom: 20px;
    }
    .upload-area:hover { background: #f0f0ff; border-color: #764ba2; }
    .upload-area.dragover { background: #e0e0ff; border-color: #764ba2; }
    .upload-icon { font-size: 48px; margin-bottom: 10px; }
    .upload-text { color: #666; }
    #fileInput { display: none; }
    .btn {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border: none;
      padding: 15px 40px;
      border-radius: 8px;
      font-size: 16px;
      cursor: pointer;
      width: 100%;
      transition: transform 0.2s;
    }
    .btn:hover { transform: translateY(-2px); }
    .btn:disabled { opacity: 0.6; cursor: not-allowed; }
    .result {
      margin-top: 30px;
      display: none;
    }
    .result.show { display: block; }
    .preview {
      display: flex;
      gap: 20px;
      flex-wrap: wrap;
      justify-content: center;
    }
    .preview-item {
      flex: 1;
      min-width: 200px;
      text-align: center;
    }
    .preview-item img {
      max-width: 100%;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    }
    .preview-label {
      margin-top: 10px;
      color: #666;
      font-size: 14px;
    }
    .download-btn {
      display: inline-block;
      margin-top: 20px;
      background: #10b981;
      color: white;
      padding: 12px 30px;
      border-radius: 8px;
      text-decoration: none;
      font-weight: 500;
    }
    .download-btn:hover { background: #059669; }
    .loading {
      display: none;
      text-align: center;
      margin: 20px 0;
    }
    .loading.show { display: block; }
    .spinner {
      width: 40px;
      height: 40px;
      border: 4px solid #f3f3f3;
      border-top: 4px solid #667eea;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin: 0 auto;
    }
    @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
    .error {
      background: #fee;
      color: #c00;
      padding: 15px;
      border-radius: 8px;
      margin-top: 20px;
      display: none;
    }
    .error.show { display: block; }
    .tips {
      text-align: center;
      color: #999;
      font-size: 12px;
      margin-top: 20px;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>🖼️ Image Background Remover</h1>
    <div class="upload-area" id="uploadArea">
      <div class="upload-icon">📁</div>
      <div class="upload-text">点击或拖拽图片到这里</div>
      <div class="upload-text" style="font-size: 12px; margin-top: 8px;">支持 JPG, PNG</div>
    </div>
    <input type="file" id="fileInput" accept="image/jpeg,image/png">
    <button class="btn" id="processBtn" disabled>开始处理</button>
    <div class="loading" id="loading">
      <div class="spinner"></div>
      <p style="margin-top: 10px;">正在去除背景...</p>
    </div>
    <div class="error" id="error"></div>
    <div class="result" id="result">
      <div class="preview">
        <div class="preview-item">
          <img id="originalImg" src="" alt="原图">
          <div class="preview-label">原图</div>
        </div>
        <div class="preview-item">
          <img id="resultImg" src="" alt="去背结果">
          <div class="preview-label">去背结果</div>
        </div>
      </div>
      <div style="text-align: center;">
        <a class="download-btn" id="downloadBtn" download="removed-bg.png">⬇️ 下载透明背景图片</a>
      </div>
    </div>
    <div class="tips">Powered by Cloudflare Workers + Remove.bg</div>
  </div>
  <script>
    const uploadArea = document.getElementById('uploadArea');
    const fileInput = document.getElementById('fileInput');
    const processBtn = document.getElementById('processBtn');
    const loading = document.getElementById('loading');
    const result = document.getElementById('result');
    const error = document.getElementById('error');
    let selectedFile = null;

    uploadArea.addEventListener('click', () => fileInput.click());
    uploadArea.addEventListener('dragover', (e) => { e.preventDefault(); uploadArea.classList.add('dragover'); });
    uploadArea.addEventListener('dragleave', () => uploadArea.classList.remove('dragover'));
    uploadArea.addEventListener('drop', (e) => {
      e.preventDefault();
      uploadArea.classList.remove('dragover');
      if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]);
    });
    fileInput.addEventListener('change', (e) => { if (e.target.files[0]) handleFile(e.target.files[0]); });

    function handleFile(file) {
      if (!file.type.match(/image\\/jpeg|png/)) {
        showError('请上传 JPG 或 PNG 格式图片');
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        showError('图片大小不能超过 10MB');
        return;
      }
      selectedFile = file;
      document.querySelector('.upload-text').textContent = file.name;
      processBtn.disabled = false;
      error.classList.remove('show');
      result.classList.remove('show');
    }

    processBtn.addEventListener('click', async () => {
      if (!selectedFile) return;
      processBtn.disabled = true;
      loading.classList.add('show');
      error.classList.remove('show');
      result.classList.remove('show');

      try {
        const formData = new FormData();
        formData.append('image_file', selectedFile);
        formData.append('size', 'auto');

        const response = await fetch('/api/remove-bg', {
          method: 'POST',
          body: formData
        });

        if (!response.ok) {
          const err = await response.text();
          throw new Error(err || '处理失败');
        }

        const blob = await response.blob();
        const url = URL.createObjectURL(blob);

        document.getElementById('originalImg').src = URL.createObjectURL(selectedFile);
        document.getElementById('resultImg').src = url;
        document.getElementById('downloadBtn').href = url;

        result.classList.add('show');
      } catch (err) {
        showError(err.message || '处理失败，请重试');
      } finally {
        loading.classList.remove('show');
        processBtn.disabled = false;
      }
    });

    function showError(msg) {
      error.textContent = msg;
      error.classList.add('show');
    }
  </script>
</body>
</html>
`;

export default {
  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);

    // API 路由：调用 Remove.bg
    if (url.pathname === '/api/remove-bg' && request.method === 'POST') {
      return this.handleRemoveBg(request);
    }

    // 返回 HTML 页面
    return new Response(HTML, {
      headers: { 'Content-Type': 'text/html;charset=UTF-8' },
    });
  },

  async handleRemoveBg(request: Request): Promise<Response> {
    try {
      const apiKey = REMOVE_BG_API_KEY;
      if (!apiKey) {
        return new Response('API_KEY not configured', { status: 500 });
      }

      const formData = await request.formData();
      const imageFile = formData.get('image_file');
      if (!imageFile) {
        return new Response('No image file provided', { status: 400 });
      }

      // 调用 Remove.bg API
      const removeBgFormData = new FormData();
      removeBgFormData.append('image_file', imageFile);
      removeBgFormData.append('size', 'auto');

      const response = await fetch('https://api.remove.bg/v1.0/removebg', {
        method: 'POST',
        headers: { 'X-Api-Key': apiKey },
        body: removeBgFormData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        return new Response(`Remove.bg API error: ${errorText}`, { status: response.status });
      }

      const resultBlob = await response.blob();
      return new Response(resultBlob, {
        headers: {
          'Content-Type': 'image/png',
          'Content-Disposition': 'inline',
        },
      });
    } catch (error) {
      return new Response(`Error: ${error.message}`, { status: 500 });
    }
  },
} satisfies ExportedHandler;
