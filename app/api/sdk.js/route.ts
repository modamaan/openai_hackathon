import { NextRequest, NextResponse } from "next/server";

// Serves the JS snippet that creates the floating chat widget
export async function GET(request: NextRequest) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://your-domain.com";

  const script = `
(function() {
  var BOT_ID = document.currentScript && document.currentScript.getAttribute('data-bot-id');
  if (!BOT_ID) { console.error('[Replyo] data-bot-id attribute is missing'); return; }

  var APP_URL = '${appUrl}';
  var SESSION_KEY = 'replyo_session_' + BOT_ID;
  var sessionId = localStorage.getItem(SESSION_KEY) || crypto.randomUUID();
  localStorage.setItem(SESSION_KEY, sessionId);

  // Load Marked.js to parse markdown safely
  var scriptTag = document.createElement('script');
  scriptTag.src = "https://cdn.jsdelivr.net/npm/marked/marked.min.js";
  document.head.appendChild(scriptTag);

  // Inject styles
  var style = document.createElement('style');
  style.textContent = \`
    #replyo-widget { position: fixed; bottom: 24px; right: 24px; z-index: 999999; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; }
    #replyo-btn { width: 60px; height: 60px; border-radius: 50%; background: linear-gradient(135deg, #10b981, #059669); border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 20px rgba(16, 185, 129, 0.4); transition: all 0.3s cubic-bezier(0.25, 1, 0.5, 1); z-index: 2; position: relative; }
    #replyo-btn:hover { transform: scale(1.05) translateY(-2px); box-shadow: 0 8px 25px rgba(16, 185, 129, 0.5); }
    #replyo-btn svg { width: 28px; height: 28px; fill: white; transition: transform 0.3s; }
    #replyo-btn.active svg { transform: rotate(90deg) scale(0); opacity: 0; }
    
    #replyo-close-icon { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; transform: rotate(-90deg) scale(0); opacity: 0; transition: all 0.3s; pointer-events: none; }
    #replyo-close-icon svg { width: 24px; height: 24px; stroke: white; stroke-width: 2.5; stroke-linecap: round; stroke-linejoin: round; fill: none; }
    #replyo-btn.active #replyo-close-icon { transform: rotate(0deg) scale(1); opacity: 1; }

    #replyo-panel { position: absolute; bottom: 80px; right: 0; width: 360px; max-height: calc(100vh - 120px); height: 600px; background: rgba(18, 18, 22, 0.95); backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); border: 1px solid rgba(255,255,255,0.08); border-radius: 20px; overflow: hidden; display: flex; flex-direction: column; box-shadow: 0 20px 40px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.05); transform-origin: bottom right; transform: scale(0.95) translateY(10px); opacity: 0; pointer-events: none; transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1); }
    #replyo-panel.open { transform: scale(1) translateY(0); opacity: 1; pointer-events: auto; }
    
    #replyo-header { background: rgba(255,255,255,0.03); padding: 20px; border-bottom: 1px solid rgba(255,255,255,0.08); display: flex; flex-direction: column; gap: 4px; }
    #replyo-header-title { color: white; font-weight: 600; font-size: 16px; display: flex; align-items: center; gap: 8px; }
    #replyo-header-status { color: #10b981; font-size: 12px; font-weight: 500; display: flex; align-items: center; gap: 6px; }
    #replyo-header-status-dot { width: 8px; height: 8px; border-radius: 50%; background: #10b981; box-shadow: 0 0 8px #10b981; animation: pulse 2s infinite; }
    @keyframes pulse { 0% { opacity: 0.6; } 50% { opacity: 1; } 100% { opacity: 0.6; } }

    #replyo-msgs { flex: 1; overflow-y: auto; padding: 20px; display: flex; flex-direction: column; gap: 16px; scroll-behavior: smooth; }
    #replyo-msgs::-webkit-scrollbar { width: 4px; }
    #replyo-msgs::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }

    .ro-msg-wrapper { display: flex; flex-direction: column; gap: 4px; }
    .ro-msg { max-width: 85%; padding: 12px 16px; border-radius: 16px; font-size: 14px; line-height: 1.5; color: rgba(255,255,255,0.9); word-wrap: break-word; }
    .ro-user-wrapper { align-items: flex-end; }
    .ro-user { background: #10b981; color: white; border-bottom-right-radius: 4px; }
    .ro-bot-wrapper { align-items: flex-start; }
    .ro-bot { background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.05); border-bottom-left-radius: 4px; }
    .ro-time { font-size: 10px; color: rgba(255,255,255,0.3); padding: 0 4px; }
    
    /* Markdown Styling */
    .ro-bot p { margin: 0 0 10px 0; }
    .ro-bot p:last-child { margin: 0; }
    .ro-bot a { color: #34d399; text-decoration: none; font-weight: 500; }
    .ro-bot a:hover { text-decoration: underline; }
    .ro-bot strong { color: white; font-weight: 600; }
    .ro-bot code { background: rgba(0,0,0,0.3); padding: 2px 6px; border-radius: 4px; font-family: monospace; font-size: 12px; }
    .ro-bot pre { background: rgba(0,0,0,0.3); padding: 12px; border-radius: 8px; overflow-x: auto; margin: 10px 0; }
    .ro-bot pre code { background: none; padding: 0; }
    .ro-bot ul, .ro-bot ol { margin: 10px 0; padding-left: 20px; }

    /* Suggested Questions (Pills) */
    .ro-pills { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 12px; transition: opacity 0.3s; }
    .ro-pill { background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.2); color: #10b981; padding: 8px 14px; border-radius: 20px; font-size: 13px; font-weight: 500; cursor: pointer; transition: all 0.2s; white-space: nowrap; font-family: inherit; }
    .ro-pill:hover { background: rgba(16, 185, 129, 0.2); border-color: rgba(16, 185, 129, 0.4); transform: translateY(-1px); color: white; }
    
    .ro-typing { display: flex; gap: 4px; align-items: center; height: 20px; }
    .ro-dot { width: 6px; height: 6px; background: rgba(255,255,255,0.4); border-radius: 50%; animation: jump 1.4s infinite ease-in-out both; }
    .ro-dot:nth-child(1) { animation-delay: -0.32s; }
    .ro-dot:nth-child(2) { animation-delay: -0.16s; }
    @keyframes jump { 0%, 80%, 100% { transform: scale(0); } 40% { transform: scale(1); } }

    #replyo-form { display: flex; padding: 16px; gap: 10px; border-top: 1px solid rgba(255,255,255,0.06); background: rgba(0,0,0,0.2); }
    #replyo-input { flex: 1; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; padding: 12px 16px; color: white; font-size: 14px; outline: none; transition: border-color 0.2s; }
    #replyo-input:focus { border-color: rgba(16, 185, 129, 0.5); }
    #replyo-input::placeholder { color: rgba(255,255,255,0.3); }
    #replyo-send { background: #10b981; border: none; border-radius: 12px; padding: 0 16px; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; justify-content: center; }
    #replyo-send:hover { background: #059669; }
    #replyo-send:disabled { background: rgba(255,255,255,0.1); cursor: not-allowed; }
    #replyo-send svg { width: 18px; height: 18px; fill: white; margin-left: 2px; }

    #replyo-mic { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; padding: 0 14px; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; justify-content: center; }
    #replyo-mic:hover { background: rgba(255,255,255,0.1); }
    #replyo-mic svg { width: 18px; height: 18px; fill: rgba(255,255,255,0.6); }
    #replyo-mic.recording { background: rgba(239, 68, 68, 0.2); border-color: rgba(239, 68, 68, 0.5); animation: pulseRecord 1.5s infinite; }
    #replyo-mic.recording svg { fill: #ef4444; }
    @keyframes pulseRecord { 0% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.4); } 70% { box-shadow: 0 0 0 6px rgba(239, 68, 68, 0); } 100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); } }

    @media (max-width: 480px) {
      #replyo-panel { bottom: 0; right: 0; width: 100%; height: 100vh; max-height: 100vh; border-radius: 0; transform: translateY(100%); }
      #replyo-btn { bottom: 16px; right: 16px; }
      #replyo-panel.open { transform: translateY(0); }
    }
  \`;
  document.head.appendChild(style);

  // Build HTML
  var widget = document.createElement('div');
  widget.id = 'replyo-widget';
  widget.innerHTML = \`
    <div id="replyo-panel">
      <div id="replyo-header">
        <div id="replyo-header-title">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="#10b981"><path d="M12 2C6.48 2 2 6.03 2 11c0 2.56 1.16 4.88 3.03 6.55.15.13.25.32.22.52-.16 1.13-.53 2.15-1.02 3.02-.13.23.08.49.33.43 2.1-.5 4.05-1.4 5.56-2.61.16-.13.36-.18.56-.15 1.05.15 2.15.24 3.32.24 5.52 0 10-4.03 10-9s-4.48-9-10-9zm1 14h-2v-2h2v2zm0-4h-2V7h2v5z"/></svg>
          Support Assistant
        </div>
        <div id="replyo-header-status">
          <div id="replyo-header-status-dot"></div>
          We typically reply instantly
        </div>
      </div>
      <div id="replyo-msgs"></div>
      <form id="replyo-form">
        <input id="replyo-input" placeholder="Ask me anything..." autocomplete="off" />
        <button id="replyo-mic" type="button" title="Voice Input">
          <svg viewBox="0 0 24 24"><path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5-3c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/></svg>
        </button>
        <button id="replyo-send" type="submit" disabled>
          <svg viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
        </button>
      </form>
    </div>
    <button id="replyo-btn" title="Chat with us">
      <svg viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/></svg>
      <div id="replyo-close-icon"><svg viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg></div>
    </button>
  \`;
  document.body.appendChild(widget);

  var panel = document.getElementById('replyo-panel');
  var btn = document.getElementById('replyo-btn');
  var msgs = document.getElementById('replyo-msgs');
  var form = document.getElementById('replyo-form');
  var input = document.getElementById('replyo-input');
  var sendBtn = document.getElementById('replyo-send');
  var micBtn = document.getElementById('replyo-mic');

  var isOpen = false;

  function toggle() {
    isOpen = !isOpen;
    if (isOpen) {
      panel.classList.add('open');
      btn.classList.add('active');
      setTimeout(() => input.focus(), 300);
      if (msgs.children.length === 0) {
        loadHistory();
      }
    } else {
      panel.classList.remove('open');
      btn.classList.remove('active');
    }
  }

  btn.addEventListener('click', toggle);

  input.addEventListener('input', function() {
    sendBtn.disabled = input.value.trim().length === 0;
  });

  function appendMsg(text, sender, isMarkdown = false) {
    var wrapper = document.createElement('div');
    wrapper.className = 'ro-msg-wrapper ro-' + sender + '-wrapper';
    
    var div = document.createElement('div');
    div.className = 'ro-msg ro-' + sender;
    
    if (isMarkdown && window.marked && text) {
      div.innerHTML = marked.parse(text, { breaks: true });
    } else {
      div.textContent = text;
    }
    
    var time = document.createElement('div');
    time.className = 'ro-time';
    var now = new Date();
    time.textContent = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    wrapper.appendChild(div);
    wrapper.appendChild(time);
    msgs.appendChild(wrapper);
    msgs.scrollTop = msgs.scrollHeight;
    return div;
  }

  function appendTyping() {
    var wrapper = document.createElement('div');
    wrapper.className = 'ro-msg-wrapper ro-bot-wrapper';
    wrapper.id = 'replyo-typing';
    var div = document.createElement('div');
    div.className = 'ro-msg ro-bot ro-typing';
    div.innerHTML = '<div class="ro-dot"></div><div class="ro-dot"></div><div class="ro-dot"></div>';
    wrapper.appendChild(div);
    msgs.appendChild(wrapper);
    msgs.scrollTop = msgs.scrollHeight;
    return wrapper;
  }

  async function loadHistory() {
    try {
      var res = await fetch(APP_URL + '/api/chat/history?botId=' + BOT_ID + '&sessionId=' + sessionId);
      if (!res.ok) throw new Error();
      var data = await res.json();
      
      if (data.botName) {
        var titleEl = document.getElementById('replyo-header-title');
        if (titleEl) {
          titleEl.innerHTML = '<svg viewBox="0 0 24 24" width="20" height="20" fill="#10b981"><path d="M12 2C6.48 2 2 6.03 2 11c0 2.56 1.16 4.88 3.03 6.55.15.13.25.32.22.52-.16 1.13-.53 2.15-1.02 3.02-.13.23.08.49.33.43 2.1-.5 4.05-1.4 5.56-2.61.16-.13.36-.18.56-.15 1.05.15 2.15.24 3.32.24 5.52 0 10-4.03 10-9s-4.48-9-10-9zm1 14h-2v-2h2v2zm0-4h-2V7h2v5z"/></svg>' + " " + data.botName;
        }
      }

      if (data.messages && data.messages.length > 0) {
        data.messages.forEach(msg => {
          appendMsg(msg.content, msg.role, msg.role === 'assistant');
        });
      } else {
        // Default welcome message dynamically using the bot name
        var greeting = 'Hi there! 👋 Welcome to ' + (data.botName || 'Support') + '. How can I help you today?';
        var botDiv = appendMsg(greeting, 'bot', false);
        
        // Render Frequent Questions if any
        if (data.suggestedQuestions && data.suggestedQuestions.length > 0) {
          var pills = document.createElement('div');
          pills.className = 'ro-pills';
          data.suggestedQuestions.forEach(function(q) {
            var pill = document.createElement('button');
            pill.className = 'ro-pill';
            pill.textContent = q;
            pill.type = 'button'; // prevent form submission side effects
            pill.onclick = function() {
              input.value = q;
              sendBtn.disabled = false;
              form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
              pills.style.opacity = '0';
              setTimeout(function() { pills.style.display = 'none'; }, 300);
            };
            pills.appendChild(pill);
          });
          botDiv.parentNode.appendChild(pills);
        }
      }
    } catch(e) {
      appendMsg('Hi there! 👋 How can I help you today?', 'bot', false);
    }
  }

  // Voice Recording Logic
  var mediaRecorder;
  var audioChunks = [];
  var isRecording = false;

  micBtn.addEventListener('click', async function() {
    if (isRecording) {
      mediaRecorder.stop();
      return;
    }

    try {
      var stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder = new MediaRecorder(stream);
      audioChunks = [];

      mediaRecorder.ondataavailable = function(event) {
        if (event.data.size > 0) audioChunks.push(event.data);
      };

      mediaRecorder.onstop = async function() {
        isRecording = false;
        micBtn.classList.remove('recording');
        stream.getTracks().forEach(function(track) { track.stop(); });

        if (audioChunks.length === 0) return;
        
        var audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
        var formData = new FormData();
        formData.append('file', audioBlob, 'audio.webm');
        
        input.placeholder = "Processing voice...";
        input.disabled = true;
        micBtn.disabled = true;

        var tempTyping = appendTyping();

        try {
          var res = await fetch(APP_URL + '/api/voice', {
            method: 'POST',
            body: formData
          });
          if (!res.ok) throw new Error();
          var data = await res.json();
          if (data.text) {
             tempTyping.remove();
             input.disabled = false;
             micBtn.disabled = false;
             input.placeholder = "Ask me anything...";
             input.value = data.text;
             sendBtn.disabled = false;
             form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
          } else { throw new Error(); }
        } catch(e) {
          tempTyping.remove();
          input.disabled = false;
          micBtn.disabled = false;
          input.placeholder = "Ask me anything...";
          appendMsg("Sorry, we couldn't process your voice.", 'bot', false);
        }
      };

      mediaRecorder.start();
      isRecording = true;
      micBtn.classList.add('recording');

    } catch (err) {
      console.error(err);
      appendMsg("Microphone access denied or not supported in your browser.", "bot", false);
    }
  });

  form.addEventListener('submit', async function(e) {
    e.preventDefault();
    var text = input.value.trim();
    if (!text) return;
    
    input.value = '';
    sendBtn.disabled = true;
    appendMsg(text, 'user', false);

    var typingUI = appendTyping();

    try {
      var res = await fetch(APP_URL + '/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ botId: BOT_ID, message: text, sessionId: sessionId })
      });

      typingUI.remove();

      var reader = res.body.getReader();
      var decoder = new TextDecoder();
      var content = '';
      
      var botDiv = appendMsg('', 'bot', true);

      while (true) {
        var result = await reader.read();
        if (result.done) break;
        var chunk = decoder.decode(result.value, { stream: true });
        for (var line of chunk.split('\\n')) {
          if (line.startsWith('0:')) {
            try { 
              content += JSON.parse(line.slice(2)); 
              if (window.marked) {
                botDiv.innerHTML = marked.parse(content, { breaks: true });
              } else {
                botDiv.textContent = content; 
              }
            } catch(e) {}
          }
        }
        msgs.scrollTop = msgs.scrollHeight;
      }
    } catch(err) {
      if (document.getElementById('replyo-typing')) typingUI.remove();
      appendMsg('Sorry, something went wrong. Please try again.', 'bot', false);
    }
  });
})();
`;

  return new NextResponse(script, {
    headers: {
      "Content-Type": "application/javascript",
      "Cache-Control": "no-store, max-age=0",
      "Access-Control-Allow-Origin": "*",
    },
  });
}
